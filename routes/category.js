const express = require('express');
const categoryModel = require('../schemes/categoryScheme');
const router = express.Router();
const CategoryModel = require("../schemes/categoryScheme")
router.get('/', async (req, res) => {
    const categories = await CategoryModel.find({})
    if(categories===null){
        return res.status(400).send("No category exist ")
    }
    res.status(200).send(categories)
})
router.post('/add', async (req, res) => {
    const { name } = req.body
    if (!name) {
        return res.status(400).send("No category passed")
    }
    const categoryExist = await CategoryModel.findOne({ name:name  })
    if (categoryExist !== null) {
        return res.status(400).send("Category already exists")
    }
    let newCategory = new CategoryModel({
       name:name,
       active:true,
    })
    res.status(200).send(`Category created with id ${newCategory.id}`)
    console.log(newCategory)
    newCategory.save()
})
router.post('/:id/delete', async (req, res) => {
    const id = req.params.id;
    let filter = {"_id":id}
    console.log(id)
    const categories = await CategoryModel.find(filter)
    if(categories===null){
        return res.status(400).send("No such category exist")
    }
    await categoryModel.findOneAndUpdate(filter,{active:false})
    return res.status(200).send("Category deleted")
   
})
module.exports = router