
// calling the tourModel
const Tour = require ('./../models/tourModel');
const AppError = require('./../util/appError');
const APIFeatures = require('./../util/APIFeatures');
const factory = require('./factoryController');
const multer = require('multer');
const sharp = require('sharp');

// to save the images in a buffer  
const multerStoraage = multer.memoryStorage(); 

// build a filter to make sure that the file is an image 
const multerFilter = (req, file, cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null, true)
    }
    else {
        cb(new AppError('Sorry, Pleae provide an image file', 400),false);
    }
};

// Uploading Images on the buffer and make some changes on it 
const upload = multer({  
    storage: multerStoraage,
    fileFilter: multerFilter
});

// upload Tours Images more than one image 
exports.uploadToursImages = upload.fields( // fields Cz we will upload one image and a group of images both at one URL
[
    {name:'imageCover', maxCount: 1},
    {name: 'images', maxCount: 3}
]
);

// upload.array('images',5)  to upload a group of images 
// upload.single('photo')  to upload an image


// First we need to save the images in the buffer not in the desc storage 
exports.resizeUserPhoto =async (req, res, next)=>{
    try{

if(!req.files.imageCover || !req.files.images) return next();

// cover image + Naming
 req.body.imageCover =`tour-${req.params.id}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
    .resize(2080,1333)
    .toFormat('jpeg')
    .jpeg({quality: 90})
    .toFile(`public/img/tours/${ req.body.imageCover}`);

// Images 1,2,3
req.body.images = [];

await Promise.all(
    req.files.images.map(async (file, i)=>{
    const filename= `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`
    
    await sharp(file.buffer)
        .resize(2080,1333)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`public/img/tours/${filename}`);

    req.body.images.push(filename);
    
    })
);
    next();
}catch(err){
    res.status(400).json({
        status:'Fail',
        message: err
    })
}
}



// this is a mediel ware to put some properties then we can start sending another order based on the results of the previouse medile ware 
// to get all the tours 
exports.getalltours = factory.getAll(Tour);
exports.gettour = factory.getOne(Tour, {path: 'reviews'});
exports.createTour =factory.createOne(Tour);
exports.updateatour = factory.updateOne(Tour);       
exports.deleteatour = factory.deleteOne(Tour);

exports.getTourStats = async (req, res) => {
    try {
        const stats = await Tour.aggregate([
            {
                $match: { ratingsAverage: { $gte: 4.5 } }
            },

            {
                $group: {
                    _id: {$toUpper: "$difficulty"},
                    numTours: {$sum: 1},
                    numRating: {$sum: '$ratingsQuantity'},
                    avgRating: { $avg: "$ratingsAverage" },
                    avgPrice: { $avg: "$price" },
                    minPrice: { $min: "$price" },
                    maxPrice: { $max: "$price" }
                }
            },

            {
                  $sort: { avgPrice: 1}
        }, 

        // {
        //         $match: {_id: {$ne: 'EASY'}}
        // }

        ]);

        res.status(200).json({
            status: "Success",
            data: {
                stats
            }
        });

    } catch (err) {
        res.status(400).json({
            status: "failed",
            message: err.message
        });
    }
};

exports.getmonthlyPlan = async (req, res) =>{

try{

     const year = req.params.year*1; // to get it in num form 

     const plan = await Tour.aggregate([

        {
            $unwind: '$startDates'
        },

        {
            $match : {    // to select a specific elements from the db 
                    startDates: {
                        $gte : new Date(`${year}-01-01`),   // to form the data from the that u wanna match. 
                        $lte: new Date(`${year}-12-31`),
                    }
                }

            },
            {
                $group: {
                    _id: {$month: '$startDates' },
                    numofToursStarts: {$sum: 1 },
                    tours: { $push: '$name'}   // we use it when we wanna add more than one object it is an array 

                }
            },
            {
                $addFields:{   // to add a new field in th db 
                    month: '$_id'
                }
            },
            {
                $project: { // to hide thing from the db 
                    _id: 0
                }
            },
            {

                $sort: {
                    numofToursStarts: -1 // -1 accendening 
                }
            },
            {
                $limit: 12 // to limit the results 
            }
        
     ]);


    res.status(200).json({
                status: "Success",
                data: {
                    plan
                }
            });


}

catch(err){
    res.status(400).json({
        status: "failed",
        message: err.message
    });

}


}

exports.aliasTopTours = (req, res, next) =>{
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields= 'name,price,ratingsAverage,summary,difficulty';
    
    next();
}; 

//('/tours-within/:distance/center/:latlng/unit/:unit')
exports.getToursWithin = async(req, res, next)=>{

    try {
        const {distance, latlng, unit} = req.params;

        const [lat, lng] = latlng.split(',');
        const radius = unit === 'mi'? distance/3963.2: distance/6378.1; //km
        if(!lat || !lng){
            next(new AppError('Please provide the lat and lng ',400));
        }
        const tours = await Tour.find({
            startLocation: {
                $geoWithin: 
                {$centerSphere: [[lng, lat],radius]}}
        })

    res.status(200).json({
            status: "Success",
            results: tours.length,
            data:{
                data:tours
            }
        });

    } catch (err) {
        res.status(400).json({
            status: "failed",
            message: err.message
        });
    }
}

exports.getDistance = async (req, res, next) => {
    try {
      const { latlng, unit } = req.params;
      const [lat, lng] = latlng.split(',');
  
      if (!lat || !lng) {
        return next(new AppError('Please provide the lat and lng', 400));
      }
  
      const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  
      const distances = await Tour.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)] 
            },
            distanceField: 'distance',
            distanceMultiplier: multiplier,
            spherical: true,
          }
        },
        {
          $project: {
            distance: 1,
            name: 1
          }
        }
      ]);
  
      res.status(200).json({
        status: 'Success',
        results: distances.length,
        data: {
          data: distances
        }
      });
  
    } catch (err) {
      res.status(400).json({
        status: 'failed',
        message: err.message
      });
    }
};
  