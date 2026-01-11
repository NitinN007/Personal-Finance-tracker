const cron=require("node-cron");
const RecurringRule=require("../models/RecurringRule");
const Transaction=require("../models/Transaction");

const addInterval=(d,f,i)=>{const x=new Date(d);
  if(f==="daily") x.setDate(x.getDate()+i);
  if(f==="weekly") x.setDate(x.getDate()+7*i);
  if(f==="monthly") x.setMonth(x.getMonth()+i);
  return x;
};

module.exports=function startRecurringJob(){
  cron.schedule("* * * * *", async ()=>{
    const now=new Date();
    const rules=await RecurringRule.find({isActive:true,nextRunAt:{$lte:now}});
    for(const r of rules){
      await Transaction.create({userId:r.userId,type:r.type,amount:r.amount,categoryId:r.categoryId,date:r.nextRunAt,note:r.note,isRecurringGenerated:true});
      r.nextRunAt=addInterval(r.nextRunAt,r.frequency,r.interval||1);
      await r.save();
    }
  });
};
