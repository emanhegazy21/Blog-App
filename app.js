const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const globalErrorHandler = require('./middleware/error.middleware');
const notFoundMiddleware = require('./middleware/not-found.middleware');

const authRouter = require('./routes/auth.route');
const userRouter = require('./routes/user.route');
const postRouter = require('./routes/post.route');
const groupRouter = require('./routes/group.route');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/groups', groupRouter);

app.use(notFoundMiddleware);


app.use(globalErrorHandler);

module.exports = app;