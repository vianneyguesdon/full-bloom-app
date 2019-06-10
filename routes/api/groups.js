const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");

// Define path for uploads images
const upload = multer({ dest: "public/uploads/" });

// Initialize slug Module
const slug = require("slug");
slug.defaults.mode = "rfc3986";

// Group Model
const Group = require("../../models/Group");

// Ici on compare check quelle est l'extension de l'image reçue
const getExtension = file => {
  switch (file.mimetype) {
    case "image/png":
      return ".png";
    case "image/jpeg":
      return ".jpg";
    case "image/gif":
      return ".gif";
    default:
      return ".jpg";
  }
};

// @route   GET api/groups
// @desc    Get all groups
// @access  Public
router.get("/", (req, res) => {
  Group.find()
    .then(group => res.json(group))
    .catch(err =>
      res.status(404).json({
        message: "Il n'y a pas encore de groupe politique"
      })
    );
});

// @route   GET api/groups/:id
// @desc    Get group by id
// @access  Public
router.get("/:id", (req, res) => {
  Group.findById(req.params.id)
    .then(group => res.json(group))
    .catch(err =>
      res.status(404).json({
        message: "Il n'y a pas de groupe politique avec cet ID"
      })
    );
});

// @route   GET api/groups/slug/:slug
// @desc    Get group by slug
// @access  Public
router.get("/slug/:slug", (req, res) => {
  const toFind = {
    slug: req.params.slug
  };
  Group.findOne(toFind)
    .then(group => res.json(group))
    .catch(err =>
      res.status(404).json({
        message: "Il n'y a pas de groupe politique avec cette référence"
      })
    );
});

// @route   POST api/groups/add
// @desc    Create group
// @access  Private
router.post("/add", upload.single("image"), (req, res) => {
  console.info(req);
  const data = JSON.parse(req.body.data);
  // console.log("data", data);

  if (req.file === undefined) {
    console.log("<< undefined loop");
    Group.findOne({ name: data.name }).then(group => {
      if (group) {
        return res
          .status(400)
          .json({ message: "Ce groupe politique existe déjà" });
      } else {
        const newGroup = new Group({
          name: data.name,
          description: data.description || "",
          slug: slug(data.name.toString())
        });
        newGroup.save().then(group => res.json(group));
      }
    });
  } else {
    const extension = getExtension(req.file); // Voir en dessous
    const filename = req.file.filename + extension;
    const serverPictureName = "public/uploads/" + filename;
    const apiPictureName = "uploads/" + filename;
    fs.rename(req.file.path, serverPictureName, function(err) {
      if (err) {
        // console.log("il y a une erreur", err);
        return res
          .status(400)
          .json({ img: "L'image n'a pas pu être sauvegardée" });
      }
      Group.findOne({ name: data.name }).then(group => {
        if (group) {
          return res
            .status(400)
            .json({ message: "Ce groupe politique existe déjà" });
        } else {
          const newGroup = new Group({
            name: data.name,
            description: data.description || "",
            picture: apiPictureName || "",
            slug: slug(data.name.toString())
          });
          newGroup.save().then(group => res.json(group));
        }
      });
    });
  }
});

// @route   PUT api/groups/:id
// @desc    Update group
// @access  Private
router.put("/:id", (req, res) => {
  Group.findById(req.params.id).then(group => {
    const groupFields = {};
    if (req.body.name) groupFields.name = req.body.name;
    if (req.body.description) groupFields.description = req.body.description;
    if (req.body.slug) groupFields.slug = slug(req.body.name.toString());
    Group.findOneAndUpdate(
      { _id: req.params.id },
      { $set: groupFields },
      { useFindAndModify: false }
    ).then(group => res.json(group));
  });
});

// @route   DELETE api/groups/:id
// @desc    Delete group
// @access  Private
router.delete("/:id", (req, res) => {
  Group.findById(req.params.id).then(group => {
    group
      .deleteOne()
      .then(() =>
        res.json({
          success: true,
          message: "Le groupe a été supprimé"
        })
      )
      .catch(err =>
        res.status(404).json({
          error: true,
          message: "Il n'y a pas de groupe à supprimer"
        })
      );
  });
});

module.exports = router;
