const router=require("express").Router();
const {protect}=require("../middlewares/auth");
const c=require("../controllers/dashboardController");
router.get("/month-summary",protect,c.monthSummary);
router.get("/trend",protect,c.trend);
module.exports=router;
