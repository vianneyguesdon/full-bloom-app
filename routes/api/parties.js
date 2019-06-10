const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");

// Define path for uploads images
const upload = multer({ dest: "public/uploads/" });

// Initialize slug Module
const slug = require("slug");
slug.defaults.mode = "rfc3986";

// Party Model
const Party = require("../../models/Party");

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

// @route   GET api/parties
// @desc    Get all parties
// @access  Public
router.get("/", (req, res) => {
  Party.find()
    .then(party => res.json(party))
    .catch(err =>
      res.status(404).json({
        message: "Il n'y a pas encore de parti politique"
      })
    );
});

// @route   GET api/parties/:id
// @desc    Get party by id
// @access  Public
router.get("/:id", (req, res) => {
  Party.findById(req.params.id)
    .then(party => res.json(party))
    .catch(err =>
      res.status(404).json({
        message: "Il n'y a pas de parti politique avec cet ID"
      })
    );
});

// @route   GET api/parties/slug/:slug
// @desc    Get party by slug
// @access  Public
router.get("/slug/:slug", (req, res) => {
  const toFind = {
    slug: req.params.slug
  };
  Party.findOne(toFind)
    .then(party => res.json(party))
    .catch(err =>
      res.status(404).json({
        message: "Il n'y a pas de parti politique avec cette référence"
      })
    );
});

// @route   POST api/parties/add
// @desc    Create party
// @access  Private
router.post("/add", upload.single("image"), (req, res) => {
  const data = JSON.parse(req.body.data);
  // console.log("data", data);
  console.log("req.file", req.file);
  if (req.file === undefined) {
    // console.log("<< undefined loop");
    Party.findOne({ name: data.name }).then(party => {
      if (party) {
        return res
          .status(400)
          .json({ message: "Ce parti politique existe déjà" });
      } else {
        const newParty = new Party({
          name: data.name,
          description: data.description || "",

          slug: slug(data.name.toString())
        });

        newParty.save().then(party => res.json(party));
      }
    });
  } else {
    const extension = getExtension(req.file); // Voir au dessus
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
      Party.findOne({ name: data.name }).then(party => {
        if (party) {
          return res
            .status(400)
            .json({ message: "Ce parti politique existe déjà" });
        } else {
          const newParty = new Party({
            name: data.name,
            description: data.description || "",
            picture: apiPictureName || "",
            slug: slug(data.name.toString())
          });

          newParty.save().then(party => res.json(party));
        }
      });
    });
  }
});

// @route   PUT api/parties/:id
// @desc    Update party
// @access  Private
router.put("/:id", (req, res) => {
  Party.findById(req.params.id).then(party => {
    const partyFields = {};

    if (req.body.name) partyFields.name = req.body.name;
    if (req.body.description) partyFields.description = req.body.description;
    partyFields.slug = slug(req.body.name.toString());
    Party.findOneAndUpdate(
      { _id: req.params.id },
      { $set: partyFields },
      { useFindAndModify: false }
    ).then(party => res.json(party));
  });
});

// @route   DELETE api/parties/:id
// @desc    Delete party
// @access  Private
router.delete("/:id", (req, res) => {
  // console.log("@delete - server");
  Party.findById(req.params.id).then(party => {
    party
      .deleteOne()
      .then(() =>
        res.json({
          success: true,
          message: "Le parti a été supprimé"
        })
      )
      .catch(err =>
        res.status(404).json({
          error: true,
          message: "Il n'y a pas de parti à supprimer"
        })
      );
  });
});

module.exports = router;
