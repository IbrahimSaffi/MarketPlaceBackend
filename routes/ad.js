const jwt = require("jsonwebtoken")
const express = require('express');
const multer = require("multer")
const router = express.Router();
const ObjectId = require('mongodb').ObjectId
const AdModel = require("../schemes/adScheme");
const UserModel = require('../schemes/userScheme');
const adModel = require("../schemes/adScheme");
const categoryModel = require("../schemes/categoryScheme");
const bycrypt = require("bcryptjs")


const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,"public/upload")
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+"-"+ file.originalname)
    }
})
//Get Ads
const upload = multer({storage:storage})
router.get('/', async (req, res) => {
    console.log(req.header)
    const authHeaderInfo = req.header("authorization")
    if(authHeaderInfo===undefined){
        return res.status(401).send("No Token was provided")
    }
    const token = authHeaderInfo.split(" ")[1]
    if(token===undefined){
        return res.status(401).send("Proper token was not provided")
    }
    try{
        console.log("here")
        let payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log("payload", payload)
        const ads = await AdModel.find({})
        if(ads===null){
            return res.status(400).send("No Ads exist ")
        }
        res.status(200).send(ads)
    }
    catch(e){
        return res.status(401).send("Token is not Valid"+e.message)
        }
})
//Add ad
router.post('/add',upload.single("image"), async (req, res) => {
    
    const { title,description ,price,seller,category } = req.body
    if (!title||!description ||!price||!seller||!category) {
        return res.status(400).send("Not all required fields are provided")
    }
    imageUrl ="No Image"
    console.log("file", req.file)
    if(typeof(req.file)==="object"){
        imageUrl = process.env.BASE_URL+ 'upload/' + req.file.filename
    }
   console.log(process.env.BASE_URL,imageUrl) 
   const adExist = await AdModel.findOne({ title:title  })
    if (adExist !== null) {
        return res.status(400).send("This Ad already exists")
    }
    let user;
    let categoryObj;
    try{
         user = await UserModel.findOne({_id:ObjectId(seller)})
    try{
          categoryObj = await categoryModel.findOne({_id:ObjectId(category)})
    }
    catch(err){
        return res.status(400).send("Such category do not exist")
    }
    }
    catch(err){
        return res.status(400).send("Make sure you are logged in and recheck your id")
    }
    if(user===null){
        return res.status(400).send("Make sure you are logged in and recheck your id")
    }
    if(category===null){
        return res.status(400).send("Such category do not exist")
    }
    let newAd = new AdModel({
        title:title,
        description :description ,
        price:price,
        seller:user,
        category:categoryObj,
        img:imageUrl
    })
     
    await UserModel.findOneAndUpdate({_id:seller},{ $push: { ads: newAd } })

    res.status(200).send(`Ad created with id ${newAd.id}`)
    console.log(newAd)
    newAd.save()
})
//Interested in Ad
router.post('/:id/buy', async (req, res) => {
    const id = req.params.id;
    let filter = {"_id":ObjectId(id)}
    console.log(id)
    const { email } = req.body
    if(!email){
        return res.status(400).send("Provide Buyer Details")
    }
    const ad = await AdModel.findOne(filter)
    if(ad===null){
        return res.status(400).send("No such ad exist")
    }
    const user = await UserModel.findOne({email:email})
    if(user ===null){
        return res.status(400).send("Make sure you are logged in")
    }
    console.log(ad,user)
    await AdModel.findOneAndUpdate(filter,{ $push: { interestedBuyers: user } })
    return res.status(200).send("Your request has been sent") 
})
//Bought Ad
router.post('/:id/close/:buyerId', async (req, res) => {
    const id = req.params.id;
    const buyerId = req.params.buyerId
    const {seller} = req.body
    const userExist = await UserModel.findById(seller)
    if (userExist === null) {
        return res.status(400).send("Make sure you are logged in")
    }
    let filter = {"_id":ObjectId(id)}
    const ad = await AdModel.findOne(filter).populate("seller")
    if(ad.seller.email!==userExist.email){
        return res.status(400).send("You are not creater of this ad")
    }
    if(ad===null){
        return res.status(400).send("No such ad exist")
    }
    if(!ad.interestedBuyers.includes(buyerId)){
        res.status(200).send("This costumer is not interested in product")
    }
    const user = await UserModel.findOne({_id:ObjectId(buyerId)})
    console.log(user)
    await AdModel.findOneAndUpdate(filter,{buyer:user})
    return res.status(200).send(`Product has been sold to ${user.name}`) 
})
//Display Ad
router.get('/:id', async (req, res) => {
    const id = req.params.id;
    let filter = {"_id":id}
    const ad = await AdModel.findOne(filter)
    if(ad===null){
        return res.status(400).send("No such ad exist")
    }
    return res.status(200).send(ad) 
})
//Delete Ad
router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    let filter = {"_id":ObjectId(id)}
    const {name} = req.body
    if(!name){
        return res.status(400).send("Provide your Details")
    }
    const ad = await AdModel.findOne(filter)
    if(ad===null){
        return res.status(400).send("No such ad exist")
    }
    const user = await UserModel.findOne({name:name})
    console.log(user,name)
    if(user.name!==name){
        return res.status(400).send("You have no authorization to delete ad")
    }
    await AdModel.deleteOne(filter)
    return res.status(200).send("Ad has been succesfully deleted")
   
})
module.exports = router