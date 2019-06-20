const express = require("express");
const router = express.Router();
const multer = require("multer");

// Define path for uploads images
const upload = multer({ dest: "public/uploads/" });

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
      res.json({
        msg: "Il n'y a pas de texte d'introduction",
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
      return res.json({ msg: "Cette catégorie existe déjà" });
    } else {
      const newIntro = new Intro({
        title: data.title,
        paragraph1: data.paragraph1,
        paragraph2: data.paragraph2,
        paragraph3: data.paragraph3
      });

      newIntro
        .save()
        .then(intro => res.json({ intro, msg: "L'intro a été postée" }));
    }
  });
});

// @route   PUT api/intros/:id
// @desc    Update intros
// @access  Private
router.put("/:id", upload.single("image"), (req, res) => {
  const data = JSON.parse(req.body.data);

  console.log("@1");
  console.log(req.params.id, "req.params.id");

  Intro.findById(req.params.id).then(intros => {
    console.log("@2");
    const introsFields = {};
    console.log("data", data);

    if (data.title !== undefined) {
      console.log("ici title");
      introsFields.title = data.title;
      introsFields.slug = slug(data.title.toString());
    }
    if (data.paragraph1 !== undefined) {
      introsFields.paragraph1 = data.paragraph1;
    }
    if (data.paragraph2 !== undefined) {
      introsFields.paragraph2 = data.paragraph2;
    }
    if (data.paragraph3 !== undefined) {
      introsFields.paragraph3 = data.paragraph3;
    }
    console.log(req.params.id, "req.params.id2 ");
    console.log(introsFields, "introsFields");
    Intro.findOneAndUpdate(
      { _id: req.params.id },
      { $set: introsFields },
      { useFindAndModify: false }
    ).then(intros =>
      res.json({ intros, msg: "L'introduction du site a été modifiée" })
    );
  });
});

module.exports = router;
