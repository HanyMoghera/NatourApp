// calling the libraries 
const Review = require('./../models/reviewModel');
const AppError= require('./../util/appError');
const factory = require('./factoryController');


exports.setTourUserIds = (req, res, next)=>{
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;
    next();
}


exports.getAllReview = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview =factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);