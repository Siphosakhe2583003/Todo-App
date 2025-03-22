import { useState, } from 'react';
import { IconButton } from '@mui/material';
import { updateTaskContent, removeTask } from "./utils.js";
import { PropTypes } from "prop-types";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EditTask from './EditTask';

export default function Task({ id, task, handleOnDrag, type, board, setBoard, setMessage, setPopupFunction, setConfirmPopup }) {
  const [isHovered, setIsHovered] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isDragged, setIsDragged] = useState(false);

  const formatText = (text) => {
    let formattedText = text
      .replace(/\*(.*?)\*/g, "<b>$1</b>") // *bold*
      .replace(/_(.*?)_/g, "<i>$1</i>") // _italic_
      .replace(/~(.*?)~/g, "<s>$1</s>"); // ~strikethrough~

    return formattedText.replace(/\n/g, "<br/>");
  };

  function closeModal() {
    setOpenModal(false);
  }

  function handleDeleteTask() {
    setMessage('Are you sure you want to delete this task? this action can not be undone.')
    setPopupFunction(() => deleteTask)
    setConfirmPopup(true)
  }

  async function deleteTask() {
    const deletedTask = { ...board.tasks[id] };

    setBoard((prevBoard) => {
      const updatedTasks = { ...prevBoard.tasks };
      delete updatedTasks[id];
      return {
        ...prevBoard,
        tasks: { ...updatedTasks }
      };
    });

    try {
      const status = await removeTask(id, board.id);
      if (!status) throw new Error("Deleting Task Failed");
    } catch (error) {
      console.error(error);
      setBoard(prevBoard => ({
        ...prevBoard,
        tasks: {
          ...prevBoard.tasks,
          [id]: deletedTask,
        }
      }));
    }
  }

  async function editTask(newContent) {
    if (task === newContent) {
      return;
    }

    const originalContent = task;
    setBoard(prevBoard => ({
      ...prevBoard,
      tasks: {
        ...prevBoard.tasks,
        [id]: {
          ...prevBoard.tasks[id],
          content: newContent,
        }
      }
    }));

    try {
      const res = await updateTaskContent(id, board.id, newContent);
      if (!res) throw new Error("Board or task not found");
    } catch (error) {
      console.error(error);
      setBoard(prevBoard => ({
        ...prevBoard,
        tasks: {
          ...prevBoard.tasks,
          [id]: {
            ...prevBoard.tasks[id],
            content: originalContent,
          }
        }
      }));
    }
  }
  function handleDrag(e) {
    handleOnDrag(e, type, task)
    setIsDragged(true)
  }
  return (
    <div
      className="task"
      key={id}
      draggable
      onDragStart={handleDrag}
      onDragEnd={() => setIsDragged(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "relative",
        padding: "10px",
        borderRadius: "8px",
        transition: "background 0.3s",
        whiteSpace: "pre-wrap"
      }}
    >
      <div
        dangerouslySetInnerHTML={{ __html: formatText(task) }}
        style={{ whiteSpace: "pre-wrap", color: "white" }}
      />

      <div
        className="task-buttons"
        style={{
          position: "absolute",
          right: "0px",
          top: "50%",
          transform: "translateY(-50%)",
          display: (isHovered && !isDragged) ? "flex" : "none",
          gap: "0px",
          background: "rgba(0, 0, 0, 0.7)",
          padding: "5px",
          borderRadius: "5px"
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <IconButton onClick={() => setOpenModal(true)} size="small" sx={{ color: "white" }}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton onClick={() => handleDeleteTask(id)} size="small" sx={{ color: "white" }}>
          <DeleteIcon fontSize="small" sx={{ color: "red" }} />
        </IconButton>
      </div>

      <EditTask open={openModal} onClose={closeModal} editTask={editTask} content={task} />
    </div>
  );
}

Task.propTypes = {
  board: PropTypes.shape({
    id: PropTypes.string.isRequired,
    boardName: PropTypes.string.isRequired,
    tasks: PropTypes.shape({
      id: PropTypes.string,
      content: PropTypes.string,
      createdAt: PropTypes.string,
      updatedAt: PropTypes.string,
    })
  }).isRequired,
  setBoard: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  task: PropTypes.string.isRequired,
  handleOnDrag: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  setMessage: PropTypes.func.isRequired,
  setPopupFunction: PropTypes.func.isRequired,
  setConfirmPopup: PropTypes.func.isRequired,
};

