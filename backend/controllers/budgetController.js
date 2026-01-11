const Budget=require("../models/Budget");
exports.upsertBudget=async(req,res)=>{ const {categoryId,month,year,limit}=req.body;
  const doc=await Budget.findOneAndUpdate({userId:req.user.id,categoryId,month,year},{ $set:{limit}},{upsert:true,new:true});
  res.json(doc);
};
exports.listBudgets=async(req,res)=>{ const {month,year}=req.query;
  const budgets=await Budget.find({userId:req.user.id,month:Number(month),year:Number(year)}); res.json(budgets);
};
