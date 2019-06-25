const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Law Schema
const LawSchema = new Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  subTitle: {
    type: String
  },
  protect: {
    type: Boolean,
    index: true
  },
  commencement: {
    type: Date
  },
  resume: {
    type: String
  },
  fullText: {
    type: String
  },
  link: {
    type: String
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "lawCategories"
  },
  slug: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  }
});

module.exports = Law = mongoose.model("laws", LawSchema);
