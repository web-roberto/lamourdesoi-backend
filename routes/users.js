const { User } = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

router.get(`/`, async (req, res) => {
    // we don't want to show the field passwordHash
    const userList = await User.find().select('-passwordHash');

    if (!userList) {
        res.status(500).json({ success: false });
    }
    res.send(userList);
});

router.get('/:id', async (req, res) => {
    // we don't want to show the field passwordHash
    const id_obj = mongoose.Types.ObjectId(req.params.id.trim());
    const user = await User.findById(id_obj).select('-passwordHash');

    if (!user) {
        res.status(500).json({
            message: 'The user with the given ID was not found.',
        });
    }
    res.status(200).send(user);
});

router.post('/', async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    });

    user = await user.save();

    if (!user) return res.status(400).send('the user cannot be created!');

    res.send(user);
});

router.put('/:id', async (req, res) => {
    const id_obj = mongoose.Types.ObjectId(req.params.id.trim());
    const userExist = await User.findById(id_obj);
    let newPassword;
    if (req.body.password) {
        newPassword = bcrypt.hashSync(req.body.password, 10);
    } else {
        newPassword = userExist.passwordHash;
    }

    const user = await User.findByIdAndUpdate(
        id_obj,
        {
            name: req.body.name,
            email: req.body.email,
            passwordHash: newPassword,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
        },
        { new: true }
    );

    if (!user) return res.status(400).send('the user cannot be created!');

    res.send(user);
});

router.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    const secret = process.env.secret;
    if (!user) {
        return res.status(400).send('The user not found');
        console.log('-------------------- USUARIO NO ENCONTRADO POR EMAIL----');
    }

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        //after checking email and password we create the token in the backend
        // inside the token is the userid,and if he is Admin and expiration date
        const token = jwt.sign(
            {
                //this is the payload of the token and is public
                userId: user.id, //it's and object
                isAdmin: user.isAdmin,
            },
            secret,
            { expiresIn: '1d' }
        );
        console.log(
            '---------EMIALUSUARIO LEIDO',
            user.email,
            '------- TOKEN',
            token,
            '----'
        );
        res.status(200).send({ user: user.email, token: token });
    } else {
        res.status(400).send('password is wrong!');
    }
});

router.post('/register', async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    });
    user = await user.save();

    if (!user) return res.status(400).send('the user cannot be created!');

    res.send(user);
});

router.delete('/:id', (req, res) => {
    const id_obj = mongoose.Types.ObjectId(req.params.id.trim());
    User.findByIdAndRemove(id_obj)
        .then((user) => {
            if (user) {
                return res
                    .status(200)
                    .json({ success: true, message: 'the user is deleted!' });
            } else {
                return res
                    .status(404)
                    .json({ success: false, message: 'user not found!' });
            }
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err });
        });
});

router.get(`/get/count`, async (req, res) => {
    const userCount = await User.countDocuments((count) => count);

    if (!userCount) {
        res.status(500).json({ success: false });
    }
    res.send({
        userCount: userCount,
    });
});

module.exports = router;
