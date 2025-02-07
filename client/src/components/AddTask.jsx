import React, { useState } from "react";
import { Modal, Box, Button, TextField } from "@mui/material";

export default function AddTask({ open, onClose, addTask }) {
  const [taskText, setTaskText] = useState("");

  const save = () => {
    if (taskText.trim() === "") return; // Prevent empty tasks
    addTask(taskText); // Pass task to parent
    setTaskText(""); // Clear input after saving
    onClose(); // Close modal
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-title">
      <Box
        sx={{
          p: 3,
          bgcolor: "white",
          width: 300,
          margin: "auto",
          mt: 10,
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <h2 id="modal-title">Add Task</h2>

        <TextField
          multiline
          placeholder="Add your task..."
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
        />

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button variant="contained" color="primary" onClick={save}>
            Save
          </Button>
          <Button variant="outlined" color="secondary" onClick={onClose}>
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
