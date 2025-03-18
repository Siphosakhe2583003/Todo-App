import React, { useState } from "react";
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
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import TaskIcon from "@mui/icons-material/Assignment";
import SettingsIcon from "@mui/icons-material/Settings";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { createNewBoard } from "./utils.js";

export default function Sidebar({ open, setSidebar, board, setBoard, setPrevBoardName, myBoards, setMyBoards }) {
  const [openBoards, setOpenBoards] = useState(false);
  console.log(myBoards)

  const handleBoardsClick = () => {
    setOpenBoards(!openBoards);
  };

  async function createBoard() {
    const tempBoard = board
    setBoard({
      id: "",
      boardName: "",
      tasks: {},
    })
    try {
      const status = await createNewBoard();
      if (!status) throw new Error("Error creating board")
      console.log(status)
      setBoard(prevBoard => ({
        ...prevBoard,
        id: status.id,
      }))
      setPrevBoardName("")
    }
    catch (error) {
      console.log(error)
      setBoard(tempBoard)
    }

    setSidebar(false);
  }

  return (
    <Drawer anchor="left" open={open} onClose={() => setSidebar(false)}>
      <List sx={{ width: 250, bgcolor: "var(--primary-color)", height: "100vh", color: "white", paddingTop: 1 }}>
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
              myBoards.map((board) => (
                <ListItemButton key={board.id} sx={{ "&:hover": { bgcolor: "var(--secondary-color)" } }}>
                  <ListItemText primary={board.name} sx={{ color: "white" }} />
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

        <Divider sx={{ bgcolor: "var(--tertiary-color)", marginY: 1 }} />

        {/* Settings */}
        <ListItemButton sx={{ "&:hover": { bgcolor: "var(--secondary-color)" } }}>
          <ListItemIcon sx={{ color: "var(--tertiary-color)" }}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" sx={{ color: "white", fontWeight: "bold" }} />
        </ListItemButton>
      </List>
    </Drawer>
  );
}

