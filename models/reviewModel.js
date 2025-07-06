// text of the review / rating / createdAt / tourId / userId
const mongoose = require('mongoose');
const User = require('./userModel');
const Tour = require('./tourModel');

// building the schema 
const reviewsSchema = mongoose.Schema(
    {
      review: {
        type: String,
        required: [true, 'Review can not be empty']

      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },

      createdAt:{
        type: Date,
        default: Date.now,
      } ,
      tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required:[true, 'Review must belong to a tour']
      },
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', 
        required:[true, 'Review must belong to a user']
      }
    },
    // the end of the fields 
     // to make the virula property, and Objects work we should put the following 
    {
        toJSON: { virtuals: true},
        toObject: { virtuals: true} 
    } 
);

// build an index to make the data more unique when adding a review which it will be uniqu (userId + TourId) user can only post on ereview 
reviewsSchema.index({toue: 1, user: 1}, {unique: true});

// we use this middleware querey to populate the data when calling any find function like find a tour
reviewsSchema.pre(/^find/, function(next){
this.populate({
    path:'user',
    select: 'name photo'
}).populate({
    path:'tour',
    select: 'name'
}),

next();
});

// To get the average and number of reviews for a tour,
// and update it whenever someone posts a new review
// statics to be able to call it in the current doc not out side one.
reviewsSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' } 
      }
    }
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5 // Default value if no reviews
    });
  }
}

// After saving a review, trigger calculation
reviewsSchema.post('save', function () {
  // 'this' points to current review doc
  this.constructor.calcAverageRatings(this.tour);
});

// Update the AverageRate after deleting or updating a new review
 
// findOneAndUpdate => they are query so to use anything from it we should use it before excuting it. 
// findOneAndDelete
// to save a copy of the query before excuting it to get the tourId 
reviewsSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.clone().findOne();
  next();
})


reviewsSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.tour);
})



const Review = mongoose.model('Review',reviewsSchema);
module.exports = Review; 