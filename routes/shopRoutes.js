const express = require("express");
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

const shopController = require("../controllers/shopController");
const authMiddleware = require('../authMiddleware');

router.get("/addProduct", authMiddleware.authAdmin, shopController.getAddProduct);
router.post("/addProduct", authMiddleware.authAdmin, upload.single('imageUploaded'), shopController.postAddProduct);
router.get("/cart", authMiddleware.authUser, shopController.getCart);
router.post("/cart", authMiddleware.authUser, shopController.postCart);
router.get("/orders", authMiddleware.auth, shopController.getOrders);
router.get("/pay", authMiddleware.authUser,shopController.postOrder);
router.get("/products/:productId", shopController.getProduct);
router.get("/checkout/success", authMiddleware.authUser, shopController.postOrder);
router.get("/addCategory", authMiddleware.authAdmin, shopController.getAddCategory);
router.post("/addCategory", authMiddleware.authAdmin, shopController.postAddCategory);

module.exports = router