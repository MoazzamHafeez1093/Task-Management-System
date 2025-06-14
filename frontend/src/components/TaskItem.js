import React from 'react';

const priorityColors = {
  high: 'bg-red-400 text-white',
  medium: 'bg-yellow-400 text-white',
  low: 'bg-green-400 text-white',
};

const TaskItem = ({ task, onUpdate, onDelete, onToggleStatus, sharedUsers = [] }) => {
  const handleToggleClick = () => {
    const confirmMsg = task.completed
      ? 'Mark this task as incomplete?'
      : 'Mark this task as complete?';
    if (window.confirm(confirmMsg)) {
      onToggleStatus(task._id);
    }
  };

  return (
    <div className="card fade-in flex flex-col sm:flex-row items-center justify-between transition-transform duration-200 hover:scale-105 hover:shadow-xl" style={{ background: 'linear-gradient(120deg, #36d1c4 0%, #f5a623 100%)', color: '#333' }}>
      <div className="flex-1 w-full">
        <div className="flex items-center mb-2">
          <span className="font-bold text-lg mr-2" style={{ color: '#fff', textDecoration: task.completed ? 'line-through' : 'none' }}>{task.title}</span>
          <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${priorityColors[task.priority] || 'bg-gray-300 text-gray-700'}`}>{task.priority}</span>
          {task.category && (
            <span className="ml-2 px-2 py-1 rounded text-xs font-semibold bg-blue-200 text-blue-800">{task.category}</span>
          )}
        </div>
        <div className="mb-2 text-white opacity-90">{task.description}</div>
        {sharedUsers.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            <span className="text-xs text-blue-100 mr-1">Shared with:</span>
            {sharedUsers.map(u => (
              <span key={u._id} className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs">{u.username || u.email}</span>
            ))}
          </div>
        )}
        <div className="text-xs text-white opacity-80">
          Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-2 mt-4 sm:mt-0 sm:ml-4">
        <button
          className={`btn ${task.completed ? 'bg-gray-500 hover:bg-gray-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
          onClick={handleToggleClick}
        >
          {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
        </button>
        <button
          className="btn bg-blue-500 hover:bg-blue-600"
          onClick={() => onUpdate(task._id, task)}
        >
          Edit
        </button>
        <button
          className="btn bg-red-500 hover:bg-red-600"
          onClick={() => onDelete(task._id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskItem; 