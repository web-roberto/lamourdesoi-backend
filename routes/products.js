const { Product } = require('../models/product');
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
    // ALL THE TYPES ARE HERE: https://www.freeformatter.com/mime-types-list.html#mime-types-list
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
    'image/webp': 'webp',
    'image/tiff': 'tiff',
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');
        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-'); //replaces ' ' by '-'
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    },
});

const uploadOptions = multer({ storage: storage });
//list products with a category in concret
router.get(`/`, async (req, res) => {
    let filter = {}; // [] ?? -> uses {} o use the same get('/') por normal use
    // and for use with query. When there is no query the filter is {} and it works
    //like with no filters
    //http://localhost:3000/api/v1/products?categories=1111,222
    // el query es el ? de la url
    if (req.query.categories) {
        // returns an array of strings ["1111","22"]
        filter = { category: req.query.categories.split(',') };
    }
    const productList = await Product.find(filter).populate('category');

    if (!productList) {
        res.status(500).json({ success: false });
    }
    res.send(productList);
});

router.get(`/:id`, async (req, res) => {
    const id_obj = mongoose.Types.ObjectId(req.params.id.trim());
    const product = await Product.findById(id_obj).populate('category');
    if (!product) {
        res.status(500).json({ success: false });
    }
    res.send(product);
});

//in the FORM of the client, we MUST call the field like 'image'
router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    //Firstly we check if exists Category because a field of Product is Foreign Key
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    const file = req.file;
    if (!file) return res.status(400).send('No image in the request');
    // we get it from the url with the POST
    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    // we don't use 'IMAGES' the gallery of images, we will do it un PUT gallery-images
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`, // "http://localhost:3000/public/upload/image-2323232"
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    });

    product = await product.save();
    if (!product) return res.status(500).send('The product cannot be created');
    res.send(product);
});

//in the FORM of the client, we MUST call the field like 'image'
router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    // isValidObjectID to evoid using try {} catch, to avoid an exception
    // we use it ony in PUTs
    const id_obj = mongoose.Types.ObjectId(req.params.id.trim());
    if (!mongoose.isValidObjectId(id_obj)) {
        return res.status(400).send('Invalid Product Id');
    }
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    const product = await Product.findById(id_obj);
    if (!product) return res.status(400).send('Invalid Product!');

    const file = req.file; //it comes from FORM-DATA, no in BODY and not in QUERY (url)
    let imagepath;
    // if user doesn't upload a new file the url of the file is the same than the former
    if (file) {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagepath = `${basePath}${fileName}`;
    } else {
        imagepath = product.image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        id_obj,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imagepath,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        },
        { new: true }
    );

    if (!updatedProduct)
        return res.status(500).send('the product cannot be updated!');

    res.send(updatedProduct);
});

router.delete('/:id', (req, res) => {
    const id_obj = mongoose.Types.ObjectId(req.params.id.trim());
    Product.findByIdAndRemove(id_obj)
        .then((product) => {
            if (product) {
                return res.status(200).json({
                    success: true,
                    message: 'the product is deleted!',
                });
            } else {
                return res
                    .status(404)
                    .json({ success: false, message: 'product not found!' });
            }
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err });
        });
});

//countDocuments: counts de number o registers of a table
router.get(`/get/count`, async (req, res) => {
    const productCount = await Product.countDocuments((count) => count);

    if (!productCount) {
        res.status(500).json({ success: false });
    }
    res.send({
        productCount: productCount,
    });
});
// we show the most important products at the beginning
router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0;
    // +count converts de count from string to number
    const products = await Product.find({ isFeatured: true }).limit(+count);

    if (!products) {
        res.status(500).json({ success: false });
    }
    res.send(products);
});

// PUT to upload a gallery of images, but firstly we uploade de MAIN IMAGE mandatory
router.put(
    '/gallery-images/:id',
    uploadOptions.array('images', 10),
    async (req, res) => {
        // isValidObjectID to evoid using try {} catch, to avoid an exception
        // we use it ony in PUTs
        const id_obj = mongoose.Types.ObjectId(req.params.id.trim());
        if (!mongoose.isValidObjectId(id_obj)) {
            return res.status(400).send('Invalid Product Id');
        }
        const files = req.files;
        let imagesPaths = [];
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

        if (files) {
            files.map((file) => {
                imagesPaths.push(`${basePath}${file.filename}`);
            });
        }

        const product = await Product.findByIdAndUpdate(
            id_obj,
            {
                images: imagesPaths,
            },
            { new: true }
        );

        if (!product)
            return res.status(500).send('the gallery cannot be updated!');

        res.send(product);
    }
);

module.exports = router;
