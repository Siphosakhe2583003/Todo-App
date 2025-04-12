import { useState, useCallback } from "react";
import { PropTypes } from "prop-types"
import { FormControl, Modal, Box, Button, TextField, IconButton, InputLabel, MenuItem, Select } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel"

export default function AddTask({ open, onClose, addTask }) {
  const [taskText, setTaskText] = useState("");
  const [taskPriority, setTaskPriority] = useState("LOW");
  const [count, setCount] = useState(taskText.length)
  const MAX_CHARS = 1024;
  const priorityColors = {
    HIGH: "high-color",
    MEDIUM: "medium-color",
    LOW: "low-color",
  };
  const callbackRef = useCallback(inputElement => {

    if (inputElement) {
      setTimeout(() => inputElement.focus(), 20);

    }
  }, []);
  const handleUpdate = (e) => {
    const newText = e.target.value;
    if (newText.length > MAX_CHARS) return;

    setTaskText(newText);
    setCount(newText.length);
  };

  const handlePriority = (e) => {
    setTaskPriority(e.target.value);
  }

  const save = () => {
    if (taskText.trim() === "") return;
    addTask(taskText, taskPriority);
    setTaskText(""); // Clear input after saving
    setCount(0);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-title" className="modal" >
      <Box className="modal-content">
        <Box className="modal-header">
          <h3 id="modal-title">Add Task</h3>
          <IconButton onClick={onClose}>
            <CancelIcon sx={{
              color: "var(--tertiary-color)",
            }}></CancelIcon>
          </IconButton>
        </Box>
        <Box className="modal-body">
          <TextField
            multiline
            inputRef={callbackRef}
            className="task-input"
            placeholder="Add your task..."
            value={taskText}
            onChange={handleUpdate}
            minRows={4}
          />
          <p id="char-count">{count}/{MAX_CHARS}</p>

        </Box>
        <Box className="modal-buttons">
          <FormControl className="modal-priority">
            <Box>
              <InputLabel id="priority-label">Priority</InputLabel >
              <Select
                labelId="priority-label"
                id="priority-dropdown"
                value={taskPriority}
                onChange={handlePriority}
                label="Priority"
                renderValue={(selected) => (
                  <div className="priority-selected">
                    <span className={`priority-color ${priorityColors[selected]}`}></span>
                    {selected.charAt(0) + selected.slice(1).toLowerCase()} {/* Capitalize */}
                  </div>
                )}
              >
                <MenuItem value={"HIGH"} className="priority-option">
                  <span className="priority-color high-color"></span> High
                </MenuItem>
                <MenuItem value={"MEDIUM"} className="priority-option">
                  <span className="priority-color medium-color"></span> Medium
                </MenuItem>
                <MenuItem value={"LOW"} className="priority-option">
                  <span className="priority-color low-color"></span> Low
                </MenuItem>
              </Select>
            </Box>
          </FormControl>
          <Button
            onClick={save}
            variant="contained"
            color="var(--tertiary-color)"
            sx={{
              '&:hover': {
                backgroundColor: 'var(--tertiary-color)',
              },
              '&:active': {
                backgroundColor: "var(--primary-color)",
              },
              border: "2px solid var(--tertiary-color)"
            }}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}


AddTask.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  addTask: PropTypes.func.isRequired,
};
