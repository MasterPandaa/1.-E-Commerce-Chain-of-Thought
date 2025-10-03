// Reasoning: Admin routes protected by admin role
const express = require("express");
const router = express.Router();
const { auth, requireRole } = require("../middleware/auth");
const { handleValidation } = require("../middleware/validation");
const ctrl = require("../controllers/admin.controller");
const {
  adminListOrdersValidation,
  updateOrderStatusValidation,
} = require("../validators/order.validators");
const {
  listUsersValidation,
  updateUserRoleValidation,
} = require("../validators/admin.validators");

router.get("/stats", auth(), requireRole("admin"), ...ctrl.getStats);
router.get(
  "/orders",
  auth(),
  requireRole("admin"),
  adminListOrdersValidation,
  handleValidation,
  ...ctrl.listOrders,
);
router.patch(
  "/orders/:id/status",
  auth(),
  requireRole("admin"),
  updateOrderStatusValidation,
  handleValidation,
  ...ctrl.updateOrderStatus,
);
router.get(
  "/users",
  auth(),
  requireRole("admin"),
  listUsersValidation,
  handleValidation,
  ...ctrl.listUsers,
);
router.patch(
  "/users/:id/role",
  auth(),
  requireRole("admin"),
  updateUserRoleValidation,
  handleValidation,
  ...ctrl.updateUserRole,
);

module.exports = router;
