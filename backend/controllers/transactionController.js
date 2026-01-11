const Transaction=require("../models/Transaction");
exports.createTransaction=async(req,res)=>{ const {type,amount,categoryId,date,note}=req.body;
  const tx=await Transaction.create({userId:req.user.id,type,amount,categoryId,date,note:note||""}); res.status(201).json(tx);
};
exports.listTransactions=async(req,res)=>{ const {type,categoryId,from,to,search,page=1,limit=20}=req.query;
  const q={userId:req.user.id};
  if(type) q.type=type;
  if(categoryId) q.categoryId=categoryId;
  if(search) q.note={ $regex: search, $options:"i" };
  if(from||to){ q.date={}; if(from) q.date.$gte=new Date(from); if(to) q.date.$lte=new Date(to); }
  const skip=(Number(page)-1)*Number(limit);
  const [items,total]=await Promise.all([
    Transaction.find(q).sort({date:-1}).skip(skip).limit(Number(limit)).populate("categoryId"),
    Transaction.countDocuments(q)
  ]);
  res.json({items,total,page:Number(page),limit:Number(limit)});
};
exports.updateTransaction=async(req,res)=>{ const tx=await Transaction.findOneAndUpdate({_id:req.params.id,userId:req.user.id},req.body,{new:true}); res.json(tx); };
exports.deleteTransaction=async(req,res)=>{ await Transaction.deleteOne({_id:req.params.id,userId:req.user.id}); res.json({message:"Deleted"}); };
