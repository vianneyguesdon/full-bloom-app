const express = require("express");
const router = express.Router();
const multer = require("multer");

// Define path for uploads images
const upload = multer({ dest: "public/uploads/" });

// Vote Model
const Vote = require("../../models/Vote");

// @route   GET api/votes/
// @desc    Get all votes
// @access  Public
router.get("/", (req, res) => {
  Vote.find()
    .populate("law", [
      "name",
      "subTitle",
      "protect",
      "commencement",
      "category",
      "resume",
      "fullText",
      "link",
      "slug",
      "created"
    ])
    .populate("deputy", [
      "firstName",
      "surname",
      "name",
      "participationRate",
      "mandateFrom",
      "mandateTo",
      "group",
      "party",
      "picture",
      "slug",
      "created"
    ])
    .then(vote => {
      res.json(vote);
    })
    .catch(err =>
      res.json({
        message: "Il n'y a pas enocre de votes",
        error: err
      })
    );
});

// @route   GET api/votes/:id
// @desc    Get vote by Id
// @access  Public
router.get("/:id", (req, res) => {
  Vote.findById(req.params.id)
    .populate("law", [
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
    .populate("deputy", [
      "firstName",
      "surname",
      "name",
      "participationRate",
      "mandateFrom",
      "mandateTo",
      "group",
      "party",
      "picture",
      "slug",
      "created"
    ])
    .then(vote => res.json(vote))
    .catch(err =>
      res.json({
        msg: "Il n'y a pas de vote avec cet ID"
      })
    );
});

// @route   POST api/votes/add
// @desc    Create new vote
// @access  Private
router.post("/add", upload.single("image"), (req, res) => {
  const data = JSON.parse(req.body.data);
  console.log("data", data);
  Vote.findOne({
    deputy: data.deputy,
    law: data.law
  }).then(vote => {
    if (vote) {
      return res.json({ msg: "Ce député a déja un vote sur cet amendement" });
    } else {
      const newVote = new Vote({
        decision: data.decision,
        deputy: data.deputy,
        law: data.law
      });

      newVote
        .save()
        .then(vote => res.json({ vote, msg: "Le vote a été sauvegardé" }));
    }
  });
});

// @route   PUT api/votes/:id
// @desc    Update a vote
// @access  Private
router.put("/:id", (req, res) => {
  Vote.findById(req.params.id).then(vote => {
    const voteFields = {};
    if (req.body.decision) voteFields.decision = req.body.decision;
    if (req.body.deputy) voteFields.deputy = req.body.deputy;
    if (req.body.law) voteFields.law = req.body.law;
    Vote.findOneAndUpdate(
      { _id: req.params.id },
      { $set: voteFields },
      { useFindAndModify: false }
    ).then(vote =>
      res.json({ vote, msg: "La modification a été sauvegardée" })
    );
  });
});

// @route   DELETE api/vote/:id
// @desc    Delete a vote
// @access  Private
router.delete("/:id", (req, res) => {
  Vote.findById(req.params.id).then(vote => {
    vote
      .deleteOne()
      .then(() =>
        res.json({
          success: true,
          msg: "Le vote a été supprimé"
        })
      )
      .catch(err =>
        res.json({
          error: true,
          msg: "Il n'y a pas de vote à supprimer"
        })
      );
  });
});

module.exports = router;
