const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect, lead } = require('../middleware/auth');

// @desc   Get all projects
// @route  GET /api/projects
router.get('/', protect, async (req, res, next) => {
  try {
    let projects;
    if (req.user.role === 'TEAM_LEAD') {
      projects = await Project.find({ teamLeadId: req.user._id }).populate('teamLeadId', 'name email');
    } else {
      // Members can see all projects
      projects = await Project.find().populate('teamLeadId', 'name email');
    }
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

// @desc   Create a project
// @route  POST /api/projects
router.post('/', protect, lead, async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      res.status(400);
      throw new Error('Project name is required');
    }
    const project = await Project.create({ name, description, teamLeadId: req.user._id });
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
});

// @desc   Update a project
// @route  PUT /api/projects/:id
router.put('/:id', protect, lead, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }
    if (project.teamLeadId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this project');
    }
    project.name = req.body.name || project.name;
    project.description = req.body.description || project.description;
    const updated = await project.save();
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// @desc   Delete a project
// @route  DELETE /api/projects/:id
router.delete('/:id', protect, lead, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }
    if (project.teamLeadId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this project');
    }
    await project.deleteOne();
    res.json({ message: 'Project removed' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
