const express = require('express');
const tourcontrollers = require('./../Controllers/tourControllers');
const authController= require('./../Controllers/authController'); 
// middel ware  for tours and users 
const Router = express.Router(); 

// Redirecting a router tour/tourId/review 
// put review on a tour from a specific user. 
const reviewRouter = require('./../Routers/reviewRouts');
Router.use('/:tourId/reviews',reviewRouter); // send to review router 


Router
.route('/top-5-cheap')
.get(tourcontrollers.aliasTopTours,tourcontrollers.getalltours);


Router
.route('/tour-stats')
.get(tourcontrollers.getTourStats);

Router
.route('/monthly-plan/:year')
.get(authController.protect,
    authController.restrictTo('admin', ' lead-guide'),
    tourcontrollers.getmonthlyPlan);

Router.
route('/tours-within/:distance/center/:latlng/unit/:unit')
.get(tourcontrollers.getToursWithin);

Router.
route('/distance/:latlng/unit/:unit')
.get(tourcontrollers.getDistance);


// Tours' Routing         
Router
    .route ('/')
    .get(tourcontrollers.getalltours)
    .post(authController.protect,
         authController.restrictTo('admin', ' lead-guide') 
         ,tourcontrollers.createTour);


Router
    .route('/:id')
    .get(tourcontrollers.gettour)
    .patch(authController.protect,
        authController.restrictTo('admin', ' lead-guide'),
        tourcontrollers.uploadToursImages,
        tourcontrollers.resizeUserPhoto,
        tourcontrollers.updateatour)
    .delete(
        authController.protect,
        authController.restrictTo('admin', ' lead-guide'),
        tourcontrollers.deleteatour
        );


module.exports = Router;