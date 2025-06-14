const Task = require('../models/Task');
const User = require('../models/User');
const { sendTaskReminder } = require('./emailService');

const checkDueTasks = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find tasks that are due today and haven't had reminders sent
    const dueTasks = await Task.find({
      dueDate: {
        $gte: today,
        $lt: tomorrow
      },
      completed: false,
      reminderSent: false
    }).populate('user', 'email');

    // Send reminders for each due task
    for (const task of dueTasks) {
      if (task.user && task.user.email) {
        const emailSent = await sendTaskReminder(task.user.email, task);
        if (emailSent) {
          // Mark reminder as sent
          task.reminderSent = true;
          await task.save();
        }
      }
    }

    console.log(`Processed ${dueTasks.length} due tasks for reminders`);
  } catch (error) {
    console.error('Error in reminder service:', error);
  }
};

// Run the check every hour
const startReminderService = () => {
  // Run immediately on startup
  checkDueTasks();
  
  // Then run every hour
  setInterval(checkDueTasks, 60 * 60 * 1000);
};

module.exports = {
  startReminderService
}; 