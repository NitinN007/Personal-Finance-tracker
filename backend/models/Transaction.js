const mongoose = require("mongoose");
const schema=new mongoose.Schema({userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},type:{type:String,enum:["income","expense"],required:true},amount:{type:Number,required:true,min:0},categoryId:{type:mongoose.Schema.Types.ObjectId,ref:"Category",required:true},date:{type:Date,required:true,index:true},note:{type:String,default:""},isRecurringGenerated:{type:Boolean,default:false}}, {timestamps:true});
schema.index({userId:1,date:-1});
module.exports=mongoose.model("Transaction", schema);
