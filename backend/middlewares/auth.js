const jwt=require("jsonwebtoken");
exports.protect=(req,res,next)=>{try{const h=req.headers.authorization||""; if(!h.startsWith("Bearer ")) return res.status(401).json({message:"Token missing"}); const token=h.split(" ")[1]; req.user=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET); next();}catch(e){return res.status(401).json({message:"Invalid token"});}}
