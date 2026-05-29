const router = require("express").Router();
const auth   = require("../middleware/auth");
const upload = require("../middleware/upload");
const c      = require("../controllers/userController");

router.use(auth);
router.get   ("/profile",  c.getProfile);
router.put   ("/profile",  c.updateProfile);
router.put   ("/password", c.changePassword);
router.post  ("/avatar",   upload.single("avatar"), c.uploadAvatar);
router.get   ("/stats",    c.getStats);
router.delete("/account",  c.deleteAccount);

module.exports = router;
