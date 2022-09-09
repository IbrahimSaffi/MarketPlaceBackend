const jwt = require("jsonwebtoken")
const express = require('express');
const multer = require("multer")
const router = express.Router();
const ObjectId = require('mongodb').ObjectId
const AdModel = require("../schemes/adScheme");
const UserModel = require('../schemes/userScheme');


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
    const { title,description ,price,seller,category,interestedBuyers,buyer } = req.body
    if (!title||!description ||!price||!seller||!category) {
        console.log('here')
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
    const user = await UserModel.find({name:seller})
    let newAd = new AdModel({
        title:title,
        description :description ,
        price:price,
        seller:seller,
        category:category,
        img:imageUrl

    })
    res.status(200).send(`Ad created with id ${newAd.id}`)
    console.log(newAd)
    newAd.save()
})
//Interested in Ad
router.post('/:id/buy', async (req, res) => {
    const id = req.params.id;
    let filter = {"_id":ObjectId(id)}
    console.log(id)
    const { buyer } = req.body
    if(!buyer){
        return res.status(400).send("Provide Buyer Details")
    }
    const ad = await AdModel.find(filter)
    if(ad===null){
        return res.status(400).send("No such ad exist")
    }
    const user = await UserModel.find({name:buyer})
    if(user ===null){
        return res.status(400).send("Make sure you are logged in")
    }
    await AdModel.updateOne({ $push: { buyers: user } })
    // if(ad.interestedBuyers!==undefined){
    //     buyers = ad.interestedBuyers.map(ele=>ele.slice())
    //     buyers.push(user)     
    // }
    // else{
    //     buyers = ad.interestedBuyers.map(ele=>ele.slice())
    //     buyers.push(user)
    // }
    await AdModel.findOneAndUpdate(filter,{interestedBuyers:buyers})
    return res.status(200).send("Your request has been sent") 
})
//Bought Ad
router.post('/:id/close/:buyerId', async (req, res) => {
    const id = req.params.id;
    const buyerId = req.params.buyerId
    let filter = {"_id":id}
    console.log(id)

    const ad = await AdModel.find(filter)
    if(ad===null){
        return res.status(400).send("No such ad exist")
    }
    const user = await UserModel.find({_id:id})
    await AdModel.findOneAndUpdate(filter,{buyer:user})
    return res.status(200).send("Your order has been placed") 
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
    const ad = await AdModel.find(filter)
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