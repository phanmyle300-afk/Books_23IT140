const mongoose = require('mongoose');

// Kết nối dùng cho quyền ĐỌC
const readConnection = mongoose.createConnection(process.env.MONGODB_READ_URI);
// Kết nối dùng cho quyền GHI
const writeConnection = mongoose.createConnection(process.env.MONGODB_WRITE_URI);

const bookSchema = new mongoose.Schema({
    productId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    priceBeforeTax: { type: Number, required: true },
    priceAfterTax: { type: Number, required: true }
});

const BookRead = readConnection.model('Book', bookSchema);
const BookWrite = writeConnection.model('Book', bookSchema);

module.exports = { BookRead, BookWrite };