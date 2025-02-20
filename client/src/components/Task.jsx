import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Task({ id, task, handleOnDrag, type }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      className="task"
      key={id}
      draggable
      onDragStart={(e) => handleOnDrag(e, type, task)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {task}

      {isHovered && (
        <div className="task-buttons">
          <IconButton>
            <EditIcon />
          </IconButton>
          <IconButton>
            <DeleteIcon />
          </IconButton>
        </div>
      )}
    </div>
  );
}
