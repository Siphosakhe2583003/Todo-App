import React, { useState } from "react";
import { Modal, Box, Button, TextField, IconButton } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel"

export default function EditTask({ open, onClose, editTask, content }) {
  const [taskText, setTaskText] = useState(content);
  const [count, setCount] = useState(taskText.length)
  const MAX_CHARS = 256;

  const handleUpdate = (e) => {
    const newText = e.target.value;
    if (newText.length > MAX_CHARS) return;
    setTaskText(newText);
    setCount(newText.length);
  };

  const save = () => {
    // NOTE: Think about it later, must be able to save the task in a convinient way
    if (taskText.trim() === "") return;
    editTask(taskText);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-title" className="modal">
      <Box className="modal-content">
        <Box className="modal-header">
          <h3 id="modal-title">Edit Task</h3>
          <IconButton onClick={onClose}>
            <CancelIcon sx={{
              color: '#00ADB5',
            }}></CancelIcon>
          </IconButton>
        </Box>
        <Box className="modal-body">
          <TextField
            multiline
            className="task-input"
            placeholder="Add your task..."
            value={taskText}
            onChange={handleUpdate}
            minRows={4}
          />
          <p id="char-count">{count}/{MAX_CHARS}</p>

        </Box>
        <Box className="modal-buttons">
          <Button
            onClick={save}
            variant="contained"
            color="#101218"
            sx={{
              '&:hover': {
                backgroundColor: '#00ADB5',
              },
              '&:active': {
                backgroundColor: 'lightblue',
              },
              border: "2px solid #00ADB5"
            }}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
