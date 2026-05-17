const express = require("express");
const router = express.Router();
const {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getPublicProducts,
  getPublicProductBySlug,
} = require("../controllers/productController");
const { authenticate } = require("../middleware/authMiddleware");
const { validateBody } = require("../middleware/validationMiddleware");
const {
  productCreateSchema,
  productUpdateSchema,
} = require("../validation/schemas");

const adminRouter = express.Router();
adminRouter.use(authenticate);

adminRouter.post("/", validateBody(productCreateSchema), createProduct);
adminRouter.put("/:id", validateBody(productUpdateSchema), updateProduct);
adminRouter.delete("/:id", deleteProduct);
adminRouter.get("/", getAllProducts);
router.use("/admin", adminRouter);
router.get("/", getPublicProducts);
router.get("/:slug", getPublicProductBySlug);
module.exports = router;
