import React, { useState, useEffect } from "react";
import fetchBoards from "./utils.js"
import { IconButton } from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import AddIcon from "@mui/icons-material/AddCircleOutline"
import Task from "./Task";
import AddTask from "./AddTask"
import "../styles/Body.css"

export default function Body() {
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchBoards();
      console.log(data);
    };

    fetchData();
  }, []);

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

  function handleOnDrop(e, dropCategory) {
    const todoType = e.dataTransfer.getData("todoType");
    const todo = e.dataTransfer.getData("todo");
    if (todoType == dropCategory) return;
    setBoard(prevBoard => ({
      ...prevBoard,
      [dropCategory]: [...prevBoard[dropCategory], todo],
      [todoType]: [...prevBoard[todoType].filter(task => task !== todo)],
    }))
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleOnDrag(e, type, todo) {
    e.dataTransfer.setData("todoType", type);
    e.dataTransfer.setData("todo", todo)
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
        <div className="field" onDrop={(e) => handleOnDrop(e, "todoTasks")} onDragOver={handleDragOver}>
          <div className="field-header">
            <h3>To-do</h3>
            <IconButton className="add-button" onClick={() => toggleAddTask("todoTasks")}>
              <AddIcon sx={{ color: "#00ADB5" }}></AddIcon>
            </IconButton>
          </div>
          <div className="todos" >

            {board.todoTasks.map((task, index) => (
              <Task className='task' draggable key={index} type={"todoTasks"} id={index} task={task} handleOnDrag={handleOnDrag}></Task>
            ))}
          </div>
        </div>

        {/* Doing Column */}
        <div className="field" onDrop={(e) => handleOnDrop(e, "doingTasks")} onDragOver={handleDragOver}>
          <div className="field-header">
            <h3>Doing</h3>
            <IconButton className="add-button" onClick={() => toggleAddTask("doingTasks")}>
              <AddIcon sx={{ color: "#00ADB5" }}></AddIcon>
            </IconButton>
          </div>
          <div className="todos" >

            {board.doingTasks.map((task, index) => (
              <Task className='task' draggable key={index} type={"doingTasks"} id={index} task={task} handleOnDrag={handleOnDrag}></Task>
            ))}
          </div>
        </div>

        {/* Completed Column */}
        <div className="field" onDrop={(e) => handleOnDrop(e, "completedTasks")} onDragOver={handleDragOver}>
          <div className="field-header">
            <h3>Completed</h3>
            <IconButton className="add-button" onClick={() => toggleAddTask("completedTasks")}>
              <AddIcon sx={{ color: "#00ADB5" }}></AddIcon>
            </IconButton>
          </div>
          <div className="todos" >

            {board.completedTasks.map((task, index) => (
              <Task className='task' draggable key={index} type={"completedTasks"} id={index} task={task} handleOnDrag={handleOnDrag}></Task>
            ))}
          </div>
        </div>
      </section>

      <AddTask open={openModal} onClose={closeAddTask} addTask={addTask} />
    </div>
  );
}

