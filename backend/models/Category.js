const mongoose = require("mongoose");
const schema=new mongoose.Schema({userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},name:{type:String,required:true,trim:true},type:{type:String,enum:["income","expense"],required:true},isDefault:{type:Boolean,default:false}}, {timestamps:true});
schema.index({userId:1,name:1,type:1},{unique:true});
module.exports=mongoose.model("Category", schema);
