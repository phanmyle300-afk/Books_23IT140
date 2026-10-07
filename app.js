require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { engine } = require('express-handlebars');
const { BookRead, BookWrite } = require('./models/book');

const app = express();

app.engine('hbs', engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', './views');

app.use(express.urlencoded({ extended: true }));

// Stateless Session lưu trực tiếp xuống MongoDB Atlas (Không lưu RAM)
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret_key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_WRITE_URI,
        collectionName: 'sessions'
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// Route trang chủ - Tự động chuyển hướng sang /books để tránh lỗi Cannot GET /
app.get('/', (req, res) => {
    res.redirect('/books');
});

// Xem danh sách (Dùng tài khoản ĐỌC)
app.get('/books', async (req, res) => {
    try {
        const books = await BookRead.find({});
        res.render('books', { 
            books, 
            fullName: "Mỹ Lệ", 
            mssv: "23IT140", 
            vatPercent: "6%" // Chữ số cuối (0) + 6 = 6%
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Thêm mới sách (Dùng tài khoản GHI)
app.post('/books/add', async (req, res) => {
    try {
        const { productId, name, priceBeforeTax } = req.body;

        // Bộ lọc: Mã sản phẩm bắt buộc bắt đầu bằng phần đuôi MSSV (140)
        if (!productId || !productId.startsWith('140')) {
            return res.status(400).send("Lỗi: Mã sản phẩm phải bắt đầu bằng phần đuôi MSSV (140).");
        }

        // Thuế suất động VAT = 6% (Hệ số 1.06 dựa theo chữ số cuối 0)
        const vatRate = 0.06;
        const priceAfterTax = Number(priceBeforeTax) * (1 + vatRate);

        const newBook = new BookWrite({
            productId,
            name,
            priceBeforeTax: Number(priceBeforeTax),
            priceAfterTax
        });

        await newBook.save();
        res.redirect('/books');
    } catch (error) {
        res.status(500).send("Lỗi ghi dữ liệu: " + error.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));