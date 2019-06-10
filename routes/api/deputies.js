// Require Modules
const express = require("express");
const slug = require("slug");
const multer = require("multer");
const fs = require("fs");

// Define path for uploads images
const upload = multer({ dest: "public/uploads/" });

// Import Model Deputy
const Deputy = require("../../models/Deputy");
const Vote = require("../../models/Vote");

// Configure slug to default url
slug.defaults.mode = "rfc3986";

// Set Router from Express
const router = express.Router();

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

// @route     GET api/deputies
// @desc      READ : Display all deputies
// @access    Public
router.get("/", (req, res) => {
  Deputy.find()
    .populate("group", ["name", "description", "picture", "slug", "created"])
    .populate("party", ["name", "description", "picture", "slug", "created"])
    .then(deputies => {
      res.json({
        deputies
      });
    });
});

// @route   GET api/deputies/slug/:slug
// @desc    Get deputy by slug
// @access  Public
router.get("/slug/:slug", (req, res) => {
  const toFind = {
    slug: req.params.slug
  };
  Deputy.findOne(toFind)
    .populate("group", ["name", "description", "picture", "slug", "created"])
    .populate("party", ["name", "description", "picture", "slug", "created"])
    .then(deputy => res.json(deputy))
    .catch(err =>
      res.status(404).json({
        message: "Il n'y a pas de député avec cette référence"
      })
    );
});

// @route     GET api/deputies/:id
// @desc      READ : Display 1 deputiy
// @access    Public
router.get("/:id", (req, res) => {
  Deputy.findById(req.params.id)
    .populate("group", ["name", "description", "picture", "slug", "created"])
    .populate("party", ["name", "description", "picture", "slug", "created"])
    .then(deputy => res.json(deputy))
    .catch(err =>
      res.status(400).json({ message: "Il n'y a pas de député avec cet ID" })
    );
});

// @route         POST api/deputies/add
// @descrip       CREATE : Add a new deputy
// @access        Restricted
router.post("/add", upload.single("image"), (req, res) => {
  // On rename la photo dans le upload
  const data = JSON.parse(req.body.data);
  // console.info(data);
  const extension = getExtension(req.file); // Voir en dessous
  const filename = req.file.filename + extension;
  const serverPictureName = "public/uploads/" + filename;
  const apiPictureName = "uploads/" + filename;
  fs.rename(req.file.path, serverPictureName, function(err) {
    if (err) {
      console.log("il y a une erreur", err);
      return res
        .status(400)
        .json({ img: "L'image n'a pas pu être sauvegardée" });
    }
    Deputy.findOne({ name: data.name }).then(deputy => {
      if (deputy) {
        return res.status(400).json({ name: "Ce député existe déjà" });
      } else {
        // Delete the @ to be saved in DB and better diplay in front
        console.log("data.twitter", data.twitter);
        while (data.twitter.charAt(0) === "@") {
          data.twitter = data.twitter.substr(1);
        }
        console.log("data.twitter", data.twitter);
        const newDeputy = new Deputy({
          name: data.name,
          mandateFrom: data.mandateFrom || "",
          mandateTo: data.mandateTo || "",
          group: data.group || "",
          party: data.party || "",
          twitter: data.twitter || "",
          picture: apiPictureName || "",
          slug: slug(data.name.toString())
        });
        newDeputy
          .save()
          .then(user => res.json(user))
          .catch(err => console.log("err", err));
      }
    });
  });
});

// @route         PUT api/deputies/:id
// @descrip       UPDATE : Update a deputy
// @access        Restricted
router.put("/:id", (req, res) => {
  Deputy.findById(req.params.id).then(deputy => {
    const deputyFields = {};

    if (req.body.name) {
      deputyFields.name = req.body.name;
    }
    if (req.body.mandateFrom) {
      deputyFields.mandateFrom = req.body.mandateFrom;
    }
    if (req.body.mandateTo) {
      deputyFields.mandateTo = req.body.mandateTo;
    }
    if (req.body.group) {
      deputyFields.group = req.body.group;
    }
    if (req.body.party) {
      deputyFields.party = req.body.party;
    }
    if (req.body.twitter) {
      deputyFields.twitter = req.body.twitter;
    }
    if (req.body.picture) {
      deputyFields.picture = req.body.picture;
    }

    deputyFields.slug = slug(req.body.name.toString());
    Deputy.findOneAndUpdate(
      { _id: req.params.id },
      { $set: deputyFields },
      { useFindAndModify: false }
    ).then(deputy => res.json(deputy));
  });
});

// @route         DELETE api/deputies/:id
// @descrip       DELETE : Delete a deputy
// @access        Restricted
router.delete("/:id", (req, res) => {
  Deputy.findById(req.params.id).then(deputy => {
    Vote.find({ deputy: { _id: req.params.id } })
      .deleteMany()
      .then(() => {
        deputy
          .remove()
          .then(() =>
            res.json({
              success: true,
              message: "Le député et ses votes ont été supprimés"
            })
          )
          .catch(err =>
            res.status(404).json({
              error: true,
              message: "Il n'y a pas de député à supprimer"
            })
          );
      })
      .catch(err =>
        res.status(404).json({
          error: true,
          message: "Il y a eu un problème lors de la suppression de ce député"
        })
      );
  });
});

module.exports = router;
