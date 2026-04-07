const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const app = require('./app');

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('DB connected');
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server running on port ${process.env.PORT || 3000}`);
    });
  })
  .catch((err) => {
    console.log('DB Error:', err.message);
  });