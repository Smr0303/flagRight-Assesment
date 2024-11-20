// load env-vars
require('dotenv').config();

// requiring dependencies
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const {connectToDb} = require('./config/db'); 


// initialize express
const app = express();

// requiring routers

const userRouter = require('./routes/authRoutes');

// requiring middlewares
const errorMiddleware = require('./middlewares/error');

// uncaught exception
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Server shutting down due to uncaught exception`);
  process.exit(1);
});

// connect to db
connectToDb();

// using middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// basic api route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Service running',
  });
});

// using routers

app.use('/api/user', userRouter);

// using other middlewares
app.use(errorMiddleware);

// starting server
const server = app.listen(process.env.PORT || 8000, () => {
  console.log('Server running');
});

// unhandled promise rejection
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Server shutting down due to unhandled promise rejection`);
  server.close(() => {
    process.exit(1);
  });
});