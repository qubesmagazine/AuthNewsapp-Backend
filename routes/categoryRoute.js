const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  addcategory,
  deleteCategory,
  getAllCategories,
  editCategory,
} = require("../controllers/categoryController");

router.route("/addCategory").post(protect, addcategory);
router.route("/deleteCategory/:catId").delete(protect, deleteCategory);
router.route("/getAllCategories").get(getAllCategories);
router.route("/editCategory/:catId").put(protect, editCategory);

module.exports = router;
