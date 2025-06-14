import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import api from "../utils/axios";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// React Context for managing all task-related state and actions across the app.
// Provides functions to fetch, create, update, delete, reorder, and share tasks.
// Used by Dashboard and other components to access and modify tasks globally.

export const TaskContext = createContext();

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  const fetchTasks = useCallback(async (filters = {}) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/api/tasks${params ? `?${params}` : ""}`);
      setTasks(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = async (task) => {
    setLoading(true);
    setError("");
    try {
      // Ensure sharedWith is sent and response is merged
      const res = await api.post("/api/tasks", task);
      await fetchTasks(); // Refetch all tasks to ensure sharedWith is populated
      showToast("Task created successfully!", "success");
    } catch (err) {
      console.error("Error creating task:", err);
      showToast(err.response?.data?.message || "Failed to create task", "error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (id, updates) => {
    setLoading(true);
    setError("");
    try {
      // Ensure sharedWith is sent and response is merged
      const res = await api.put(`/api/tasks/${id}`, updates);
      await fetchTasks(); // Refetch all tasks to ensure sharedWith is populated
      showToast("Task updated successfully!", "success");
    } catch (err) {
      console.error("Error updating task:", err);
      showToast(err.response?.data?.message || "Failed to update task", "error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id) => {
    setLoading(true);
    setError("");
    try {
      await api.delete(`/api/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      showToast("Task deleted successfully!", "success");
    } catch (err) {
      console.error("Error deleting task:", err);
      showToast(err.response?.data?.message || "Failed to delete task", "error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (id) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.patch(`/api/tasks/${id}/toggle`);
      setTasks((prev) => prev.map((t) => (t._id === id ? res.data : t)));
      showToast("Task status updated!", "success");
    } catch (err) {
      console.error("Error toggling task:", err);
      showToast(err.response?.data?.message || "Failed to toggle task status", "error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTaskOrder = async (taskOrders) => {
    try {
      const response = await fetch(`${API_URL}/tasks/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ taskOrders })
      });

      if (!response.ok) {
        throw new Error('Failed to update task order');
      }

      // Update local state with new order
      const updatedTasks = [...tasks];
      taskOrders.forEach(({ id, order }) => {
        const taskIndex = updatedTasks.findIndex(t => t._id === id);
        if (taskIndex !== -1) {
          updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], order };
        }
      });
      setTasks(updatedTasks.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Error updating task order:', error);
      setError('Failed to update task order');
    }
  };

  useEffect(() => {
    if (user) fetchTasks();
    else setTasks([]);
    // eslint-disable-next-line
  }, [user]);

  return (
    <TaskContext.Provider
      value={{ tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask, toggleTask, updateTaskOrder }}
    >
      {children}
    </TaskContext.Provider>
  );
}; 