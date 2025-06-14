const Task = require("../models/Task");

// Controller for all task-related operations: fetch, create, update, delete, share, reorder, etc.
// Handles filtering, searching, and populating shared users.
// Used by routes to process requests and interact with the Task model.

// @desc    Get all tasks (owned or shared), with filtering and search
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, search, tags } = req.query; // Destructure new filter params
    // Show tasks owned by user or shared with user
    const query = {
      $or: [
        { user: req.user.id },
        { sharedWith: req.user.id }
      ]
    };

    if (status) {
      query.completed = status === 'completed';
    }
    if (priority) {
      query.priority = priority;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      if (tagArray.length > 0) {
        query.tags = { $in: tagArray };
      }
    }

    const tasks = await Task.find(query).sort({ order: 1 }).populate('sharedWith', 'username email');
    // Debug: log sharedWith for each task
    console.log('[getTasks] Returned tasks:', tasks.map(t => ({ id: t._id, sharedWith: t.sharedWith })));
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new task (with tags, sharing, etc.)
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, completed, dueDate, priority, tags, sharedWith } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Please add a title" });
    }

    const task = await Task.create({
      user: req.user.id,
      title,
      description,
      completed: completed !== undefined ? completed : false,
      dueDate,
      priority: priority || 'medium',
      tags: tags || [],
      sharedWith: sharedWith || [],
    });
    // Populate sharedWith for response
    const populatedTask = await Task.findById(task._id).populate('sharedWith', 'username email');
    res.status(201).json(populatedTask);
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Make sure user owns task
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized to view this task" });
    }

    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

// @desc    Update a task (edit details, tags, sharing, etc.)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const { title, description, completed, dueDate, priority, tags, sharedWith } = req.body;

    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Allow owner or shared user to update (optionally restrict editing for shared users)
    const isOwner = task.user.toString() === req.user.id;
    const isShared = task.sharedWith && task.sharedWith.map(id => id.toString()).includes(req.user.id);
    if (!isOwner && !isShared) {
      return res.status(401).json({ message: "Not authorized to update this task" });
    }
    // Optionally: Only allow shared users to edit if you want (add more logic here)

    const updateFields = { title, description, completed, dueDate, priority, tags };
    if (sharedWith !== undefined) updateFields.sharedWith = sharedWith;
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('sharedWith', 'username email');

    res.status(200).json(updatedTask);
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Make sure user owns task
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized to delete this task" });
    }

    await task.remove();

    res.status(200).json({ message: "Task removed" });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle completion status of a task
// @route   PATCH /api/tasks/:id/toggle
// @access  Private
const toggleTask = async (req, res, next) => {
  try {
    console.log('ToggleTask called for ID:', req.params.id, 'by user:', req.user.id);
    let task = await Task.findById(req.params.id);
    console.log('Task found:', task);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (task.user.toString() !== req.user.id) {
      console.log('User not authorized:', req.user.id, 'Task user:', task.user.toString());
      return res.status(401).json({ message: "Not authorized to toggle this task" });
    }
    task.completed = !task.completed;
    await task.save();
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

// @desc    Share a task with other users
// @route   PATCH /api/tasks/:id/share
// @access  Private
// @desc    Reorder tasks (drag-and-drop)
// @route   PUT /api/tasks/reorder
// @access  Private

module.exports = {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  toggleTask,
}; 