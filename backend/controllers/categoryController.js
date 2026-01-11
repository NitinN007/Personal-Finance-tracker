const Category=require("../models/Category");

exports.seedDefaults=async(userId)=>{
  const defaults=[
    {name:"Salary",type:"income"},{name:"Freelance",type:"income"},
    {name:"Food",type:"expense"},{name:"Rent",type:"expense"},{name:"Transport",type:"expense"},
    {name:"Shopping",type:"expense"},{name:"Health",type:"expense"},{name:"Entertainment",type:"expense"}
  ];
  for(const c of defaults){ try{await Category.create({userId,...c,isDefault:true});}catch{} }
};

exports.getCategories=async(req,res)=>{ const cats=await Category.find({userId:req.user.id}).sort({type:1,name:1}); res.json(cats); };
exports.createCategory=async(req,res)=>{ const {name,type}=req.body; const cat=await Category.create({userId:req.user.id,name,type,isDefault:false}); res.status(201).json(cat); };
exports.deleteCategory=async(req,res)=>{ await Category.deleteOne({_id:req.params.id,userId:req.user.id,isDefault:false}); res.json({message:"Deleted"}); };
