const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Vote Schema
const VoteSchema = new Schema({
  decision: {
    type: String,
    required: true
  },
  deputy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "deputies",
    index: true
  },
  law: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "laws",
    index: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = Vote = mongoose.model("vote", VoteSchema);
