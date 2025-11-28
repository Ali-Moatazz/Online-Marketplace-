const Flag = require('../models/Flag');
const User = require('../models/User');

// Create a new flag and increment reported user's flagsCount
exports.createFlag = async (req, res) => {
  try {
    const { reporterId, reportedId, orderId, reason, type } = req.body;

    const flag = await Flag.create({ reporterId, reportedId, orderId, reason, type });

    // Increment flagsCount
    await User.findByIdAndUpdate(reportedId, { $inc: { flagsCount: 1 } });

    res.status(201).json(flag);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all flags reported against a specific user, with reporter info
exports.getFlagsForUser = async (req, res) => {
  try {
    const reportedId = req.params.userId;
    const flags = await Flag.find({ reportedId })
      .populate('reporterId', 'name email')
      .sort({ createdAt: -1 });

    res.json(flags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update the status of a flag
exports.updateFlagStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['open', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updated = await Flag.findByIdAndUpdate(id, { status }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a flag and decrement flagsCount
exports.deleteFlag = async (req, res) => {
  try {
    const flag = await Flag.findByIdAndDelete(req.params.id);
    if (flag) {
      await User.findByIdAndUpdate(flag.reportedId, { $inc: { flagsCount: -1 } });
    }
    res.json({ success: true, message: 'Flag deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
