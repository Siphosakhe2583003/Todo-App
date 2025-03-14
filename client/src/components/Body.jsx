import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { fetchBoards, fetchLastUsedBoard, getBoardTasks } from "./utils.js";
import { IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/AddCircleOutline";
import Task from "./Task";
import AddTask from "./AddTask";
import "../styles/Body.css";

export default function Body() {
    const [user, setUser] = useState(null);
    const [board, setBoard] = useState({
        id: "",
        boardName: "",
        tasks: {}, // stores { taskId: taskData }
    });

    const [searchText, setSearchText] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("Todo"); // Tracks category for new task

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user ? user : null);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;

        const fetchCurrBoard = async () => {
            const boardData = await fetchLastUsedBoard();
            if (!boardData) return;

            const boardTasks = await getBoardTasks(boardData.id);
            if (!boardTasks) return;

            const formattedTasks = boardTasks.reduce((acc, task) => {
                acc[task.id] = task;
                return acc;
            }, {});

            setBoard({
                id: boardData.id,
                boardName: boardData.name || "",
                tasks: formattedTasks,
            });
        };

        fetchCurrBoard();
    }, [user]);

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
            tasks: {
                ...prevBoard.tasks,
                [newTask.id]: { ...newTask, type: selectedCategory },
            },
        }));
        closeAddTask();
    };

    function addBoardName(name) {
        setBoard((prevBoard) => ({
            ...prevBoard,
            boardName: name,
        }));
    }

    function handleOnDrop(e, dropCategory) {
        const taskId = e.dataTransfer.getData("taskId");
        if (!taskId) return;

        setBoard((prevBoard) => ({
            ...prevBoard,
            tasks: {
                ...prevBoard.tasks,
                [taskId]: { ...prevBoard.tasks[taskId], type: dropCategory },
            },
        }));
    }

    function handleDragOver(e) {
        e.preventDefault();
    }

    function handleOnDrag(e, taskId) {
        console.log(board)
        e.dataTransfer.setData("taskId", taskId);
    }

    return (
        <div className="content">
            <label>
                <input
                    type="text"
                    value={board.boardName}
                    placeholder="Enter Board Name"
                    onChange={(e) => addBoardName(e.target.value)}
                    id="board-name"
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
                    <SearchIcon style={{ color: "white" }} />
                </IconButton>
            </div>

            <section className="main-body">
                {["Todo", "Doing", "Completed"].map((category) => (
                    <div
                        key={category}
                        className="field"
                        onDrop={(e) => handleOnDrop(e, category)}
                        onDragOver={handleDragOver}
                    >
                        <div className="field-header">
                            <h3>{category}</h3>
                            <IconButton className="add-button" onClick={() => toggleAddTask(category)}>
                                <AddIcon sx={{ color: "#00ADB5" }} />
                            </IconButton>
                        </div>
                        <div className="todos">
                            {Object.values(board.tasks)
                                .filter((task) => task.type === category)
                                .map((task) => (
                                    <Task
                                        className="task"
                                        draggable
                                        key={task.id}
                                        id={task.id}
                                        type={task.type}
                                        task={task.content}
                                        handleOnDrag={(e) => handleOnDrag(e, task.id)}
                                    />
                                ))}
                        </div>
                    </div>
                ))}
            </section>

            <AddTask open={openModal} onClose={closeAddTask} addTask={addTask} />
        </div>
    );
}

