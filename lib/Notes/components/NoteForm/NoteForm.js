import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Form } from 'react-final-form';
import { get } from 'lodash';
import { AppIcon } from '@folio/stripes-core';

import {
  Accordion,
  AccordionSet,
  ExpandAllButton,
  Pane,
  Paneset,
  Row,
  Col,
  IconButton,
  Button,
  Callout,
  PaneFooter,
} from '@folio/stripes-components';

import NoteFields from './components/NoteFields';
import NavigationModal from '../NavigationModal';
import AssignmentsList from '../AssignmentsList';
import ReferredRecord from '../ReferredRecord';
import NoteMetadata from '../NoteMetadata';

import {
  noteDataShape,
  noteTypesShape,
  referredEntityDataShape,
} from './noteShapes';

import { MAX_TITLE_LENGTH } from '../../constants';

import styles from './NoteForm.css';

export default class NoteForm extends Component {
  static propTypes = {
    createFormTitle: PropTypes.node.isRequired,
    entityTypePluralizedTranslationKeys: PropTypes.objectOf(PropTypes.string),
    entityTypeTranslationKeys: PropTypes.objectOf(PropTypes.string).isRequired,
    navigateBack: PropTypes.func.isRequired,
    noteData: noteDataShape,
    noteMetadata: PropTypes.shape({
      createdBy: PropTypes.string,
      createdDate: PropTypes.string,
      lastUpdatedBy: PropTypes.string,
      lastUpdatedDate: PropTypes.string,
    }),
    noteTypes: noteTypesShape.isRequired,
    onSubmit: PropTypes.func.isRequired,
    paneHeaderAppIcon: PropTypes.string.isRequired,
    referredEntityData: PropTypes.oneOfType([
      referredEntityDataShape,
      PropTypes.bool
    ]),
    renderReferredRecord: PropTypes.func,
    showDisplayAsPopupOptions: PropTypes.bool.isRequired,
    submitIsPending: PropTypes.bool.isRequired,
    submitSucceeded: PropTypes.bool.isRequired,
  };

  state = {
    sections: {
      noteForm: true,
      assigned: false,
    }
  };

  componentDidMount() {
    if (!this.areNoteTypesPresent()) {
      this.displayMissingNoteTypesNotification();
    }
  }

  detailsEditorRef = React.createRef();
  calloutRef = React.createRef();
  sortedNoteTypes = this.getSortedNoteTypes();

  getSortedNoteTypes() {
    return [...this.props.noteTypes].sort(this.compareNoteTypes);
  }

  compareNoteTypes(a, b) {
    return a.label.localeCompare(b.label);
  }

  displayMissingNoteTypesNotification() {
    this.calloutRef.current.sendCallout({
      type: 'error',
      message: <FormattedMessage id="stripes-smart-components.notes.noteTypesMissing" />,
      timeout: 0,
    });
  }

  handleSectionToggle = ({ id }) => {
    this.setState(prevState => ({
      sections: {
        ...prevState.sections,
        [id]: !prevState.sections[id],
      }
    }));
  }

  handleToggleAll = (toggledSections) => {
    this.setState({
      sections: toggledSections,
    });
  }

  renderPaneFooter(handleSubmit, pristine) {
    const {
      navigateBack,
      submitIsPending,
    } = this.props;

    const noteTypesExist = this.areNoteTypesPresent();

    const cancelButton = (
      <Button
        data-test-cancel-editing-note-form
        buttonStyle="default mega"
        id="clickable-cancel"
        marginBottom0
        onClick={navigateBack}
      >
        <FormattedMessage id="stripes-components.cancel" />
      </Button>
    );

    const saveButton = (
      <Button
        buttonStyle="primary mega"
        data-test-save-note
        disabled={pristine || submitIsPending || !noteTypesExist}
        marginBottom0
        onClick={handleSubmit}
        type="submit"
      >
        <FormattedMessage id="stripes-components.saveAndClose" />
      </Button>
    );

    return (
      <PaneFooter
        renderStart={cancelButton}
        renderEnd={saveButton}
      />
    );
  }

  renderExpandAllButton = () => {
    return (
      <Row end="xs">
        <Col xs>
          <ExpandAllButton
            accordionStatus={this.state.sections}
            onToggle={this.handleToggleAll}
            id="clickable-expand-all"
          />
        </Col>
      </Row>
    );
  }

  renderFirstMenu = () => {
    const { navigateBack } = this.props;

    return (
      <FormattedMessage id="stripes-smart-components.cancelEdit">
        {([ariaLabel]) => (
          <IconButton
            icon="times"
            onClick={navigateBack}
            data-test-leave-note-form
            aria-label={ariaLabel}
          />
        )}
      </FormattedMessage>
    );
  }

  renderReferredRecordElement() {
    const {
      renderReferredRecord,
      referredEntityData,
      entityTypeTranslationKeys,
    } = this.props;

    return renderReferredRecord
      ? renderReferredRecord()
      : (
        <ReferredRecord
          referredEntityData={referredEntityData}
          entityTypeTranslationKeys={entityTypeTranslationKeys}
        />
      );
  }

  isEditForm = () => {
    return !!this.props.noteData;
  }

  areNoteTypesPresent() {
    return this.props.noteTypes.length;
  }

  validateFormFields = (values) => {
    const { title } = values;
    const errors = {};

    if (!title) {
      errors.title = (
        <span data-test-title-missing-error>
          <FormattedMessage id="stripes-smart-components.notes.title.missing" />
        </span>
      );
    } else if (title.length > MAX_TITLE_LENGTH) {
      errors.title = this.renderCharacterLimitExceededError('title');
    }

    return errors;
  }

  renderCharacterLimitExceededError(fieldName) {
    return (
      <span data-test-character-limit-error={fieldName}>
        <FormattedMessage id={`stripes-smart-components.notes.${fieldName}.lengthLimitExceeded`} />
      </span>
    );
  }

  render() {
    const {
      createFormTitle,
      onSubmit,
      referredEntityData,
      noteData,
      entityTypePluralizedTranslationKeys,
      paneHeaderAppIcon,
      submitSucceeded,
      noteMetadata,
      showDisplayAsPopupOptions,
    } = this.props;

    const {
      noteForm,
      assigned,
    } = this.state.sections;

    const isEditForm = this.isEditForm();
    const links = get(noteData, 'links', []);

    const paneTitle = isEditForm
      ? (
        <FormattedMessage
          id="stripes-smart-components.notes.editNoteTitle"
          values={{ noteTitle: noteData.title }}
        />
      )
      : createFormTitle;

    const paneTitleAppIcon = <AppIcon app={paneHeaderAppIcon} size="small" />;
    const noteTypeInitialValue = isEditForm
      ? noteData.type
      : get(this.sortedNoteTypes, '[0].value');

    const popUpValues = showDisplayAsPopupOptions
      ? {
        popUpOnCheckOut: !!noteData?.popUpOnCheckOut,
        popUpOnUser: !!noteData?.popUpOnUser,
      }
      : {};

    const initialValues = {
      ...noteData,
      ...popUpValues,
      type: noteTypeInitialValue,
    };

    return (
      <Form
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={this.validateFormFields}
      >
        {({ handleSubmit, pristine }) => (
          <>
            <Paneset>
              <Pane
                paneTitle={paneTitle}
                appIcon={paneTitleAppIcon}
                firstMenu={this.renderFirstMenu()}
                defaultWidth="100%"
                footer={this.renderPaneFooter(handleSubmit, pristine)}
                id="notes-form"
              >
                <form onSubmit={handleSubmit}>
                  <div className={styles['note-form-content']}>
                    {this.renderExpandAllButton()}
                    <AccordionSet>
                      <Accordion
                        label={<FormattedMessage id="stripes-smart-components.notes.generalInformation" />}
                        id="noteForm"
                        open={noteForm}
                        separator={false}
                        onToggle={this.handleSectionToggle}
                      >
                        {isEditForm && <NoteMetadata noteMetadata={noteMetadata} />}
                        <NoteFields
                          noteTypes={this.sortedNoteTypes}
                          detailsEditorRef={this.detailsEditorRef}
                          showDisplayAsPopupOptions={showDisplayAsPopupOptions}
                        />
                      </Accordion>
                      <Accordion
                        label={<FormattedMessage id="stripes-smart-components.notes.assigned" />}
                        id="assigned"
                        open={assigned}
                        closedByDefault
                        onToggle={this.handleSectionToggle}
                      >
                        {referredEntityData && this.renderReferredRecordElement()}
                        <AssignmentsList
                          links={links}
                          entityTypePluralizedTranslationKeys={entityTypePluralizedTranslationKeys}
                        />
                      </Accordion>
                    </AccordionSet>
                  </div>
                </form>
              </Pane>
            </Paneset>
            <NavigationModal when={!pristine && !submitSucceeded} />
            <Callout ref={this.calloutRef} />
          </>
        )}
      </Form>
    );
  }
}
