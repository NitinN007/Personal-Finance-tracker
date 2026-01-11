const router=require("express").Router();
const {protect}=require("../middlewares/auth");
const c=require("../controllers/recurringController");
router.get("/",protect,c.listRules);
router.post("/",protect,c.createRule);
router.patch("/:id/toggle",protect,c.toggleRule);
module.exports=router;
