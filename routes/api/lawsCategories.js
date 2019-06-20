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
      res.json({
        msg: "Il n'y a pas encore de catégories",
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
      res.json({
        msg: "Il n'y a pas de catégorie de loi avec cet ID"
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
      res.json({
        msg: "Il n'y a pas de texte avec ce slug"
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
      return res.json({ msg: "Ce texte existe déjà" });
    } else {
      const newLawCategory = new LawCategory({
        name: data.name,
        description: data.description,
        slug: slug(data.name.toString())
      });

      newLawCategory
        .save()
        .then(law => res.json({ law, msg: "Le texte a été enregistré" }));
    }
  });
});

// @route   PUT api/law-categories/:id
// @desc    Update lawscategories
// @access  Private
router.put("/:id", upload.single("image"), (req, res) => {
  const data = JSON.parse(req.body.data);
  console.log("req.file", req.file);

  console.log("@1");
  console.log(req.params.id, "req.params.id");

  LawCategory.findById(req.params.id).then(lawscategories => {
    console.log("@2");
    const lawscategoriesFields = {};
    console.log("data", data);

    if (data.name !== undefined) {
      console.log("ici name");
      lawscategoriesFields.name = data.name;
      lawscategoriesFields.slug = slug(data.name.toString());
    }
    if (data.description !== undefined) {
      lawscategoriesFields.description = data.description;
    }
    console.log(req.params.id, "req.params.id2 ");
    console.log(lawscategoriesFields, "lawscategoriesFields");
    LawCategory.findOneAndUpdate(
      { _id: req.params.id },
      { $set: lawscategoriesFields },
      { useFindAndModify: false }
    ).then(lawscategories =>
      res.json({ lawscategories, msg: "Le texte a été modifié" })
    );
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
          msg: "Le texte a été supprimé"
        })
      )
      .catch(err =>
        res.json({
          error: true,
          msg: "Il n'y a pas de texte à supprimer"
        })
      );
  });
});

module.exports = router;
