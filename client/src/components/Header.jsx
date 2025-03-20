import { useEffect, useState } from "react";
import "../config.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import "../styles/Header.css";
import { PropTypes } from "prop-types";
import { IconButton, Dialog, DialogTitle, DialogContent, Button, Divider } from "@mui/material";
import { AccountCircle, Menu } from "@mui/icons-material";
import Sidebar from "./Sidebar.jsx";

const auth = getAuth();

export default function Header({ board, setBoard, setPrevBoardName, myBoards, setMyBoards, setIsLoading }) {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false); // State for sign-in popup
  const [sidebar, setSidebar] = useState(false);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const idToken = await user.getIdToken();

        await fetch("http://localhost:3000/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ idToken }),
        });
        console.log("User logged in", user);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setOpen(false); // Close modal after login
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <>
      <div className="header">
        <div className="header-l">
          <IconButton onClick={() => setSidebar(true)}>
            <Menu />
          </IconButton>
          <h3 id="name">
            <a href=".">GO-DO</a>
          </h3>
        </div>
        <div className="header-r">
          {!user && <button onClick={() => setOpen(true)}>Signin</button>}
          <IconButton>
            {user ? (
              <img
                src={user.photoURL}
                alt="User"
                style={{ width: 40, height: 40, borderRadius: "50%" }}
              />
            ) : (
              <AccountCircle />
            )}
          </IconButton>
        </div>

        <Dialog open={open} onClose={() => setOpen(false)} sx={{ "& .MuiPaper-root": { bgcolor: "var(--primary-color)", color: "white", padding: 2, borderRadius: 2 } }}>
          <DialogTitle sx={{ textAlign: "center", fontWeight: "bold", color: "var(--tertiary-color)" }}>
            Sign In
          </DialogTitle>
          <DialogContent sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
            <Button
              variant="contained"
              onClick={signIn}
              sx={{
                bgcolor: "var(--tertiary-color)",
                color: "black",
                fontWeight: "bold",
                "&:hover": { bgcolor: "var(--secondary-color)", color: "white" },
              }}
            >
              Sign in with Google
            </Button>
          </DialogContent>
        </Dialog>
        <Sidebar open={sidebar} setSidebar={setSidebar} board={board} setBoard={setBoard} setPrevBoardName={setPrevBoardName} myBoards={myBoards} setMyBoards={setMyBoards} setIsLoading={setIsLoading} />
      </div>
      <Divider sx={{ bgcolor: "var(--tertiary-color)", marginY: 1 }} />
    </>

  );
}
Header.propTypes = {
  open: PropTypes.bool.isRequired,
  setSidebar: PropTypes.func.isRequired,
  board: PropTypes.shape({
    id: PropTypes.string.isRequired,
    boardName: PropTypes.string.isRequired,
    tasks: PropTypes.array.isRequired,
  }).isRequired,
  setBoard: PropTypes.func.isRequired,
  setPrevBoardName: PropTypes.func.isRequired,
  myBoards: PropTypes.array.isRequired,
  setMyBoards: PropTypes.func.isRequired,
  setIsLoading: PropTypes.func.isRequired,
};
