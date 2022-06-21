const express = require("express");
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

const supportController = require("../controllers/supportController");

const authMiddleware = require('../authMiddleware');

router.get("/", authMiddleware.authUser, supportController.getSupport);
router.post("/", authMiddleware.authUser, supportController.postSupport);
router.get("/tickets", authMiddleware.authAdmin, supportController.getSupportTickets);

module.exports = router