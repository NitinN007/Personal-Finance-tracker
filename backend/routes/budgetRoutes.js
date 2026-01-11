const router=require("express").Router();
const {protect}=require("../middlewares/auth");
const c=require("../controllers/budgetController");
router.get("/",protect,c.listBudgets); router.post("/",protect,c.upsertBudget);
module.exports=router;
