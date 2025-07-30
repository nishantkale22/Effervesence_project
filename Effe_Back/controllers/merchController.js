const Merch = require('../models/Merch');
// ... existing code ...
const MerchOrder = require('../models/MerchOrder');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Get all merch with stock (admin)
exports.getAllMerchStock = async (req, res) => {
    try {
        const merch = await Merch.find();
        res.json(merch);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch merch stock', error: err.message });
    }
};

// Get all merch orders with user info (admin)
exports.getAllMerchOrders = async (req, res) => {
    try {
        const orders = await MerchOrder.find().populate('user', 'name email phone');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch merch orders', error: err.message });
    }
};

// Get sales summary (admin)
exports.getMerchSalesSummary = async (req, res) => {
    try {
        const orders = await MerchOrder.find({ status: 'paid' });
        let totalRevenue = 0;
        let totalItemsSold = 0;
        const salesByMerch = {};
        for (const order of orders) {
            totalRevenue += order.total;
            for (const item of order.items) {
                totalItemsSold += item.quantity;
                if (!salesByMerch[item.merchId]) {
                    salesByMerch[item.merchId] = { name: item.name, sizeSales: {}, total: 0 };
                }
                salesByMerch[item.merchId].total += item.quantity;
                if (item.size) {
                    salesByMerch[item.merchId].sizeSales[item.size] = (salesByMerch[item.merchId].sizeSales[item.size] || 0) + item.quantity;
                }
            }
        }
        res.json({ totalRevenue, totalItemsSold, salesByMerch });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch sales summary', error: err.message });
    }
};

exports.createMerchOrder = async (req, res) => {
    try {
        const { items } = req.body; // [{ merchId, size, quantity }]
        const userId = req.user._id;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }
        // Fetch merch and check stock
        let total = 0;
        const orderItems = [];
        for (const cartItem of items) {
            const merch = await Merch.findById(cartItem.merchId);
            if (!merch) return res.status(404).json({ message: 'Merch not found' });
            let sizeObj = null;
            if (merch.sizes && merch.sizes.length > 0) {
                sizeObj = merch.sizes.find(s => s.size === cartItem.size);
                if (!sizeObj) return res.status(400).json({ message: `Size ${cartItem.size} not available` });
                if (sizeObj.stock < cartItem.quantity) return res.status(400).json({ message: `Not enough stock for ${merch.name} (${cartItem.size})` });
            } else {
                if (merch.stock < cartItem.quantity) return res.status(400).json({ message: `Not enough stock for ${merch.name}` });
            }
            total += merch.price * cartItem.quantity;
            orderItems.push({
                merchId: merch._id,
                name: merch.name,
                imageUrl: merch.imageUrl,
                size: cartItem.size,
                quantity: cartItem.quantity,
                price: merch.price,
            });
        }
        // Create Razorpay order
        const options = {
            amount: Math.round(total * 100),
            currency: 'INR',
            receipt: `merch_${userId}_${Date.now()}`.slice(-40),
        };
        const razorpayOrder = await razorpay.orders.create(options);
        // Save order as pending
        const merchOrder = await MerchOrder.create({
            user: userId,
            items: orderItems,
            total,
            payment: { orderId: razorpayOrder.id, status: 'pending' },
            status: 'pending',
        });
        res.status(201).json({ order: razorpayOrder, merchOrderId: merchOrder._id });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create merch order', error: err.message });
    }
};

exports.verifyMerchOrderPayment = async (req, res) => {
    try {
        const { merchOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const merchOrder = await MerchOrder.findById(merchOrderId);
        if (!merchOrder) return res.status(404).json({ message: 'Order not found' });
        // Verify signature
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign)
            .digest('hex');
        if (expectedSignature !== razorpay_signature) {
            merchOrder.payment.status = 'failed';
            merchOrder.status = 'failed';
            await merchOrder.save();
            return res.status(400).json({ message: 'Payment verification failed' });
        }
        // Reduce stock
        for (const item of merchOrder.items) {
            const merch = await Merch.findById(item.merchId);
            if (merch.sizes && merch.sizes.length > 0) {
                const sizeObj = merch.sizes.find(s => s.size === item.size);
                if (sizeObj) sizeObj.stock -= item.quantity;
            } else {
                merch.stock -= item.quantity;
            }
            await merch.save();
        }
        merchOrder.payment = {
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
            status: 'paid',
        };
        merchOrder.status = 'paid';
        await merchOrder.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Failed to verify payment', error: err.message });
    }
};
// ... existing code ...
// Create new merch
exports.createMerch = async (req, res) => {
    try {
        const { name, description, price, imageUrl, stock, display, sizes } = req.body;
        if (!name || !price || !imageUrl || stock == null) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        let merchData = { name, description, price, imageUrl, stock, display };
        if (sizes) {
            // Accept sizes as array of objects (from JSON or form)
            merchData.sizes = Array.isArray(sizes) ? sizes : JSON.parse(sizes);
        }
        const merch = await Merch.create(merchData);
        res.status(201).json(merch);
    } catch (err) {
        res.status(500).json({ message: 'Failed to create merch', error: err.message });
    }
};

// Get all merch (optionally filter by display)
exports.getAllMerch = async (req, res) => {
    try {
        const { display } = req.query;
        const filter = display != null ? { display: display === 'true' } : {};
        const merch = await Merch.find(filter).sort({ createdAt: -1 });
        res.json(merch);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch merch', error: err.message });
    }
};

// Update merch
exports.updateMerch = async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;
        if (update.sizes) {
            update.sizes = Array.isArray(update.sizes) ? update.sizes : JSON.parse(update.sizes);
        }
        const merch = await Merch.findByIdAndUpdate(id, update, { new: true });
        if (!merch) return res.status(404).json({ message: 'Merch not found' });
        res.json(merch);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update merch', error: err.message });
    }
};

// Delete merch
exports.deleteMerch = async (req, res) => {
    try {
        const { id } = req.params;
        const merch = await Merch.findByIdAndDelete(id);
        if (!merch) return res.status(404).json({ message: 'Merch not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete merch', error: err.message });
    }
}; 