const mongoose = require('mongoose')
const userScheme = new mongoose.Schema({
   name  : {
    type:String,
    required:true
   },
   email  : {
    type:String,
    required:true
   },
   password :{
    type:String,
    required:true
   },
   ads:[{     
      type:mongoose.Schema.Types.ObjectId,
      ref:"Ad"
   }]
   
})
const UserModel = mongoose.model("User", userScheme)
module.exports = UserModel;