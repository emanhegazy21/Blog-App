const groupService = require('../services/group.services');

const createGroup = async (req, res, next) => {
  try {
    const group = await groupService.createGroup(req.body, req.user);
    res.status(201).json({ status: 'success', data: group });
  } catch (err) {
    next(err);
  }
};

const getAllGroups = async (req, res, next) => {
  try {
    const groups = await groupService.getAllGroups();
    res.status(200).json({ status: 'success', results: groups.length, data: groups });
  } catch (err) {
    next(err);
  }
};

const getGroupById = async (req, res, next) => {
  try {
    const group = await groupService.getGroupById(req.params.id);
    res.status(200).json({ status: 'success', data: group });
  } catch (err) {
    next(err);
  }
};

const addMember = async (req, res, next) => {
  try {
    const group = await groupService.addMember(req.params.id, req.body.userId, req.user);
    res.status(200).json({ status: 'success', data: group });
  } catch (err) {
    next(err);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const group = await groupService.removeMember(req.params.id, req.body.userId, req.user);
    res.status(200).json({ status: 'success', data: group });
  } catch (err) {
    next(err);
  }
};

const updatePermission = async (req, res, next) => {
  try {
    const group = await groupService.updatePermission(
      req.params.id,
      req.body.userId,
      req.body.canPost,
      req.user
    );
    res.status(200).json({ status: 'success', data: group });
  } catch (err) {
    next(err);
  }
};

const addAdmin = async (req, res, next) => {
  try {
    const group = await groupService.addAdmin(req.params.id, req.body.userId, req.user);
    res.status(200).json({ status: 'success', data: group });
  } catch (err) {
    next(err);
  }
};

module.exports = { createGroup, getAllGroups, getGroupById, addMember, removeMember, updatePermission, addAdmin };
