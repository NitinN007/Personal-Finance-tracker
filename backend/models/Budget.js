const mongoose = require("mongoose");
const schema=new mongoose.Schema({userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},categoryId:{type:mongoose.Schema.Types.ObjectId,ref:"Category",required:true},month:{type:Number,required:true},year:{type:Number,required:true},limit:{type:Number,required:true,min:0}}, {timestamps:true});
schema.index({userId:1,categoryId:1,month:1,year:1},{unique:true});
module.exports=mongoose.model("Budget", schema);
