import { React, useState } from 'react'

export default function Body() {
  const [boardName, setBoardName] = useState("");
  const [searchText, setSearchText] = useState("");

  function ToggleAddTask() {
    console.log("toggled")
  }

  return (
    <>
      <input type='text' value={boardName} placeholder='Enter Board Name' onChange={e => setBoardName(e.target.value)} />
      <div className='search-area'>
        <input type='text' value={searchText} placeholder='Search' onChange={e => setSearchText(e.target.value)} />
        <button></button>
      </div>
      <section className='main-body'>
        <div className='field'>
          <div className='field-header'>
            <h3>To-do</h3>
            <button className='add-button' onClick={ToggleAddTask}>+</button>
          </div>
          <div className="todos"></div>
        </div>
      </section>
    </>
  )
}
