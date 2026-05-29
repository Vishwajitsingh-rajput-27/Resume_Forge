const router     = require("express").Router();
const auth       = require("../middleware/auth");
const rateLimit  = require("express-rate-limit");
const c          = require("../controllers/aiController");

const aiLimiter = rateLimit({ windowMs:60*60*1000, max:30,
  message:{ error:"AI limit reached. Upgrade to Pro for more." } });

router.use(auth, aiLimiter);
router.post("/summary",      c.summary);
router.post("/skills",       c.skills);
router.post("/improve",      c.improve);
router.post("/ats-tips",     c.atsTips);
router.post("/project-desc", c.projectDesc);

module.exports = router;
