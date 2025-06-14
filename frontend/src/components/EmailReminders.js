import React from 'react';
import { useTaskContext } from '../context/TaskContext';

const EmailReminders = () => {
  const { tasks } = useTaskContext();
  const now = new Date();

  const sentReminders = tasks.filter(
    (task) => task.reminderSent && task.dueDate
  );
  const upcomingReminders = tasks
    .filter((task) => !task.reminderSent && task.dueDate && new Date(task.dueDate) > now)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  // Helper to render sharedWith badges
  const renderSharedWithBadges = (sharedWith) => {
    if (!Array.isArray(sharedWith) || sharedWith.length === 0) return null;
    // Only show user objects with username/email
    const users = sharedWith.filter(u => typeof u === 'object' && (u.username || u.email));
    if (users.length > 0) {
      return (
        <div className="flex flex-wrap gap-1 mt-1">
          <span className="text-xs text-blue-700 mr-1">Shared with:</span>
          {users.map(u => (
            <span key={u._id} className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs">{u.username || u.email}</span>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card w-full max-w-2xl mb-6" style={{ background: 'rgba(255,255,255,0.95)' }}>
      <h2 className="text-xl font-bold mb-4 text-blue-700">Email Reminders</h2>
      <div className="mb-4">
        <h3 className="font-semibold text-green-700 mb-2">Sent Reminders</h3>
        {sentReminders.length === 0 ? (
          <div className="text-gray-500 text-sm">No reminders sent yet.</div>
        ) : (
          <ul className="space-y-1">
            {sentReminders.map((task) => (
              <li key={task._id} className="flex justify-between items-center">
                <span>{task.title}</span>
                <span className="text-xs text-gray-600">Sent for {new Date(task.dueDate).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h3 className="font-semibold text-orange-700 mb-2">Upcoming Reminders</h3>
        {upcomingReminders.length === 0 ? (
          <div className="text-gray-500 text-sm">No upcoming reminders.</div>
        ) : (
          <ul className="space-y-1">
            {upcomingReminders.map((task) => (
              <li key={task._id} className="flex justify-between items-center">
                <span>{task.title}</span>
                <span className="text-xs text-gray-600">Will send on {new Date(task.dueDate).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-6 pt-4 border-t border-blue-200">
        <h3 className="font-semibold text-blue-700 mb-2 flex items-center gap-1"><span role="img" aria-label="shared">🔗</span> Shared Tasks</h3>
        {tasks.filter(task => Array.isArray(task.sharedWith) && task.sharedWith.length > 0).length === 0 ? (
          <div className="text-gray-500 text-sm">No tasks are currently shared.</div>
        ) : (
          <ul className="space-y-2">
            {tasks.filter(task => Array.isArray(task.sharedWith) && task.sharedWith.length > 0).map(task => (
              <li key={task._id} className="flex flex-col gap-1 bg-blue-50 rounded p-2">
                <span className="font-semibold text-blue-800">{task.title}</span>
                {renderSharedWithBadges(task.sharedWith)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EmailReminders; 