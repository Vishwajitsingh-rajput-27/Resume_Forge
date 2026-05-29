const router = require("express").Router();
const auth   = require("../middleware/auth");
const c      = require("../controllers/authController");

router.post("/register",           c.register);
router.post("/login",              c.login);
router.post("/forgot-password",    c.forgotPassword);
router.put ("/reset-password/:token", c.resetPassword);
router.get ("/me",          auth,  c.getMe);
router.post("/logout",      auth,  (_, res) => res.json({ message:"Logged out" }));

module.exports = router;
