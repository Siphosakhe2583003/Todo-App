import { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { PropTypes } from "prop-types";
import { createNewBoard, fetchBoard } from "./api.js";


export default function Sidebar({ open, setSidebar, board, setBoard, setPrevBoardName, myBoards, setMyBoards, setIsLoading }) {
  const [openBoards, setOpenBoards] = useState(false);

  const handleBoardsClick = () => {
    setOpenBoards(!openBoards);
  };

  async function createBoard() {
    setSidebar(false);
    setIsLoading(true)
    const tempBoard = board
    setBoard({
      id: "",
      boardName: "",
      tasks: {},
    })
    try {
      const status = await createNewBoard();
      if (!status) throw new Error("Error creating board")
      setBoard(prevBoard => ({
        ...prevBoard,
        id: status.id,
      }))
      setPrevBoardName("")
      setMyBoards(prevBoards => ([...prevBoards, { id: status.id, name: "" }]))
    }
    catch (error) {
      console.error(error)
      setBoard(tempBoard)
      setMyBoards(prevBoards => prevBoards.slice(0, prevBoards.length - 1))
    }

    setIsLoading(false)
  }

  async function getSelectedBoard(boardId) {
    setSidebar(false);
    setIsLoading(true)
    const res = await fetchBoard(boardId);
    if (!res) return;
    setBoard({
      id: res.id,
      boardName: res.name,
      tasks: res.tasks,
    })
    setPrevBoardName = res.name
    setIsLoading(false)
  }


  return (

    <Drawer anchor="left" open={open} onClose={() => setSidebar(false)}>
      <List
        sx={{
          width: 300,
          bgcolor: "var(--primary-color)",
          height: "100%",
          color: "white",
          paddingTop: 1,
          flex: 1,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between", // Pushes content to top & bottom
        }}
      >
        <Box>
          {/* Close Button */}
          <ListItem sx={{ display: "flex", justifyContent: "flex-end", padding: 1 }}>
            <IconButton onClick={() => setSidebar(false)} sx={{ color: "var(--tertiary-color)" }}>
              <ChevronLeftIcon />
            </IconButton>
          </ListItem>

          <Divider sx={{ bgcolor: "var(--tertiary-color)", marginBottom: 1 }} />

          {/* My Boards (Expandable) */}
          <ListItemButton onClick={handleBoardsClick} sx={{ "&:hover": { bgcolor: "var(--secondary-color)" } }}>
            <ListItemIcon sx={{ color: "var(--tertiary-color)" }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="My Boards" sx={{ color: "white", fontWeight: "bold" }} />
            {openBoards ? <ExpandLess sx={{ color: "var(--tertiary-color)" }} /> : <ExpandMore sx={{ color: "var(--tertiary-color)" }} />}
          </ListItemButton>

          <Collapse in={openBoards} timeout="auto" unmountOnExit>
            <List sx={{ paddingLeft: 3 }}>
              {myBoards.length > 0 ? (
                myBoards.map((_board) => (
                  <ListItemButton
                    key={_board.id}
                    sx={{
                      "&:hover": { bgcolor: "var(--secondary-color)" },
                      borderLeft: 1,
                      borderColor: "var(--tertiary-color)",
                      ...(board.id === _board.id && { bgcolor: "var(--tertiary-color)" }),
                    }}
                    onClick={board.id === _board.id ? () => setSidebar(false) : () => getSelectedBoard(_board.id)}
                  >
                    <ListItemText
                      primary={_board.name !== "" ? _board.name : "Untitled"}
                      sx={{
                        color: "white",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "100%", // Ensures it doesn't exceed the parent container
                      }}
                    />
                  </ListItemButton>
                ))
              ) : (
                <Typography sx={{ color: "gray", paddingLeft: 2 }}>No boards available</Typography>
              )}
            </List>
          </Collapse>

          {/* Create Board */}
          <ListItemButton onClick={() => createBoard()} sx={{ "&:hover": { bgcolor: "var(--secondary-color)" } }}>
            <ListItemIcon sx={{ color: "var(--tertiary-color)" }}>
              <AddCircleOutlineIcon />
            </ListItemIcon>
            <ListItemText primary="Create Board" sx={{ color: "white", fontWeight: "bold" }} />
          </ListItemButton>
        </Box>

        {/* Settings (Sticks to the bottom) */}
        <Box>
          <Divider sx={{ bgcolor: "var(--tertiary-color)", marginY: 1 }} />
          <ListItemButton sx={{ "&:hover": { bgcolor: "var(--secondary-color)" } }}>
            <ListItemIcon sx={{ color: "var(--tertiary-color)" }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" sx={{ color: "white", fontWeight: "bold" }} />
          </ListItemButton>
        </Box>
      </List>
    </Drawer>
  );
}
Sidebar.propTypes = {
  open: PropTypes.bool,
  setSidebar: PropTypes.func.isRequired,
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
  setPrevBoardName: PropTypes.func.isRequired,
  myBoards: PropTypes.array.isRequired,
  setMyBoards: PropTypes.func.isRequired,
  setIsLoading: PropTypes.func.isRequired,
};
