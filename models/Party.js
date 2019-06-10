const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Party Schema
const PartySchema = new Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String
  },
  picture: {
    type: String
  },
  slug: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = Party = mongoose.model("parties", PartySchema);
