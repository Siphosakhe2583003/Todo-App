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

export default fetchBoards;  
