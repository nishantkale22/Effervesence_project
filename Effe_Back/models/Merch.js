const mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema({
    size: { type: String, required: true }, // e.g., 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'
    stock: { type: Number, required: true, min: 0 }
}, { _id: false });

const merchSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    stock: { type: Number, required: true, min: 0 }, // For legacy/simple items
    display: { type: Boolean, default: true },
    sizes: [sizeSchema], // For items with size options
}, { timestamps: true });

module.exports = mongoose.model('Merch', merchSchema); 