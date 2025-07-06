const mongoose = require('mongoose');
const slugify = require('slugify'); //
const validator = require('validator');
const User = require('./userModel');
// const Review = require('./reviewModel');
// Creating a schema for the tours data
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [100, 'A tour name must have less than or equal to 100 characters'],
      minlength: [5, 'A tour name must have more than or equal to 5 characters'],
      validate: {
        validator: function(val){
          return validator.isAlpha(val, 'en-US', { ignore: ' '});
        },
        message: 'UserName must has only Alphapitic letters',
      },
    },
    slug: { type: String, unique: true }, 
    secretTour :{
      type: Boolean
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a max group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty level'],
      enum: {  // we use it when we have some limited options 
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10 )/10 // to get 4.3333 to 4.3
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,

      validate: {
        validator: function (val){  
        return val < this.price;
        // This just while creating a tour, but it is not woring in updation one 
      },
      message: 'The Discound price {{VALUE}} should be below regular price'
    }
  },
    summary: {
      type: String,
      required: [true, 'A tour must have a summary'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    startDates: [Date],
    createdAt: {
      type: Date,
      default: () => Date.now() // 
    },

    startLocation: {

      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String,
    }, // we used [] CZ it is embeded object not reference one 
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }

    ],

   // guides: Array // this way if we will embeded the user in the tour schema rather than reference to it. 
   // here is the way that we can Use to reference to a user duc 
   guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: User
      }
     ]
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);



tourSchema.index({price: 1}); //  we use index to raise the performance of the searching 
tourSchema.index({price: 1, ratingsAverage: -1}); //  we use index to raise the performance of the searching 
tourSchema.index({ startLocation: '2dsphere' });
// Virtual property for duration in weeks
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// virtual populate the reviews in the tour model 
tourSchema.virtual('reviews', {
  ref: 'Review',  // the name of the model which we r referncing to 
  foreignField: 'tour', // the name of the field in the review model 
  localField: '_id' // the name of the field in toue model 
});

//Pre-save middleware to generate slug before saving only while creating 
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
 
// // after same middleware 
// tourSchema.post('save', function(doc,next){ // doc to have access to the doc 
// console.log(doc); // the finished 
// next(); 
// });


// qurary middileware 
tourSchema.pre(/^find/,function (next){
this.find({secretTour: {$ne: true}});
next();
})
// we use this middleware querey to populate the data when calling any find function like find a tour
tourSchema.pre(/^find/, function(next){
this.populate({
  path: 'guides',
  select: '-__v -passwordChangedAt'
});
next();
})
// // this is a way that we can embeded users in tour  
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// // aggragation middelwarwe 
// tourSchema.pre('aggregate', function(next) {
// this.pipeline().unshift({$match:{secretTour: { $ne : true}}}),
// next();
// });



// Creating the model
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
