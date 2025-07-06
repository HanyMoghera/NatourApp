// we are going to builn an error class to use it in our app for error handling in the responds

class AppError extends Error {

    constructor(message, statusCode){
        super(message); // we use word super  to get some parameters from the parent class

        this.statusCode= statusCode;
        this.status= `${statusCode}`.startsWith('4')? 'fail': 'error';
        this.isOperational =true;  // it marks the error as an operation errors since it is not a programing error 
        Error.captureStackTrace(this, this.constructor); // to make the error message much clear by deleting the istructor error.
    }

}

module.exports = AppError;










