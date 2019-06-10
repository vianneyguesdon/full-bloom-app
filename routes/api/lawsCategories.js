const express = require("express");
const router = express.Router();
const multer = require("multer");

// Define path for uploads images
const upload = multer({ dest: "public/uploads/" });

// Initialize slug Module
const slug = require("slug");
slug.defaults.mode = "rfc3986";

// Law Category Model
const LawCategory = require("../../models/LawCategory");

// @route   GET api/laws-categories/
// @desc    Get all laws categories
// @access  Public
router.get("/", (req, res) => {
  LawCategory.find()
    .populate("laws", [
      "title",
      "subTitle",
      "protect",
      "commencement",
      "resume",
      "fullText",
      "link",
      "slug",
      "created"
    ])
    .then(categories => {
      res.json(categories);
    })
    .catch(err =>
      res.status(404).json({
        categories: "Il n'y a pas encore de catégories",
        error: err
      })
    );
});

// @route   GET api/laws-categories/:id
// @desc    Get law category by Id
// @access  Public
router.get("/:id", (req, res) => {
  LawCategory.findById(req.params.id)
    .populate("laws", [
      "name",
      "subTitle",
      "protect",
      "commencement",
      "resume",
      "fullText",
      "link",
      "slug",
      "created"
    ])
    .then(category => res.json(category))
    .catch(err =>
      res.status(404).json({
        noCategoryFound: "Il n'y a pas de catégorie de loi avec cet ID"
      })
    );
});

// @route   GET api/laws-categories/slug/:slug
// @desc    Get law category by slug
// @access  Public
router.get("/slug/:slug", (req, res) => {
  const toFind = {
    slug: req.params.slug
  };
  LawCategory.findOne(toFind)
    .populate("laws", [
      "name",
      "subTitle",
      "protect",
      "commencement",
      "resume",
      "fullText",
      "link",
      "slug",
      "created"
    ])
    .then(category => res.json(category))
    .catch(err =>
      res.status(404).json({
        message: "Il n'y a pas de catégorie avec cette référence"
      })
    );
});

// @route   POST api/laws-categories/add
// @desc    Create new law category
// @access  Private
router.post("/add", upload.single("image"), (req, res) => {
  const data = JSON.parse(req.body.data);
  // console.log("data", data);
  LawCategory.findOne({ name: data.name }).then(category => {
    if (category) {
      return res.status(400).json({ name: "Cette catégorie existe déjà" });
    } else {
      const newLawCategory = new LawCategory({
        name: data.name,
        description: data.description,
        slug: slug(data.name.toString())
      });

      newLawCategory.save().then(law => res.json(law));
    }
  });
});

// @route   PUT api/laws-categories/:id
// @desc    Update a law category
// @access  Private
router.put("/:id", (req, res) => {
  LawCategory.findById(req.params.id).then(law => {
    const lawFields = {};
    if (req.body.name) lawFields.name = req.body.name;
    if (req.body.description) lawFields.description = req.body.description;
    if (req.body.laws) lawFields.laws = req.body.laws;
    if (req.body.slug) lawFields.slug = slug(req.body.name.toString());
    LawCategory.findOneAndUpdate(
      { _id: req.params.id },
      { $set: lawFields },
      { useFindAndModify: false }
    ).then(law => res.json(law));
  });
});

// @route   DELETE api/laws-categories/:id
// @desc    Delete a law
// @access  Private
router.delete("/:id", (req, res) => {
  LawCategory.findById(req.params.id).then(law => {
    law
      .deleteOne()
      .then(() =>
        res.json({
          success: true,
          message: "Le texte a été supprimé"
        })
      )
      .catch(err =>
        res.status(404).json({
          error: true,
          message: "Il n'y a pas de texte à supprimer"
        })
      );
  });
});

module.exports = router;
