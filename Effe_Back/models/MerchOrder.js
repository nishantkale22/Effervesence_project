const mongoose = require('mongoose');

const merchOrderItemSchema = new mongoose.Schema({
    merchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merch', required: true },
    name: String,
    imageUrl: String,
    size: String,
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
}, { _id: false });

const paymentSchema = new mongoose.Schema({
    orderId: String,
    paymentId: String,
    signature: String,
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
}, { _id: false });

const merchOrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [merchOrderItemSchema],
    total: { type: Number, required: true },
    payment: paymentSchema,
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('MerchOrder', merchOrderSchema);
