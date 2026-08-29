const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const products = [
  { id: 1, name: 'Búp bê công chúa', price: 250000, image: '/images/doll.jpg', description: 'Búp bê dễ thương cho trẻ từ 3 tuổi.' },
  { id: 2, name: 'Xe hơi đồ chơi', price: 180000, image: '/images/car.jpg', description: 'Xe chạy pin tốc độ vừa phải.' },
  { id: 3, name: 'Xếp hình', price: 120000, image: '/images/blocks.jpg', description: 'Bộ xếp hình sáng tạo 200 mảnh.' }
];

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/', (req, res) => {
  res.send('Toy store backend is running. Use /api/products to get product list.');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
