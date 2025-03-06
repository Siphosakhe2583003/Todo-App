import React from 'react'
import '../config.js'
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth'
import '../styles/Header.css'
import { IconButton } from '@mui/material'
import { AccountCircle } from '@mui/icons-material'
import sidebar from '../assets/sidebar.svg'
import profile from '../assets/profile.svg'


const auth = getAuth()

onAuthStateChanged(auth, (user) => {
  if (user == null) {
    signInWithPopup(auth, new GoogleAuthProvider())
  }
})

export default function Header() {

  const signIn = () => {
    signInWithPopup(auth, new GoogleAuthProvider())
  }
  return (
    <div className="header">
      <div className="header-l">
        <button>
          <img id="sidebar" src={sidebar} alt="sidebar" />
        </button>
        <h2 id="name"><a href=".">GO-DO</a></h2>
      </div>
      <div className="header-r">
        <IconButton>
          <AccountCircle>
          </AccountCircle>
        </IconButton>
      </div>
    </div>
  )
}
