const URL = import.meta.env.VITE_API_URL;

async function createSession(idToken) {
  const res = await fetch(`${URL}/auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }
}


async function fetchBoards() {
  try {
    const res = await fetch(`${URL}/api/boards`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch boards:", error.message);
    return null;
  }
};

async function fetchLastUsedBoard() {
  try {
    const res = await fetch(`${URL}/api/`, {
      method: "GET",
      credentials: "include",
    })
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`)
    }
    return await res.json()
  }
  catch (error) {
    console.error("Failed to get board:", error.message)
  }
  return null
}

async function fetchBoard(id) {
  try {
    const res = await fetch(`${URL}/api/boards/${id}`, {
      method: "GET",
      credentials: "include",
    })
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`)
    }
    return await res.json()
  }
  catch (error) {
    console.error(error.message)
  }
  return null
}

async function getBoardTasks(id) {
  try {
    const res = await fetch(`${URL}/api/boards/${id}/tasks`, {
      method: "GET",
      credentials: "include",
    })
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`)
    }
    return await res.json()
  }
  catch (error) {
    console.error(error.message)
  }
  return null
}


async function postTasks(task, id) {
  try {
    const res = await fetch(`${URL}/api/boards/${id}/tasks`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(task)
    })
    if (!res.ok) {

      throw new Error(`Error ${res.status}: ${res}`)
    }
    return await res.json()
  }
  catch (error) {
    console.error(error.message)
  }
  return null
}

async function changeCategory(taskId, boardId, category, position) {
  try {
    const res = await fetch(`${URL}/api/boards/${boardId}/tasks/${taskId}/type`, {
      method: "PUT",
      credentials: "include",
      body: JSON.stringify({ "type": category, "pos": position, })
    })
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res}`)
    }
    return await res.json()
  }
  catch (error) {
    console.error(error.message, error)
  }
  return null
}

async function updateTaskContent(taskId, boardId, content, newPriority) {
  try {
    const res = await fetch(`${URL}/api/boards/${boardId}/tasks/${taskId}`, {
      method: "PUT",
      credentials: "include",
      body: JSON.stringify({
        "content": content,
        priority: newPriority,
      })
    })
    if (!res.ok) {

      throw new Error(`Error ${res.status}: ${res}`)
    }
    return await res.json()
  }
  catch (error) {
    console.error(error.message)
  }
  return null
}

async function removeTask(taskId, boardId) {
  try {
    const res = await fetch(`${URL}/api/boards/${boardId}/tasks/${taskId}`, {
      method: "DELETE",
      credentials: "include",
    })
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)
    return await res.json()
  }
  catch (error) {
    console.error(error)
  }
  return null
}

async function deleteBoardByID(boardId) {
  try {
    const res = await fetch(`${URL}/boards/${boardId}`, {
      method: "DELETE",
      credentials: "include",
    })
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)
    return await res.json()
  }
  catch (error) {
    console.error(error)
  }
  return null
}

async function saveBoard(boardId, newBoardName) {
  try {
    const res = await fetch(`${URL}/api/boards/${boardId}`, {
      method: "PUT",
      credentials: "include",
      body: JSON.stringify({ "name": newBoardName })
    })
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res}`)
    }
    return await res.json()
  }
  catch (error) {
    console.error(error.message)
  }
  return null
}

async function createNewBoard() {
  try {
    const res = await fetch(`${URL}/api/boards`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ name: "" })
    })
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res}`)
    }
    return await res.json()
  }
  catch (error) {
    console.error(error.message)
  }
  return null
}

export { createSession, deleteBoardByID, fetchBoards, fetchLastUsedBoard, getBoardTasks, postTasks, changeCategory, updateTaskContent, removeTask, saveBoard, createNewBoard, fetchBoard }
