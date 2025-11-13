const express = require('express');
const cors = require('cors');
const userRouter = require('./routes/users');
const boardRouter = require('./routes/boards');
const listRouter = require('./routes/lists');
const cardRouter = require('./routes/cards');

const port = 3000;

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/users', userRouter);
app.use('/boards', boardRouter);
app.use('/lists', listRouter);
app.use('/cards', cardRouter);

app.listen(port, () => {
    console.log('Server is running on port', port);
});