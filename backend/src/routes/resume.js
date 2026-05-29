const router = require("express").Router();
const auth   = require("../middleware/auth");
const c      = require("../controllers/resumeController");

router.use(auth);
router.get   ("/",           c.getAll);
router.post  ("/",           c.create);
router.get   ("/:id",        c.getOne);
router.put   ("/:id",        c.update);
router.delete("/:id",        c.remove);
router.post  ("/:id/duplicate", c.duplicate);
router.put   ("/:id/ats",    c.saveATS);

module.exports = router;
