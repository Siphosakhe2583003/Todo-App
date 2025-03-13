import React, { useEffect, useState } from 'react'
import '../config.js'
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth'
import '../styles/Header.css'
import { IconButton } from '@mui/material'
import { AccountCircle } from '@mui/icons-material'
import sidebar from '../assets/sidebar.svg'


const auth = getAuth()

export default function Header() {
  const [user, setUser] = useState(null);

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
          body: JSON.stringify({ idToken })
        })
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
    } catch (error) {
      console.error("Login failed", error);
    }
  };
  return (
    <div className="header">
      <div className="header-l">
        <button>
          <img id="sidebar" src={sidebar} alt="sidebar" />
        </button>
        <h2 id="name"><a href=".">GO-DO</a></h2>
      </div>
      <div className="header-r">
        <IconButton onClick={signIn}>
          <AccountCircle>
          </AccountCircle>
        </IconButton>
      </div>
    </div>
  )
}
