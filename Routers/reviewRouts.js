const express = require('express');
const reviewController = require('./../Controllers/reviewController');
const authController = require('./../Controllers/authController');


const Router = express.Router({mergeParams: true}); //{mergParams: true} we use this to be able to access any params from the rout like tour/tourId/ review so I can access tourId

Router.use(authController.protect)


Router
.route('/')
.get(reviewController.getAllReview)
.post(authController.restrictTo('user'),
     reviewController.setTourUserIds,
     reviewController.createReview);

Router
.route('/:id')
.get(reviewController.getReview)
.delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview)
.patch(authController.restrictTo('user', 'admin'),reviewController.updateReview);


module.exports= Router;