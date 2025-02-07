import React from 'react'
import '../styles/Header.css'
import sidebar from '../assets/sidebar.svg'
import profile from '../assets/profile.svg'

export default function Header() {
  return (
    <div className="header">
      <div className="header-l">
        <button>
          <img id="sidebar" src={sidebar} alt="sidebar" />
        </button>
        <h2 id="name"><a href=".">GO-DO</a></h2>
      </div>
      <div className="header-r">
        <img id="profile" src={profile} alt="profile" />
      </div>
    </div>
  )
}
