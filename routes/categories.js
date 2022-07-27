const { Category } = require('../models/category');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get(`/`, async (req, res) => {
    console.log('R:----DENTRO DE-- categories.js router.get(/');
    const categoryList = await Category.find();
    console.log('R:----DENTRO DE-- categories.js router.get(/)--------despues de await Category.find');
    console.log('R:----- categoryList', categoryList);
    if (!categoryList) {
        res.status(500).json({ success: false });
    }
    console.log('R:----- categoryList con JSON.stringify', JSON.stringify(categoryList));
    res.status(200).send(JSON.stringify(categoryList));
});

router.get('/:id', async (req, res) => {
    console.log('R:----DENTRO DE-- categories.js router.get(/:id');
    const id_obj = mongoose.Types.ObjectId(req.params.id.trim());
    const category = await Category.findById(id_obj);

    if (!category) {
        res.status(500).json({
            message: 'The category with the given ID was not found.',
        });
    }
    res.status(200).send(JSON.stringify(category));
});

router.post('/', async (req, res) => {
    console.log('R:----DENTRO DE-- categories.js router.post(/');
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
    });
    category = await category.save();

    if (!category)
        return res.status(400).send('the category cannot be created!');

    res.send(JSON.stringify(category));
});

router.put('/:id', async (req, res) => {
    console.log('R:----DENTRO DE-- categories.js router.put(/:id');
    const id_obj = mongoose.Types.ObjectId(req.params.id.trim());
    const category = await Category.findByIdAndUpdate(
        id_obj,
        {
            name: req.body.name,
            icon: req.body.icon || category.icon,
            color: req.body.color,
        },
        { new: true } //returns the new added document (not the former)
    );

    if (!category)
        return res.status(400).send('the category cannot be created!');

    res.send(JSON.stringify(category));
});

router.delete('/:id', (req, res) => {
    console.log('R:----DENTRO DE-- categories.js router.delete(/:id');
    const id_obj = mongoose.Types.ObjectId(req.params.id.trim());
    Category.findByIdAndRemove(id_obj)
        .then((category) => {
            if (category) {
                return res.status(200).json({
                    success: true,
                    message: 'the category is deleted!',
                });
            } else {
                return res
                    .status(404)
                    .json({ success: false, message: 'category not found!' });
            }
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err });
        });
});

module.exports = router;
