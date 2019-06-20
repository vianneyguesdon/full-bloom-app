const express = require("express");
const router = express.Router();
const multer = require("multer");

// Define path for uploads images
const upload = multer({ dest: "public/uploads/" });
// Initialize slug Module (test with print for results)
// const print = console.log.bind(console, ">");
const slug = require("slug");
slug.defaults.mode = "rfc3986";

// Group Model
const Law = require("../../models/Law");
const Vote = require("../../models/Vote");

// @route   GET api/laws/
// @desc    Get all laws
// @access  Public
router.get("/", (req, res) => {
  Law.find()
    .then(laws => {
      res.json(laws);
    })
    .catch(err =>
      res.json({
        msg: "Il n'y a pas encore d'amendement"
      })
    );
});

// @route   GET api/laws/:id
// @desc    Get law by Id
// @access  Public
router.get("/:id", (req, res) => {
  Law.findById(req.params.id)
    .then(law => res.json(law))
    .catch(err =>
      res.json({
        msg: "Il n'y a pas d'amendement avec cet ID"
      })
    );
});

// @route   GET api/laws/slug/:slug
// @desc    Get law by slug
// @access  Public
router.get("/slug/:slug", (req, res) => {
  const toFind = {
    slug: req.params.slug
  };
  Law.findOne(toFind)
    .then(law => res.json(law))
    .catch(err =>
      res.json({
        msg: "Il n'y a pas d'amendement avec cet slug"
      })
    );
});

// @route   POST api/laws/add
// @desc    Create new law
// @access  Private
router.post("/add", upload.single("image"), (req, res) => {
  // console.log("data", req);
  const data = JSON.parse(req.body.data);
  // console.log("data", data);
  Law.findOne({ name: data.name }).then(law => {
    if (law) {
      return res.json({ msg: "Cet amendement existe déjà" });
    } else {
      const newLaw = new Law({
        name: data.name,
        subTitle: data.subTitle || "",
        protect: data.protect || "",
        category: data.category || "",
        commencement: data.commencement || "",
        resume: data.resume || "",
        fullText: data.fullText || "",
        link: data.link || "",
        slug: slug(data.name.toString())
      });

      newLaw
        .save()
        .then(law => res.json({ law, msg: "L'amendement a été enregistré" }));
    }
  });
});

// @route   PUT api/laws/:id
// @desc    Update lawscategories
// @access  Private
router.put("/:id", upload.single("image"), (req, res) => {
  console.log("@0 req.body.data", req.body.data);
  console.log(req.params.id, "req.params.id");
  const data = JSON.parse(req.body.data);
  console.log("@1");
  console.log(req.params.id, "req.params.id");

  Law.findById(req.params.id).then(law => {
    console.log("@2");
    const lawsFields = {};
    console.log("data", data);

    if (data.name !== undefined) {
      lawsFields.name = data.name;
      lawsFields.slug = slug(data.name.toString());
    }
    if (data.subTitle !== undefined) {
      lawsFields.subTitle = data.subTitle;
    }
    if (data.protect !== undefined) {
      lawsFields.protect = data.protect;
    }
    if (data.commencement !== undefined) {
      lawsFields.commencement = data.commencement;
    }
    if (data.resume !== undefined) {
      lawsFields.resume = data.resume;
    }
    if (data.fullText !== undefined) {
      lawsFields.fullText = data.fullText;
    }
    if (data.link !== undefined) {
      lawsFields.link = data.link;
    }
    console.log(req.params.id, "req.params.id2 ");
    console.log(lawsFields, "lawsFields");
    Law.findOneAndUpdate(
      { _id: req.params.id },
      { $set: lawsFields },
      { useFindAndModify: false }
    ).then(law => res.json({ law, msg: "L'amendement a été modifié" }));
  });
});

// @route   DELETE api/laws/:id
// @desc    Delete a law
// @access  Private
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  Law.findById(id).then(law => {
    Vote.find({ law: { _id: id } })
      .deleteMany()
      .then(() => {
        law
          .remove()
          .then(() =>
            res.json({
              success: true,
              msg: "L'amendement et tous les votes liés ont été supprimés"
            })
          )
          .catch(err =>
            res.json({
              error: true,
              msg: "Il n'y a pas d'amendement à supprimer"
            })
          );
      })
      .catch(err =>
        res.json({
          error: true,
          msg:
            "Il y a eu un problème lors de la suppression des votes liés à l'amendement"
        })
      );
  });
});

module.exports = router;
