import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth"; import { fetchBoards, getBoardTasks, postTasks, changeCategory, saveBoard, createNewBoard, deleteBoardByID } from "./api.js";
// import { toast, ToastContainer } from "react-toastify";
import { IconButton } from "@mui/material";
import Delete from "@mui/icons-material/Delete"
import AddIcon from "@mui/icons-material/AddCircleOutline";
import Task from "./Task";
import AddTask from "./AddTask";
import "../styles/Body.css";
import Header from "./Header.jsx";
import Loader from "./Loader.jsx";
import Popup from "./Popup.jsx";

export default function Body() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingBoardName, setIsEditingBoardName] = useState(true)
  const [prevBoardName, setPrevBoardName] = useState("")
  const [board, setBoard] = useState({
    id: "",
    boardName: "",
    tasks: {}, // stores { taskId: taskData }
  });
  const [searchText, setSearchText] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Todo"); // Tracks category for new task
  const [myBoards, setMyBoards] = useState([])
  const [confirmPopup, setConfirmPopup] = useState(false)
  const [message, setMessage] = useState("")
  const [popupFunction, setPopupFunction] = useState(() => () => null);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    setIsLoading(true)
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user ? user : null);
    });
    setIsLoading(false)
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    setIsLoading(true)
    if (!user) {
      setIsLoading(false)
      return;
    }

    function findLastUpdatedBoard(boards) {
      if (!boards || boards.length === 0) return null;
      return boards.reduce((latest, board) => {
        if (!board.updatedAt) return latest;
        return new Date(board.updatedAt) > new Date(latest.updatedAt) ? board : latest;
      }, boards[0]);
    }

    async function fetchMyBoards() {
      const myBoardsData = await fetchBoards();

      if (!myBoardsData || myBoardsData.length === 0) {
        const newBoard = await createNewBoard();
        setBoard({
          id: newBoard.id,
          boardName: "",
          tasks: {},
        });
        myBoards([newBoard]);
        return;
      }

      setMyBoards(myBoardsData);

      const latestUsedBoard = findLastUpdatedBoard(myBoardsData);
      if (!latestUsedBoard) return;

      const boardTasks = await getBoardTasks(latestUsedBoard.id) || [];
      const formattedTasks = boardTasks.reduce((acc, task) => {
        acc[task.id] = task;
        return acc;
      }, {});

      setBoard({
        id: latestUsedBoard.id,
        boardName: latestUsedBoard.name.trim() || "",
        tasks: formattedTasks || {},
      });
      setPrevBoardName(latestUsedBoard.name.trim() || "");
    };
    setIsLoading(true);
    fetchMyBoards();
    setIsLoading(false)
  }, [user, refresh]);

  useEffect(() => {
    if (!isEditingBoardName) {
      setBoard(prevBoard => {
        const trimmedName = prevBoard.boardName.trim(); // Trim the name before setting
        return { ...prevBoard, boardName: trimmedName };
      });

      async function saveNewBoardName(boardId, newName) {
        if (newName === prevBoardName) return;

        const status = await saveBoard(boardId, newName);

        if (!status) {
          console.error("Failed to change board name");
          setBoard(prevBoard => ({ ...prevBoard, boardName: prevBoardName }));
          return;
        } // Updating the name of the board in the boards list, WHY? I am avoiding to fetch the boards again
        for (let board of myBoards) {
          if (board.id === boardId) {
            board.name = newName;
            break;
          }
        }
        setPrevBoardName(newName); // Update previous name only if save is successful
      }
      setTimeout(() => saveNewBoardName(board.id, board.boardName.trim()), 0);
    }
  }, [isEditingBoardName]);


  function toggleAddTask(category) {
    setSelectedCategory(category);
    setOpenModal(true);
  }

  function closeAddTask() {
    setOpenModal(false);
  }

  const addTask = async (content, taskPriority, position, taskCategory) => {
    const tempId = Date.now().toString();

    const task = {
      content: content,
      type: taskCategory,
      priority: taskPriority,
      pos: position,
    };

    // NOTE: Optimistically update the UI
    setBoard((prevBoard) => {
      return {
        ...prevBoard,
        tasks: {
          ...prevBoard.tasks,
          [tempId]: { ...task, id: tempId, isPending: true }, // Temporary task
        },
      };
    });

    try {
      const data = await postTasks(task, board.id);

      if (!data) {
        throw new Error("Failed to add task");
      }

      // Replace the temporary task with the actual one
      setBoard((prevBoard) => {
        const updatedTasks = { ...prevBoard.tasks };
        delete updatedTasks[tempId]; // Remove the temp task
        return {
          ...prevBoard,
          tasks: {
            ...updatedTasks,
            [data.id]: { ...data.task, id: data.id },
          },
        };
      });

    } catch (error) {
      console.error(error);
      // Rollback: Remove the temporary task if the API call fails
      setBoard((prevBoard) => {
        const updatedTasks = { ...prevBoard.tasks };
        delete updatedTasks[tempId];
        return { ...prevBoard, tasks: updatedTasks };
      });

      // TODO: Show an error notification (toast)
    }
  };

  function addBoardName(name) {
    setCategoryState({ "Todo": false, "Doing": false, "Completed": false })
    setIsEditingBoardName(true)
    setBoard((prevBoard) => ({
      ...prevBoard,
      boardName: name,
    }));
  }

  async function handleOnDrop(e, dropCategory, taskBelowId) {
    setCategoryState({ "Todo": false, "Doing": false, "Completed": false })
    const taskId = e.dataTransfer.getData("taskId");
    const task = board.tasks[taskId];
    const taskBelow = board.tasks[taskBelowId];
    let topPos = 0

    if (task.pos === taskBelow.pos) return;

    for (let currTask of Object.values(board.tasks)) {
      if (currTask.pos < taskBelow.pos && currTask.type === dropCategory) {
        topPos = currTask.pos
      }
    }

    const currPos = (taskBelow.pos + topPos) / 2

    setBoard((prevBoard) => ({
      ...prevBoard,
      tasks: {
        ...prevBoard.tasks,
        [taskId]: { ...prevBoard.tasks[taskId], type: dropCategory, pos: currPos },
      },
    }));

    try {
      const data = await changeCategory(taskId, board.id, dropCategory, currPos);

      if (!data) {
        throw new Error("Board or task doesn't exist");
      }
    } catch (error) {
      console.error(error);

      setBoard((prevBoard) => ({
        ...prevBoard,
        tasks: {
          ...prevBoard.tasks,
          [taskId]: { ...prevBoard.tasks[taskId], type: task.type, pos: task.pos }, // Revert to original type
        },
      }));

      // TODO: (toast notification, error color and some text use react-toastify)
    }
  }

  const [categoryState, setCategoryState] = useState({ "Todo": false, "Doing": false, "Completed": false })

  function handleDragOver(e, category) {
    e.preventDefault();
    setCategoryState((prev) => ({
      ...Object.fromEntries(Object.keys(prev).map((key) => [key, false])), // Reset all to false
      [category]: true, // Set the current category to true
    }));
    // console.log("dragging over", category, e)
  }

  function handleOnDrag(e, taskId) {
    e.dataTransfer.setData("taskId", taskId);

    console.log("dragging event", e.target)
  }

  async function deleteBoard() {
    try {
      const status = await deleteBoardByID(board.id)
      if (!status) throw new Error("deleting board failed"); // NOTE: Deleting failed

      // NOTE: I am currently just refreshing the page if the user deletes the current page. In future I must just change the states of the board and boards and just fetch the last updated board after the deletion to avoid fetching the entire board, in fact since I have the entire board, it might be better to just delete the board from the board and just calculate the recently used board from there(but I am not tracking the last used board in the ui so that might cause some problems)
      setRefresh(prev => !prev)
    }
    catch (error) {
      console.error(error)
    }
  }

  const handleDelete = () => {
    setMessage('Are you sure you want to delete this board? This action cannot be undone.');
    setPopupFunction(() => deleteBoard);
    setConfirmPopup(true);
  };

  const handleSearch = (e) => {
    const currSearchText = e.target.value.toLowerCase();
    setSearchText(currSearchText);

    const updatedTasks = {}
    for (const [key, task] of Object.entries(board.tasks)) {
      updatedTasks[key] = { ...task, show: task.content.toLowerCase().includes(currSearchText.toLowerCase()) }
    }

    setBoard(prevBoard => ({
      ...prevBoard,
      tasks: { ...updatedTasks }
    }))

  };

  return (
    <>
      <Header board={board} setBoard={setBoard} setPrevBoardName={setPrevBoardName} myBoards={myBoards} setMyBoards={setMyBoards} setIsLoading={setIsLoading} />
      <div className="content">
        <div className="title-content">
          <label className="board-name-container">
            <input
              type="text"
              value={board.boardName}
              placeholder="Enter Board Name"
              onChange={(e) => addBoardName(e.target.value)}
              onBlur={() => setIsEditingBoardName(false)}
              id="board-name"
            />
          </label>
          <IconButton onClick={handleDelete}>
            <Delete />
          </IconButton>
        </div>
        <div className="search-area">
          <input
            type="text"
            value={searchText}
            placeholder="Search"
            onChange={handleSearch}
          />
        </div>

        <section className="main-body">
          {["Todo", "Doing", "Completed"].map((category) => (
            <div
              key={category}
              className="field"
              // onDrop={(e) => handleOnDrop(e, category, taskBelowId)}
              onDragOver={(e) => handleDragOver(e, category)}
              onDragLeave={() => setCategoryState({ "Todo": false, "Doing": false, "Completed": false })}
              style={{ border: categoryState[category] ? "2px solid var(--tertiary-color)" : "", opacity: categoryState[category] ? 0.7 : 1 }}
            >
              <div className="field-header" >
                <h3>{category.toUpperCase()}</h3>
                <IconButton className="add-button" onClick={() => toggleAddTask(category)}>
                  <AddIcon sx={{ color: "var(--tertiary-color)" }} />
                </IconButton>
              </div>
              <div className="todos">
                {Object.values(board.tasks)
                  .filter((task) => task.type === category && task.show !== false)
                  .sort((a, b) => a.pos - b.pos)
                  .map((task) => (
                    <Task
                      className="tasks"
                      draggable
                      key={task.id}
                      pos={task.pos}
                      id={task.id}
                      type={task.type}
                      task={task.content}
                      board={board}
                      setBoard={setBoard}
                      setMessage={setMessage}
                      setPopupFunction={setPopupFunction}
                      setConfirmPopup={setConfirmPopup}
                      handleOnDrag={(e) => handleOnDrag(e, task.id)}
                      handleOnDrop={handleOnDrop}
                      category={category}
                    />
                  ))
                }
              </div>
            </div>
          ))}
        </section>

        <AddTask open={openModal} onClose={closeAddTask} addTask={addTask} taskCategory={selectedCategory} />
        <Loader isLoading={isLoading} />
        {/* <ToastContainer /> */}
        <Popup open={confirmPopup} onClose={() => setConfirmPopup(false)} message={message} runOnClose={popupFunction} />
      </div>
    </>
  );
}

