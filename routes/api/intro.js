const express = require("express");
const router = express.Router();

// Initialize slug Module
const slug = require("slug");
slug.defaults.mode = "rfc3986";

// Intro Model
const Intro = require("../../models/Intro");

// @route   GET api/intro/
// @desc    Get all intro data
// @access  Public
router.get("/", (req, res) => {
  Intro.find()
    .then(intro => {
      res.json(intro);
    })
    .catch(err =>
      res.status(404).json({
        message: "Il n'y a pas de texte d'introduction",
        error: err
      })
    );
});

// @route   POST api/intro/add
// @desc    Create new intro
// @access  Private
router.post("/add", (req, res) => {
  const data = req.body;
  // console.log("<<< data", data);
  Intro.findOne({ title: data.name }).then(intro => {
    if (intro) {
      return res.status(400).json({ name: "Cette catégorie existe déjà" });
    } else {
      const newIntro = new Intro({
        title: data.title,
        paragraph1: data.paragraph1,
        paragraph2: data.paragraph2,
        paragraph3: data.paragraph3
      });

      newIntro.save().then(intro => res.json(intro));
    }
  });
});

// @route   PUT api/intro/:id
// @desc    Update the intro
// @access  Private
router.put("/:id", (req, res) => {
  Intro.findById(req.params.id).then(intro => {
    const introFields = {};
    if (req.body.title) introFields.title = req.body.title;
    if (req.body.paragraph1) introFields.paragraph1 = req.body.paragraph1;
    if (req.body.paragraph2) introFields.paragraph2 = req.body.paragraph2;
    if (req.body.paragraph3) introFields.paragraph3 = req.body.paragraph3;
    Intro.findOneAndUpdate(
      { _id: req.params.id },
      { $set: introFields },
      { useFindAndModify: false }
    ).then(() => res.json(introFields));
  });
});

module.exports = router;
