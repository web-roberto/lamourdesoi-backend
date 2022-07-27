const { Order } = require('../models/order');
const express = require('express');
const { OrderItem } = require('../models/order-item');
const router = express.Router();
const mongoose = require('mongoose');


router.get(`/`, async (req, res) => {
    console.log('R:----DENTRO DE-- orders.js outer.get(/');
    const orderList = await Order.find()
        .populate('user', 'name')
        .sort({ dateOrdered: -1 });

    if (!orderList) {
        res.status(500).json({ success: false });
    }
    res.send(JSON.stringify(orderList));
});

router.get(`/:id`, async (req, res) => {
    console.log('R:----DENTRO DE-- orders.js outer.get(/:id');
    const id_obj = mongoose.Types.ObjectId(req.params.id.trim());
    const order = await Order.findById(id_obj)
        .populate('user', 'name')
        .populate({
            path: 'orderItems',
            populate: {
                path: 'product',
                populate: 'category',
            },
        });

    if (!order) {
        res.status(500).json({ success: false });
    }
    res.send(JSON.stringify(order));
});

router.post('/', async (req, res) => {
    console.log('R:----DENTRO DE-- orders.js outer.post(/');
    const orderItemsIds = Promise.all(
        req.body.orderItems.map(async (orderItem) => {
            let newOrderItem = new OrderItem({
                quantity: orderItem.quantity,
                product: orderItem.product,
            });

            newOrderItem = await newOrderItem.save();

            return newOrderItem._id;
        })
    );
    const orderItemsIdsResolved = await orderItemsIds;

    const totalPrices = await Promise.all(
        orderItemsIdsResolved.map(async (orderItemId) => {
            //rob
            const orderItemId_obj = mongoose.Types.ObjectId(orderItemId.trim());
            const orderItem = await OrderItem.findById(orderItemId_obj).populate(
                'product',
                'price'
            );
            const totalPrice = orderItem.product.price * orderItem.quantity;
            return totalPrice; //total of only a product.price*quantity
        })
    );

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    });
    order = await order.save();

    if (!order) return res.status(400).send('the order cannot be created!');

    res.send(JSON.stringify(order));
});

router.put('/:id', async (req, res) => {
    console.log('R:----DENTRO DE-- orders.js outer.put(/:id');
    const iid_obj = mongoose.Types.ObjectId(req.params.id.trim());
    const order = await Order.findByIdAndUpdate(
        id_obj,
        {
            status: req.body.status,
        },
        { new: true }
    );

    if (!order) return res.status(400).send('the order cannot be update!');

    res.send(JSON.stringify(order));
});

router.delete('/:id', (req, res) => {
    console.log('R:----DENTRO DE-- orders.js outer.get(/:id');
    const id_obj = mongoose.Types.ObjectId(req.params.id.trim());
    Order.findByIdAndRemove(id_obj)
        .then(async (order) => {
            if (order) {
                await order.orderItems.map(async (orderItemId) => {
                    const orderItemId_obj = mongoose.Types.ObjectId(orderItemId.trim());
                    await OrderItem.findByIdAndRemove(orderItemId_obj);
                });
                return res
                    .status(200)
                    .json({ success: true, message: 'the order is deleted!' });
            } else {
                return res
                    .status(404)
                    .json({ success: false, message: 'order not found!' });
            }
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err });
        });
});

router.get('/get/totalsales', async (req, res) => {
    console.log('R:----DENTRO DE-- orders.js outer.get(/get/totalsales');
    const totalSales = await Order.aggregate([
        { $group: { _id: null, totalsales: { $sum: '$totalPrice' } } },
    ]);

    if (!totalSales) {
        return res.status(400).send('The order sales cannot be generated');
    }

    res.send(JSON.stringify({ totalsales: totalSales.pop().totalsales }));
});

router.get(`/get/count`, async (req, res) => {
    console.log('R:----DENTRO DE-- orders.js outer.get(/get/count');
    const orderCount = await Order.countDocuments((count) => count);

    if (!orderCount) {
        res.status(500).json({ success: false });
    }
    res.send(JSON.stringify({
        orderCount: orderCount,
    }));
});

router.get(`/get/userorders/:userid`, async (req, res) => {
    console.log('R:----DENTRO DE-- orders.js outer.get(/get/userorders/:userid');
    const userid_obj = mongoose.Types.ObjectId(req.params.userid.trim());
    const userOrderList = await Order.find({ user: userid_obj })
        .populate({
            path: 'orderItems',
            populate: {
                path: 'product',
                populate: 'category',
            },
        })
        .sort({ dateOrdered: -1 });

    if (!userOrderList) {
        res.status(500).json({ success: false });
    }
    res.send(JSON.stringify(userOrderList));
});

module.exports = router;
