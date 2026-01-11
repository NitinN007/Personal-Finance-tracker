const mongoose=require("mongoose");
const Transaction=require("../models/Transaction");
const Budget=require("../models/Budget");

exports.monthSummary=async(req,res)=>{
  const m=Number(req.query.month); const y=Number(req.query.year);
  const start=new Date(Date.UTC(y,m-1,1)); const end=new Date(Date.UTC(y,m,1));
  const uid=mongoose.Types.ObjectId.createFromHexString(req.user.id);

  const totals=await Transaction.aggregate([
    {$match:{userId:uid,date:{$gte:start,$lt:end}}},
    {$group:{_id:"$type", total:{$sum:"$amount"}}}
  ]);
  const income=totals.find(x=>x._id==="income")?.total||0;
  const expense=totals.find(x=>x._id==="expense")?.total||0;

  const categoryExpense=await Transaction.aggregate([
    {$match:{userId:uid,date:{$gte:start,$lt:end},type:"expense"}},
    {$lookup:{from:"categories",localField:"categoryId",foreignField:"_id",as:"cat"}},
    {$unwind:"$cat"},
    {$group:{_id:"$cat.name", total:{$sum:"$amount"}}},
    {$sort:{total:-1}}
  ]);

  const budgets=await Budget.find({userId:req.user.id,month:m,year:y}).populate("categoryId");

  const recent=await Transaction.find({userId:req.user.id}).sort({date:-1}).limit(8).populate("categoryId");

  res.json({income,expense,balance:income-expense,categoryExpense,budgets,recent});
};

exports.trend=async(req,res)=>{
  const uid=mongoose.Types.ObjectId.createFromHexString(req.user.id);
  const start=new Date(req.query.from); const end=new Date(req.query.to);
  const agg=await Transaction.aggregate([
    {$match:{userId:uid,date:{$gte:start,$lte:end}}},
    {$group:{_id:{$dateToString:{format:"%Y-%m-%d",date:"$date"}},
      income:{$sum:{$cond:[{$eq:["$type","income"]},"$amount",0]}},
      expense:{$sum:{$cond:[{$eq:["$type","expense"]},"$amount",0]}}
    }},
    {$sort:{_id:1}}
  ]);
  res.json(agg);
};
