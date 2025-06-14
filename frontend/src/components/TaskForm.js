import React, { useState, useEffect, useRef } from "react";
import axios from '../utils/axios';

const priorities = ["low", "medium", "high"];
const categories = ["Work", "Personal", "Shopping", "Health", "Education", "Other"];

const TaskForm = ({ initial = {}, onSubmit, loading, error }) => {
  const [title, setTitle] = useState(initial.title || "");
  const [description, setDescription] = useState(initial.description || "");
  const [dueDate, setDueDate] = useState(initial.dueDate ? initial.dueDate.slice(0, 10) : "");
  const [priority, setPriority] = useState(initial.priority || "medium");
  const [category, setCategory] = useState(initial.category || "Other");
  const [tags, setTags] = useState(initial.tags ? initial.tags.join(', ') : '');
  const [sharedWith, setSharedWith] = useState(initial.sharedWith || []);
  const [allUsers, setAllUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setTitle(initial.title || "");
    setDescription(initial.description || "");
    setDueDate(initial.dueDate ? initial.dueDate.slice(0, 10) : "");
    setPriority(initial.priority || "medium");
    setCategory(initial.category || "Other");
    setTags(initial.tags ? initial.tags.join(', ') : '');
    setSharedWith(initial.sharedWith || []);
  }, [initial]);

  useEffect(() => {
    // Fetch all users for sharing dropdown
    axios.get(`${process.env.REACT_APP_API_URL}/api/auth/users`).then(res => {
      setAllUsers(res.data);
      // console.log('Fetched users for sharing:', res.data);
    }).catch((err) => {
      setAllUsers([]);
      // console.error('Error fetching users for sharing:', err);
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    onSubmit({ title, description, dueDate, priority, category, tags: formattedTags, sharedWith });
  };

  const handleUserSearchFocus = () => setDropdownOpen(true);

  const handleAddUser = (userId) => {
    if (!sharedWith.includes(userId)) {
      setSharedWith([...sharedWith, userId]);
    }
    setUserSearch('');
    setDropdownOpen(false);
  };

  const handleRemoveUser = (userId) => {
    setSharedWith(sharedWith.filter(id => id !== userId));
  };

  const filteredUsers = (userSearch.trim() === ''
    ? allUsers
    : allUsers.filter(
        u =>
          (u.username && u.username.toLowerCase().includes(userSearch.toLowerCase())) ||
          (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase()))
      )
  ).filter(u => !sharedWith.includes(u._id));

  return (
    <div style={{maxHeight: '80vh', overflowY: 'auto'}} className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:text-gray-100 transition-colors duration-200">
        {error && <div className="text-red-500 text-sm text-center" role="alert">{error}</div>}
        <div>
          <label className="block mb-1 font-medium" htmlFor="task-title">Title</label>
          <input
            id="task-title"
            type="text"
            className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition-all duration-200"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            aria-required="true"
            aria-label="Task title"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium" htmlFor="task-desc">Description</label>
          <textarea
            id="task-desc"
            className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition-all duration-200"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-label="Task description"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium" htmlFor="task-category">Category</label>
          <select
            id="task-category"
            className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition-all duration-200"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Task category"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium" htmlFor="task-due">Due Date</label>
          <input
            id="task-due"
            type="date"
            className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition-all duration-200"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            aria-label="Task due date"
          />
          {dueDate && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {new Date(dueDate) < new Date() ? (
                <span className="text-red-500">This date is in the past</span>
              ) : (
                <span>You will receive a reminder email on the due date</span>
              )}
            </p>
          )}
        </div>
        {initial.assignedDate && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Assigned on: {new Date(initial.assignedDate).toLocaleDateString()}
          </div>
        )}
        <div>
          <label className="block mb-1 font-medium" htmlFor="task-priority">Priority</label>
          <select
            id="task-priority"
            className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition-all duration-200"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            aria-label="Task priority"
          >
            {priorities.map((p) => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium" htmlFor="task-tags">Tags (comma-separated)</label>
          <input
            id="task-tags"
            type="text"
            className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition-all duration-200"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            aria-label="Task tags, comma separated"
            placeholder="e.g., urgent, project-x"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Share with Users</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {sharedWith.map(id => {
              const user = allUsers.find(u => u._id === id);
              return user ? (
                <span key={id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1">
                  {user.username || user.email}
                  <button type="button" className="ml-1 text-red-500 hover:text-red-700" onClick={() => handleRemoveUser(id)}>&times;</button>
                </span>
              ) : null;
            })}
          </div>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 mb-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            placeholder="Search users by username or email"
            value={userSearch}
            onChange={e => setUserSearch(e.target.value)}
            onFocus={handleUserSearchFocus}
          />
          <div className="relative" ref={dropdownRef}>
            {dropdownOpen && (
              filteredUsers.length > 0 ? (
                <div className="border rounded bg-white dark:bg-gray-700 shadow max-h-32 overflow-y-auto z-20 absolute">
                  {filteredUsers.map(u => (
                    <div
                      key={u._id}
                      className="px-3 py-2 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer"
                      onClick={() => handleAddUser(u._id)}
                    >
                      {u.username} <span className="text-xs text-gray-500">({u.email})</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border rounded bg-white dark:bg-gray-700 shadow max-h-32 overflow-y-auto z-20 absolute px-3 py-2 text-gray-500 text-sm">
                  No users available to share with.
                </div>
              )
            )}
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-all duration-200 focus-visible:outline focus-visible:ring-2 focus-visible:ring-green-500 transform active:scale-98"
          disabled={loading}
          aria-label={loading ? 'Saving task' : initial._id ? 'Update Task' : 'Add Task'}
        >
          {loading ? "Saving..." : initial._id ? "Update Task" : "Add Task"}
        </button>
      </form>
    </div>
  );
};

export default TaskForm; 