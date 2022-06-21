const express = require("express");
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

const adminController = require("../controllers/adminController");

const authMiddleware = require('../authMiddleware');


router.get("/profile", authMiddleware.auth, adminController.getProfile);
router.post("/profile", authMiddleware.auth, adminController.postProfile);
router.get("/:userId", authMiddleware.authAdmin, adminController.getUserProfile);

module.exports = router