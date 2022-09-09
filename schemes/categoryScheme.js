const mongoose = require('mongoose')
const categoryScheme = new mongoose.Schema({
   name  : {
    type:String,
    required:true
   },
   active  : {
    type:Boolean,
    required:true
   },
   created_at  : {
    type:Date,
    default:Date.now()
   },
})
const categoryModel = mongoose.model("Category", categoryScheme)
module.exports = categoryModel;