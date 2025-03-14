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


export { fetchBoards, fetchLastUsedBoard, getBoardTasks };  
