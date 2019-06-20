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
      res.json({
        msg: "Il n'y a pas encore de groupe politique"
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
      res.json({
        msg: "Il n'y a pas de groupe politique avec cet ID"
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
      res.json({
        msg: "Il n'y a pas de groupe politique avec cette référence"
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
        return res.json({ msg: "Ce groupe politique existe déjà" });
      } else {
        return res.json({ msg: "Merci d'uploader une image pour ce groupe" });
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
        return res.json({ msg: "L'image n'a pas pu être sauvegardée" });
      }
      Group.findOne({ name: data.name }).then(group => {
        if (group) {
          return res.json({ msg: "Ce groupe politique existe déjà" });
        } else {
          const newGroup = new Group({
            name: data.name,
            description: data.description || "",
            picture: apiPictureName || "",
            slug: slug(data.name.toString())
          });
          newGroup
            .save()
            .then(group =>
              res.json({ group, msg: "Le groupe a été enregistré" })
            );
        }
      });
    });
  }
});

// @route   PUT api/groups/:id
// @desc    Update group
// @access  Private
router.put("/:id", upload.single("image"), (req, res) => {
  const data = JSON.parse(req.body.data);
  console.log("req.file", req.file);
  if (req.file === undefined) {
    return res.json({
      msg: "Merci d'uploader une image pour modifier ce groupe"
    });
  }

  const extension = getExtension(req.file); // Voir au dessus
  const filename = req.file.filename + extension;
  const serverPictureName = "public/uploads/" + filename;
  const apiPictureName = "uploads/" + filename;
  fs.rename(req.file.path, serverPictureName, function(err) {
    if (err) {
      // console.log("il y a une erreur", err);
      return res.json({ msg: "L'image n'a pas pu être sauvegardée" });
    }
    Group.findById(req.params.id).then(group => {
      console.log("@2");
      const groupFields = {};
      console.log("data", data);

      if (data.name !== undefined) {
        console.log("ici name");
        groupFields.name = data.name;
        groupFields.slug = slug(data.name.toString());
      }
      if (data.description !== undefined) {
        groupFields.description = data.description;
      }
      if (apiPictureName !== undefined) {
        groupFields.picture = apiPictureName;
      }
      console.log(req.params.id, "req.params.id2 ");
      console.log(groupFields, "groupFields");
      Group.findOneAndUpdate(
        { _id: req.params.id },
        { $set: groupFields },
        { useFindAndModify: false }
      ).then(group => res.json({ group, msg: "Le groupe a été modifié" }));
    });
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
          msg: "Le groupe a été supprimé"
        })
      )
      .catch(err =>
        res.json({
          error: true,
          msg: "Il n'y a pas de groupe à supprimer"
        })
      );
  });
});

module.exports = router;
