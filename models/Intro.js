const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create the Intro Schema
const IntroSchema = new Schema({
  title: {
    type: String,
    index: true
  },
  paragraph1: {
    type: String
  },
  paragraph2: {
    type: String
  },
  paragraph3: {
    type: String
  }
});

module.exports = Intro = mongoose.model("intro", IntroSchema);
