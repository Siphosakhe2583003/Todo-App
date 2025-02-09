import React, { useState } from "react";
import { Modal, Box, Button, TextField, IconButton } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel"

export default function AddTask({ open, onClose, addTask }) {
  const [taskText, setTaskText] = useState("");
  const [count, setCount] = useState(taskText.length)
  const MAX_CHARS = 256;

  const handleUpdate = (e) => {
    const newText = e.target.value;
    if (newText.length > MAX_CHARS) return;

    setTaskText(newText);
    setCount(newText.length);
  };

  const save = () => {
    if (taskText.trim() === "") return; // Prevent empty tasks
    addTask(taskText); // Pass task to parent
    setTaskText(""); // Clear input after saving
    setCount(0);
    onClose(); // Close modal
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-title" className="modal">
      <Box className="modal-content">
        <Box className="modal-header">
          <h3 id="modal-title">Add Task</h3>
          <IconButton onClick={onClose}>
            <CancelIcon></CancelIcon>
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
