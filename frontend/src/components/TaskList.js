import React, { useState, useEffect } from 'react';
import TaskItem from './TaskItem';
import Spinner from './Spinner';
import axios from '../utils/axios';

const TaskList = ({ tasks, onUpdate, onDelete, onToggleStatus, onReorder }) => {
  const [search, setSearch] = useState('');
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  
  useEffect(() => {
    axios.get('/api/auth/users').then(res => setAllUsers(res.data)).catch(() => setAllUsers([]));
  }, []);

  const filteredTasks = tasks.filter(task => {
    const searchLower = search.toLowerCase();
    return (
      task.title.toLowerCase().includes(searchLower) ||
      task.description.toLowerCase().includes(searchLower) ||
      (task.category && task.category.toLowerCase().includes(searchLower)) ||
      (task.priority && task.priority.toLowerCase().includes(searchLower))
    );
  });

  // Drag and drop handlers
  const handleDragStart = (id) => setDraggedId(id);
  const handleDragEnter = (id) => setDragOverId(id);
  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };
  const handleDrop = (id) => {
    if (draggedId === null || draggedId === id) return;
    const fromIndex = filteredTasks.findIndex(t => t._id === draggedId);
    const toIndex = filteredTasks.findIndex(t => t._id === id);
    if (fromIndex === -1 || toIndex === -1) return;
    const reordered = [...filteredTasks];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    setDraggedId(null);
    setDragOverId(null);
    if (onReorder) onReorder(reordered);
  };

  // DEBUG LOGS
  console.log('TaskList tasks prop:', tasks);
  console.log('TaskList filteredTasks:', filteredTasks);

  return (
    <div className="fade-in">
      {/* Search bar on top */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between card" style={{ background: 'rgba(255,255,255,0.95)' }}>
        <input
          type="text"
          placeholder="Search tasks (title, description, category, priority)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-96 p-2 rounded border-2 border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition mb-2 sm:mb-0"
        />
        <span className="text-gray-500 text-sm ml-0 sm:ml-4">{filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found</span>
      </div>
      {/* Task list */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center text-gray-500">No tasks found.</div>
        ) : (
          filteredTasks.map((task, idx) => {
            const sharedUsers = (task.sharedWith || []).map(id => allUsers.find(u => u._id === id)).filter(Boolean);
            return (
              <div
                key={task._id}
                draggable
                onDragStart={() => handleDragStart(task._id)}
                onDragEnter={() => handleDragEnter(task._id)}
                onDragEnd={handleDragEnd}
                onDrop={() => handleDrop(task._id)}
                onDragOver={e => e.preventDefault()}
                className={
                  'transition-all ' +
                  (dragOverId === task._id && draggedId !== null ? ' ring-4 ring-blue-400 bg-blue-50 ' : '')
                }
                style={{ cursor: 'grab' }}
              >
                <TaskItem
                  task={task}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onToggleStatus={onToggleStatus}
                  sharedUsers={sharedUsers}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TaskList; 