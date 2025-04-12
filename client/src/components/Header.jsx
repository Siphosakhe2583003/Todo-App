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
import { IconButton, Divider } from "@mui/material";
import { Menu } from "@mui/icons-material";
import Sidebar from "./Sidebar.jsx";
import GoogleLogo from "./GoogleLogo.jsx";
import { createSession } from "./api.js";

const auth = getAuth();

export default function Header({ board, setBoard, setPrevBoardName, myBoards, setMyBoards, setIsLoading }) {
  const [user, setUser] = useState(null);
  const [sidebar, setSidebar] = useState(false);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const idToken = await user.getIdToken();

        // Send the ID token to your backend for verification and to create a session
        createSession(idToken);

      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      setIsLoading(true)
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
    setIsLoading(false)
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
          {!user && (
            <button className="gsi-material-button" onClick={signIn}>
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <GoogleLogo />
                </div>
                <span className="gsi-material-button-contents">Sign in with Google</span>
                <span style={{ display: "none" }}>Sign in with Google</span>
              </div>
            </button>
          )}

          <IconButton>
            {user ? (
              <img
                src={user.photoURL}
                alt="User"
                style={{ width: 40, height: 40, borderRadius: "50%" }}
              />
            ) : (
              <div></div>
            )}
          </IconButton>
        </div>
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
