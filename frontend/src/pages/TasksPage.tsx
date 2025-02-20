import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

const TasksPage = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState(""); 
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
        navigate("/");
    } else {
        console.log("token: ", token);
      fetchTasks();
    }
  }, [navigate]);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
        console.log("fetching tasks");
        const response = await fetch("http://localhost:4000/tasks", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();   
        if (!Array.isArray(data)) {
            throw new Error("Invalid data format: Expected an array");
        }
        setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) return;

    try {
      const response = await fetch("http://localhost:4000/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ title: newTask }),
      });

      if (response.ok) {
        setNewTask("");
        fetchTasks();
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      const response = await fetch(`http://localhost:4000/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/logout");
  };

  // Handle marking a task as complete
  const markComplete = async (taskId: number, currentStatus: boolean, taskTitle: string) => {
    try {
      const response = await fetch(`http://localhost:4000/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title: taskTitle,
          completed: !currentStatus,
        }),
      });
  
      if (response.ok) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, completed: !currentStatus } : task
          )
        );
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };
  

  // Handle editing a task title
  const startEditing = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
  };

  const saveEdit = async (taskId: number, currentStatus: boolean, taskTitle: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:4000/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ 
            title: taskTitle,
            completed: currentStatus,
        }),
      });

      if (response.ok) {
        setTasks(tasks.map(task => (task.id === taskId ? { ...task, title: editTitle } : task)));
        setEditingTask(null);
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };


  return (
    <div>
      <h2>Task Manager</h2>
      <p>Welcome! You can now create and manage tasks.</p>

      <input
      type="text"
      placeholder="Enter new task"
      value={newTask}
      onChange={(e) => setNewTask(e.target.value)}
    />
    <button onClick={addTask}>Add Task</button>

      {tasks.length > 0 ? (
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              {editingTask?.id === task.id ? (
                <>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <button onClick={() => saveEdit(task.id, task.completed, task.title)}>Save</button>
                </>
              ) : (
                <>
                  <span style={{ textDecoration: task.completed ? "line-through" : "none" }}>
                    {task.title}
                  </span>
                  <button onClick={() => deleteTask(task.id)}>Delete</button>
                  <button onClick={() => markComplete(task.id, task.completed, task.title)}>
                    {task.completed ? "Undo" : "Complete"}
                  </button>
                  <button onClick={() => startEditing(task)}>Edit</button>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No tasks available.</p>
      )}

      <button onClick={() => navigate("/logout")}>Logout</button>
    </div>
  );
};

export default TasksPage;
