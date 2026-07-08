require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/db/db')
const cookieParser = require('cookie-parser');

app.use(cookieParser());


connectDB();

app.listen(3000, () => {
    console.log("Server running on port 3000");
});