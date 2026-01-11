const jwt=require("jsonwebtoken");
exports.generateAccessToken=(payload)=>jwt.sign(payload,process.env.ACCESS_TOKEN_SECRET,{expiresIn:process.env.ACCESS_TOKEN_EXPIRE||"15m"});
exports.generateRefreshToken=(payload)=>jwt.sign(payload,process.env.REFRESH_TOKEN_SECRET,{expiresIn:process.env.REFRESH_TOKEN_EXPIRE||"7d"});
