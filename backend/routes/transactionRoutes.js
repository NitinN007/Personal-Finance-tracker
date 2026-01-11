const router=require("express").Router();
const {protect}=require("../middlewares/auth");
const c=require("../controllers/transactionController");
router.get("/",protect,c.listTransactions); router.post("/",protect,c.createTransaction); router.put("/:id",protect,c.updateTransaction); router.delete("/:id",protect,c.deleteTransaction);
module.exports=router;
