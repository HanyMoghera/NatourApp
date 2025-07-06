const path =require('path');
const express = require('express');
const morgan = require('morgan');
const retelimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const tourRouter = require('./Routers/toursRouts');
const userRouter = require('./Routers/usersRouts');
const reviewRouter = require('./Routers/reviewRouts');
const AppError = require('./util/appError');


// creaating middel ware use in getting requests 
const app = express();

// serving static fields 
app.use(express.static(path.join(__dirname,'public')));


// body parser, reading data from the body into req.body
app.use(express.json({limit: 'kb'})); // {limit: 'kb'}) the siize og the body request 

// Data sanitization against NoSQL query injection 
//app.use(mongoSanitize());

// Data Sanitization against xss or HTML code 
app.use(xss());
// the same query parameter is repeated multiple times
app.use(hpp());
// developing loggin g
app.use(morgan('dev'));
// golbal midelware for the http protection 
app.use(helmet());



// a midelware to limit the num of requests 
const limiter = retelimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Yo many requests, try again after an houre!'
})

app.use('/api' ,limiter);

app.get('/',(req, res)=>{
    res.status(200).render('base', {
        tour: "the tour Hicker",
        user: "Hany"
    });

});



// Using the global  Middelware
app.use('/api/v1/tours' ,tourRouter);
app.use('/api/v1/users' ,userRouter);
app.use('/api/v1/reviews' ,reviewRouter);
// if the user asked for anyother URL except the one from the previous it will get this error 
app.all('*', (req,res, next)=>{
// using the Error class 
next(new AppError(`this URL ${req.originalUrl} is not on this server`,404));
});


// Global Eroor Handling middleware 
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    });
});



module.exports = app;







