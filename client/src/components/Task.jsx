import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import { updateTaskContent, removeTask } from "./utils.js"
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EditTask from './EditTask';

export default function Task({ id, task, handleOnDrag, type, board, setBoard }) {
    const [isHovered, setIsHovered] = useState(false);
    const [openModal, setOpenModal] = useState(false)
    function closeModal() {
        setOpenModal(false)
    }

    async function deleteTask(id) {
        // NOTE: MIGHT WANT TO DISPLAY SOME CONFIRMATION POPUP
        const deletedTask = { ...board.tasks[id] } // NOTE: Need to only store the deleted task only, but since I want to preserve order, this is the only way for now!!!!
        console.log(deletedTask)

        setBoard((prevBoard) => {
            const updatedTasks = { ...prevBoard.tasks }
            delete updatedTasks[id]

            return {
                ...prevBoard,
                tasks: { ...updatedTasks }
            }
        })
        console.log(board)
        try {
            const status = await removeTask(id, board.id)
            if (!status) throw new Error("Deleting Board Failed")

        }
        catch (error) {
            // NOTE: add notification toast or something
            console.error(error)
            setBoard(prevBoard => ({
                ...prevBoard,
                tasks: {
                    ...prevBoard.tasks,
                    [id]: deletedTask,
                }
            }))
        }
    }

    async function editTask(newContent) {
        if (task === newContent) {
            return;
        }

        const originalContent = task;
        setBoard(prevBoard => ({
            ...prevBoard,
            tasks: {
                ...prevBoard.tasks,
                [id]: {
                    ...prevBoard.tasks[id],
                    content: newContent,
                },
            }
        }));

        try {
            const res = await updateTaskContent(id, board.id, newContent);
            if (!res) throw new Error("Board or task not found");
        } catch (error) {
            console.error(error);
            setBoard(prevBoard => ({
                ...prevBoard,
                tasks: {
                    ...prevBoard.tasks,
                    [id]: {
                        ...prevBoard.tasks[id],
                        content: originalContent,
                    },
                }
            }));
        }
    }
    return (
        <div
            className="task"
            key={id}
            draggable
            onDragStart={(e) => handleOnDrag(e, type, task)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {task}

            {isHovered && (
                <div className="task-buttons">
                    <IconButton onClick={() => setOpenModal(true)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => deleteTask(id)}>
                        <DeleteIcon />
                    </IconButton>
                </div>
            )}
            <EditTask open={openModal} onClose={closeModal} editTask={editTask} content={task} />
        </div>
    );
}
