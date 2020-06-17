import React from 'react';
import PropTypes from 'prop-types';
import {
  Draggable
} from 'react-beautiful-dnd';

import DraggableRow from './DraggableRow';

const propTypes = {
  rowData: PropTypes.object,
  rowIndex: PropTypes.number,
  rowProps: PropTypes.shape({
    isDraggingOver: PropTypes.bool,
    isRowDraggable: PropTypes.bool,
    isSingleSelect: PropTypes.bool,
    placeholder: PropTypes.node.isRequired,
    rowsCount: PropTypes.number.isRequired,
  }),
};

export default function draggableRowFormatter(props) {
  const {
    rowIndex,
    rowData,
    rowProps: {
      isRowDraggable,
      rowsCount,
      isDraggingOver,
      placeholder,
    },
  } = props;

  const shouldRenderPlaceholder = isDraggingOver && (rowsCount === rowIndex + 1);

  return (
    <Draggable
      key={rowData.id}
      draggableId={rowData.id}
      index={rowIndex}
      isDragDisabled={!isRowDraggable(rowData, rowIndex)}
    >
      {(provided, snapshot) => (
        <>
          <DraggableRow
            provided={provided}
            snapshot={snapshot}
            {...props}
          />
          {
            shouldRenderPlaceholder ? placeholder : null
          }
        </>
      )}
    </Draggable>
  );
}

draggableRowFormatter.propTypes = propTypes;