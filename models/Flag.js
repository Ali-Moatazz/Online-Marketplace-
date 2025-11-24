const mongoose = require('mongoose');

const FlagSchema = new mongoose.Schema({
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  reportedId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  reason: { type: String, required: true },
  type: { type: String, enum: ['seller_flagging_buyer','buyer_flagging_seller'], required: true },
  status: { type: String, enum: ['open','resolved'], default: 'open', index: true },
}, { timestamps: { createdAt: 'createdAt' } });

module.exports = mongoose.model('Flag', FlagSchema);
