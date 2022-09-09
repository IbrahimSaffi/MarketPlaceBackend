const mongoose = require('mongoose')
const adScheme = new mongoose.Schema({
   title: {
      type: String,
      required: true
   },
   description: {
      type: String,
      required: true
   },
   price: {
      type: Number,
      required: true
   },
   seller: {
      type:String,
      required:true
      // type: mongoose.Schema.Types.ObjectId,
      // ref: "User"
   },
   category: {
      type:String,
      required: true

      // type: mongoose.Schema.Types.ObjectId,
      // ref: "Category"
   },
   img:{
      type:String,
   },
   interestedBuyers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
   }],
   buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
   },
   created_At: {
      type: Date,
      default: Date.now()
   }
})
const adModel = mongoose.model("Ad", adScheme)
module.exports = adModel;