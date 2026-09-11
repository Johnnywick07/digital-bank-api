const express = require('express');
const app = express();

const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./Config/databaseConfig');
const userRoute = require('./Routes/UserRoute');
const accountRoute = require('./Routes/AccountRoute');
const customerRoute = require('./Routes/CustomerRoute');
const transactionRoute = require('./Routes/TransactionRoute');

app.use(express.json());

app.use('/users', userRoute);
app.use('/accounts', accountRoute);
app.use('/customers', customerRoute);
app.use('/transactions', transactionRoute);

connectDB();

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});