const express = require('express');
const categoryModel = require('../schemes/categoryScheme');
const router = express.Router();
const CategoryModel = require("../schemes/categoryScheme")
const ObjectId = require('mongodb').ObjectId

router.get('/', async (req, res) => {
    const categories = await CategoryModel.find({})
    if (categories === null) {
        return res.status(400).send("No category exist ")
    }
    res.status(200).send(categories)
})
router.post('/add', async (req, res) => {
    const { name } = req.body
    if (!name) {
        return res.status(400).send("No category passed")
    }
    const categoryExist = await CategoryModel.findOne({ name: name })
    if (categoryExist !== null) {
        return res.status(400).send("Category already exists")
    }
    let newCategory = new CategoryModel({
        name: name,
        active: true,
    })
    res.status(200).send(`Category created with id ${newCategory.id}`)
    console.log(newCategory)
    newCategory.save()
})
router.post('/:id/delete', async (req, res) => {
    const id = req.params.id;
    try {
        let filter = { "_id": ObjectId(id) }
        const categories = await CategoryModel.findOne(filter)
        if (categories === null) {
            return res.status(400).send("No such category exist")
        }
        await categoryModel.findOneAndUpdate(filter, { active: false })
        return res.status(200).send("Category deleted")
    }
    catch (e) {
        return res.status(400).send("Invalid Id")
    }

})
module.exports = router