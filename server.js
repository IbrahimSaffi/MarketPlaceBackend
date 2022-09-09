require("dotenv").config()
const express = require("express")
const morgan = require("morgan")
const multer = require("multer")
const jwt = require("jsonwebtoken")
const { default: mongoose } = require('mongoose');
const authRouter = require("./routes/auth")
const categoryRouter = require("./routes/category")
const adRouter = require("./routes/ad")
const app = express()
var cors = require('cors');
const { urlencoded } = require("express");

app.use(cors())

mongoose.connect("mongodb+srv://Ibrahim:jmk161651@cluster0.oxfmkib.mongodb.net/?retryWrites=true&w=majority")
.then(()=>{
    console.log("Connected to cloud db")
}).catch((err)=>console.log("Error",err))
//Middleware usage
app.use(express.static("public"))
app.use(express.json())
app.use(morgan("dev"))
app.use(express.urlencoded({extended:false}))

app.use('/auth',authRouter)
app.use(authorization)
app.use('/category',authorization,categoryRouter)
app.use('/ad',authorization,adRouter)
async function authorization(req,res){
    try{
        console.log("here")
        let payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const ads = await AdModel.find({})
        if(ads===null){
            return res.status(400).send("No Ads exist ")
        }
        res.status(200).send(ads)
    }
    catch(e){
        return res.status(401).send("Token is not Valid"+e.message)
        }
}
app.listen(process.env.PORT||8000)