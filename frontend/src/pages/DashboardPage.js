import React, { useContext, useState, useCallback, useEffect, useMemo } from "react";
import { TaskContext } from "../context/TaskContext";
import { AuthContext } from "../context/AuthContext";
import TaskList from "../components/TaskList";
import TaskForm from "../components/TaskForm";
import Modal from "../components/Modal";
import { useTheme } from "../context/ThemeContext";
import ProfileDropdown from "../components/ProfileDropdown";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';
import EmailReminders from '../components/EmailReminders';
import { useAuth } from "../context/AuthContext";

// Lazy load PDF functionality
const PDFExport = React.lazy(() => import('../components/PDFExport'));

// Main dashboard page: displays all tasks, filters, search bar, export options, and reminders.
// Handles task CRUD, filtering, searching, drag-and-drop, sharing, and export.
// Uses TaskContext for data and actions, and manages UI state for forms and modals.
const DashboardPage = () => {
  const { tasks, loading, error, createTask, updateTask, deleteTask, toggleTask, fetchTasks, updateTaskOrder } = useContext(TaskContext);
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filter, setFilter] = useState({ status: "", priority: "", category: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);

  const memoizedFetchTasks = useCallback(fetchTasks, [fetchTasks]);

  useEffect(() => {
    if (user) {
      memoizedFetchTasks({ ...filter, search: searchQuery });
    } else {
      // Clear tasks if user logs out or is not present
      // This might already be handled by TaskContext's user dependency, but good to be explicit.
    }
  }, [user, filter, searchQuery, memoizedFetchTasks]);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  }, []);

  // Memoize filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const searchMatch = searchQuery === "" || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        task.priority.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        (task.dueDate && new Date(task.dueDate).toLocaleDateString().includes(searchQuery));

      const statusMatch = filter.status === "" || 
        (filter.status === "completed" && task.completed) ||
        (filter.status === "pending" && !task.completed);

      const priorityMatch = filter.priority === "" || 
        task.priority === filter.priority;

      const categoryMatch = filter.category === "" || 
        task.category === filter.category;

      return searchMatch && statusMatch && priorityMatch && categoryMatch;
    });
  }, [tasks, searchQuery, filter]);

  const handleDeleteTask = async (id) => {
    if (window.confirm("Delete this task?")) {
      try {
        await deleteTask(id);
        showToast('Task deleted successfully', 'success');
      } catch (error) {
        showToast(error.response?.data?.message || 'Error deleting task', 'error');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleTask(id);
      showToast('Task status updated', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Error updating task status', 'error');
    }
  };

  // Export handlers
  const handleExportTasks = (format) => {
    if (format === 'pdf') {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [['Title', 'Description', 'Priority', 'Status', 'Due Date', 'Tags', 'Created At', 'Last Updated']],
        body: filteredTasks.map(task => [
          task.title,
          task.description || '',
          task.priority,
          task.completed ? 'Completed' : 'Pending',
          task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '',
          (task.tags || []).join('; '),
          new Date(task.createdAt).toLocaleString(),
          new Date(task.updatedAt).toLocaleString()
        ])
      });
      doc.save(`tasks_export_${new Date().toISOString().split('T')[0]}.pdf`);
      return;
    }
    // CSV
    const headers = ["Title", "Description", "Priority", "Status", "Due Date", "Tags", "Created At", "Last Updated"];
    const csvContent = [
      headers.join(","),
      ...filteredTasks.map(task => [
        `"${task.title.replace(/"/g, '""')}"`,
        `"${(task.description || "").replace(/"/g, '""')}"`,
        task.priority,
        task.completed ? "Completed" : "Pending",
        task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "",
        `"${(task.tags || []).join("; ")}"`,
        new Date(task.createdAt).toLocaleString(),
        new Date(task.updatedAt).toLocaleString()
      ].join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `tasks_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center fade-in">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start fade-in bg-gradient-to-br from-orange-100 via-cyan-100 to-white" style={{ paddingTop: '2rem' }}>
      {/* User Info Card + Actions */}
      <div className="w-full max-w-3xl flex flex-col sm:flex-row items-center gap-4 mb-6 p-4 rounded-xl shadow bg-white/90 border border-blue-100 justify-between">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white text-2xl font-bold">
            {/* Professional avatar: show initials or fallback emoji */}
            {typeof user === 'object' && user && typeof user.username === 'string' && user.username
              ? <span>{user.username.slice(0, 2).toUpperCase()}</span>
              : <span role="img" aria-label="User" style={{fontSize: '2rem'}}>👤</span>}
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-800">{user?.username || 'User'}</div>
            <div className="text-sm text-gray-500">Welcome to your dashboard!</div>
          </div>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              className="btn px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-cyan-400 hover:to-blue-500 focus:outline-none"
              onClick={() => setShowExportOptions((prev) => !prev)}
            >
              Export Data
            </button>
            {showExportOptions && (
              <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <button
                  onClick={(e) => { e.stopPropagation(); handleExportTasks('csv'); }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                >
                  Export as CSV
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleExportTasks('pdf'); }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                >
                  Export as PDF
                </button>
              </div>
            )}
          </div>
          {/* Logout Button */}
          <button onClick={logout} className="btn px-4 py-2 text-sm font-semibold bg-gradient-to-r from-pink-500 to-orange-400 hover:from-orange-400 hover:to-pink-500 focus:outline-none">Logout</button>
        </div>
      </div>

      {/* Main Content: Left (tasks) and Right (email reminders) */}
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8">
        {/* Left: Tasks and Filters */}
        <div className="flex-1 min-w-0">
          {/* Welcome Section */}
          <div className="card w-full mb-8 text-center" style={{ background: 'linear-gradient(120deg, #f5a623 0%, #36d1c4 100%)', color: '#fff' }}>
            <h1 className="text-3xl font-extrabold mb-2 drop-shadow-lg tracking-tight">Task Management Dashboard</h1>
            <p className="text-lg opacity-90 font-medium">Organize, track, and complete your tasks with ease.</p>
          </div>

          {/* Filters Section (combined) */}
          <div className="w-full mb-6">
            <div className="card flex flex-col sm:flex-row flex-wrap gap-4 items-center justify-between" style={{ background: 'rgba(255,255,255,0.95)' }}>
              <div className="flex flex-col items-start">
                <label className="font-semibold text-blue-700 mb-1">Status</label>
                <select
                  value={filter.status}
                  onChange={handleFilterChange}
                  name="status"
                  className="p-2 rounded border-2 border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                >
                  <option value="">All</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div className="flex flex-col items-start">
                <label className="font-semibold text-blue-700 mb-1">Priority</label>
                <select
                  value={filter.priority}
                  onChange={handleFilterChange}
                  name="priority"
                  className="p-2 rounded border-2 border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                >
                  <option value="">All</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="flex flex-col items-start">
                <label className="font-semibold text-blue-700 mb-1">Category</label>
                <select
                  value={filter.category}
                  onChange={handleFilterChange}
                  name="category"
                  className="p-2 rounded border-2 border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                >
                  <option value="">All</option>
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Health">Health</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Add/Edit Task Section */}
          <div className="w-full mb-6">
            <div className="card" style={{ background: 'rgba(255,255,255,0.95)' }}>
              <button
                className="btn mb-4"
                onClick={() => {
                  setEditTask(null);
                  setShowForm(!showForm);
                  setFormError("");
                }}
              >
                {showForm ? 'Hide Task Form' : 'Add New Task'}
              </button>
              {showForm && !editTask && (
                <TaskForm
                  initial={{}}
                  onSubmit={async (data) => {
                    setFormLoading(true);
                    setFormError("");
                    try {
                      await createTask(data);
                      setShowForm(false);
                      showToast('Task added successfully', 'success');
                    } catch (err) {
                      setFormError("Failed to add task");
                      showToast('Failed to add task', 'error');
                    } finally {
                      setFormLoading(false);
                    }
                  }}
                  loading={formLoading}
                  error={formError}
                />
              )}
            </div>
            {/* Edit Task Modal */}
            {editTask && (
              <Modal isOpen={!!editTask} onClose={() => { setEditTask(null); setFormError(""); }} title="Edit Task">
                <TaskForm
                  initial={editTask}
                  onSubmit={async (data) => {
                    setFormLoading(true);
                    setFormError("");
                    try {
                      await updateTask(editTask._id, data);
                      setEditTask(null);
                      setShowForm(false);
                      showToast('Task updated successfully', 'success');
                    } catch (err) {
                      setFormError("Failed to update task");
                      showToast('Failed to update task', 'error');
                    } finally {
                      setFormLoading(false);
                    }
                  }}
                  loading={formLoading}
                  error={formError}
                />
              </Modal>
            )}
          </div>

          {/* Task List Section */}
          <div className="w-full mb-8">
            <h2 className="text-2xl font-bold mb-4 text-blue-700">Your Tasks</h2>
            <TaskList
              tasks={filteredTasks}
              onUpdate={(id, task) => {
                setEditTask(task);
                setFormError("");
              }}
              onDelete={handleDeleteTask}
              onToggleStatus={handleToggleStatus}
              onReorder={(reordered) => {
                // Update order field for each task
                const reorderedWithOrder = reordered.map((t, idx) => ({ ...t, order: idx }));
                // Update context/backend
                updateTaskOrder(reorderedWithOrder.map(t => ({ id: t._id, order: t.order })));
              }}
            />
          </div>
        </div>
        {/* Right: Email Reminders */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <EmailReminders />
        </div>
      </div>

      {/* Footer / Info Section */}
      <div className="w-full max-w-3xl mt-12 mb-8 p-6 rounded-xl shadow bg-white/90 border border-blue-100 text-center">
        <h3 className="text-lg font-bold text-blue-700 mb-2">About This App</h3>
        <p className="text-gray-700 mb-2">This is a professional, full-featured task management dashboard built with the MERN stack. You can add, edit, filter, and complete tasks, and receive email reminders for due dates. All your data is secure and private.</p>
        <p className="text-gray-500 text-sm">Need help or have feedback? Contact support@yourapp.com</p>
        <div className="mt-4 text-xs text-gray-400">&copy; {new Date().getFullYear()} Task Management App. All rights reserved.</div>
      </div>
    </div>
  );
};

export default DashboardPage; 