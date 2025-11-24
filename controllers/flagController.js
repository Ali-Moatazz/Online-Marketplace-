const Flag = require('../models/Flag');

exports.createFlag = async (req, res) => {
  try {
    const { reporterId, reportedId, reason, type } = req.body;
    if (!reporterId || !reportedId || !reason || !type) return res.status(400).json({ error: 'Missing fields' });
    const flag = await Flag.create({ reporterId, reportedId, reason, type });
    res.status(201).json(flag);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFlagsForUser = async (req, res) => {
  try {
    const reportedId = req.params.userId;
    const flags = await Flag.find({ reportedId }).populate('reporterId','name email').sort({ createdAt: -1 });
    res.json(flags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateFlagStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['open','resolved'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const updated = await Flag.findByIdAndUpdate(id, { status }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
