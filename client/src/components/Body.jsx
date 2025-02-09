import React, { useState } from "react";
import AddTask from "./AddTask";
import "../styles/Body.css"
import { IconButton } from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import AddIcon from "@mui/icons-material/AddCircleOutline"
import Task from "./Task";

export default function Body() {
  const [board, setBoard] = useState({
    boardName: "",
    todoTasks: [],
    doingTasks: [],
    completedTasks: [],
  });

  const [searchText, setSearchText] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("todoTasks"); // Tracks category for new task

  function toggleAddTask(category) {
    setSelectedCategory(category);
    setOpenModal(true);
  }

  function closeAddTask() {
    setOpenModal(false);
  }

  const addTask = (newTask) => {
    setBoard((prevBoard) => ({
      ...prevBoard,
      [selectedCategory]: [...prevBoard[selectedCategory], newTask], // Dynamically updates the correct category
    }));
    closeAddTask(); // Close modal after adding task
  };

  function addBoardName(name) {
    setBoard((prevBoard) => ({
      ...prevBoard,
      boardName: name
    }))
  }

  return (
    <div className="content">
      <label>
        <input
          type="text"
          value={board.boardName}
          placeholder="Enter Board Name"
          onChange={(e) => addBoardName(e.target.value)}
          id='board-name'
        />

      </label>

      <div className="search-area">
        <input
          type="text"
          value={searchText}
          placeholder="Search"
          onChange={(e) => setSearchText(e.target.value)}
        />
        <IconButton>
          <SearchIcon style={{ color: "white" }}></SearchIcon>
        </IconButton>
      </div>

      <section className="main-body">
        {/* To-Do Column */}
        <div className="field">
          <div className="field-header">
            <h3>To-do</h3>
            <IconButton className="add-button" onClick={() => toggleAddTask("todoTasks")}>
              <AddIcon sx={{ color: "#00ADB5" }}></AddIcon>
            </IconButton>
          </div>
          <div className="todos" onDrop={handleOnDrop} onDragOver={handleDragOver}>

            {board.todoTasks.map((task, index) => (
              <Task id={index} task={task}></Task>
            ))}
          </div>
        </div>

        {/* Doing Column */}
        <div className="field">
          <div className="field-header">
            <h3>Doing</h3>
            <IconButton className="add-button" onClick={() => toggleAddTask("doingTasks")}>
              <AddIcon sx={{ color: "#00ADB5" }}></AddIcon>
            </IconButton>
          </div>
          <div className="todos">
            <ul>
              {board.doingTasks.map((task, index) => (
                <li key={index}>{task}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Completed Column */}
        <div className="field">
          <div className="field-header">
            <h3>Completed</h3>
            <IconButton className="add-button" onClick={() => toggleAddTask("completedTasks")}>
              <AddIcon sx={{ color: "#00ADB5" }}></AddIcon>
            </IconButton>
          </div>
          <div className="todos">
            <ul>
              {board.completedTasks.map((task, index) => (
                <li key={index}>{task}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <AddTask open={openModal} onClose={closeAddTask} addTask={addTask} />
    </div>
  );
}

