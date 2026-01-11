const router=require("express").Router();
const {protect}=require("../middlewares/auth");
const c=require("../controllers/categoryController");
router.get("/",protect,c.getCategories); router.post("/",protect,c.createCategory); router.delete("/:id",protect,c.deleteCategory);
module.exports=router;
