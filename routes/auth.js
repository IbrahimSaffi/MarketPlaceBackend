const express = require('express');
const router = express.Router();
const bycrypt = require("bcryptjs")
const UserModel = require("../schemes/userScheme")
const jwt = require("jsonwebtoken")
router.post('/signUp', async (req, res) => {
    const { name, email, password, confirmPassword } = req.body
    console.log(req.body)
    if (!name || !email || !password || !confirmPassword) {
        return res.status(400).send("All fields must be there")
    }
    if (password !== confirmPassword) {
        return res.status(400).send("Passwords must match")
    }
    const userExist = await UserModel.findOne({ email: email })
    if (userExist !== null) {
        return res.status(400).send("User already exist")
    }
    let salt = await bycrypt.genSalt(10)
    let hash = await bycrypt.hash(password, salt)
    let newUser = new UserModel({
        name: name,
        email: email,
        password: hash,
        created_At: Date.now
    })
    res.status(200).send(`User created with id ${newUser.id}`)
    newUser.save()
})
let refreshTokens = []
// refreshTokens must be in database so change this code
router.post('/login', async (req, res) => {
    const { email, password } = req.body
    console.log(req.body)
    if (!email || !password) {
        return res.status(400).send("Email or password not recieved")
    }
    console.log(email, password)
    // let salt = await bycrypt.genSalt(10)
    // let hash = await bycrypt.hash(password, salt)
    const userExist = await UserModel.findOne({ email: email })
    if (userExist === null) {
        return res.status(400).send("No such user")
    }
    let payload = { email: userExist.email, password: userExist.password }
    const result = await bycrypt.compare(password, userExist.password)
    if (userExist !== null && !result) {
        return res.status(400).send("Password is incorrect")
    }
    console.log("user logged in")
    let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET,{expiresIn:"1h"})
    let refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "3d" })
    console.log("token", accessToken, "refreshToken", refreshToken)
    refreshTokens.push(refreshToken)
   return res.status(200).send({accessToken:accessToken,refreshToken:refreshToken,profile:userExist})
})

router.get('/token', async (req, res) => {
    const refreshToken = req.body.refreshToken
    if (!refreshToken) {
        return res.status(400).send("Please provide refresh token")
    }
    if (!refreshTokens.includes(refreshToken)) {
        return res.status(401).send("Please provide valid refresh token")
    }
    try{
        let payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        let newAccessToken = jwt.sign({id:payload.id}, process.env.ACCESS_TOKEN_SECRET,{expiresIn:"1h"})
        res.status(200).send({"accessToken": newAccessToken})
    }
    catch(e){
        res.status(200).send("Refresh token expired")
    }
})
module.exports = router