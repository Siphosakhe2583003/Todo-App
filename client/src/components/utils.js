const URL = "http://localhost:3000/api"

async function fetchBoards() {
  try {
    const res = await fetch(`${URL}/boards`, {
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
    const res = await fetch(`${URL}/`, {
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

async function getBoardTasks(id) {
  try {
    const res = await fetch(`${URL}/boards/${id}/tasks`, {
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
    const res = await fetch(`${URL}/boards/${id}/tasks`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(task)
    })
    if (!res.ok) {
      console.log(res)
      throw new Error(`Error ${res.status}: ${res}`)
    }
    return await res.json()
  }
  catch (error) {
    console.error(error.message)
  }
  return null
}

async function changeCategory(taskId, boardId, category) {
  try {
    const res = await fetch(`${URL}/boards/${boardId}/tasks/${taskId}/type`, {
      method: "PUT",
      credentials: "include",
      body: JSON.stringify({ "type": category })
    })
    if (!res.ok) {
      console.log(res)
      throw new Error(`Error ${res.status}: ${res}`)
    }
    return await res.json()
  }
  catch (error) {
    console.error(error.message)
  }
  return null
}



export { fetchBoards, fetchLastUsedBoard, getBoardTasks, postTasks, changeCategory }
