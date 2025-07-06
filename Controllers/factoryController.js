const AppError = require('./../util/appError');
const APIFeatures = require('./../util/APIFeatures');

exports.deleteOne = Model => async(req, res, next) => {
    try{

       const doc = await Model.findByIdAndDelete(req.params.id);
       if(!doc){
        return next(new AppError('there is no doc with this ID ', 404));
    }
       res.status(204).json({
        status:'success',
        data: null
       })
       
    }
    catch(err){
        res.status(400).json({
            status: "failed",
            message: err.message
        });
    }
};

exports.updateOne = Model => async(req, res, next)=>{
    try {
       const doc = await Model.findByIdAndUpdate(req.params.id, req.body, 
        
           {    new: true ,
                runValidators: true
            } );

            if(!doc){
                return next(new AppError('there is no Documendt with is Id ', 404));
            }
             // new to return the new doc, validator to validate the schema on the new data
        res.status(200).json({
            status: 'Success',
            Data:{
                Data:doc 
            } 
        })
    }
    catch(err){
        res.status(400).json({
            status:'failed',
            message: err
        })
    }
    
};

exports.createOne = Model => async(req, res, next)=>{
try{
const newDoc = await Model.create(req.body);

    res.status(201).json(
        {
            status: 'success',
            data: {
                data:newDoc
            }
        }
    )
}
catch(err){
res.status(400).json({
    status: "Failed",
    message: err.message
})
}
};

exports.getOne = (Model , populatOptions) => async(req, res, next) => {

    try{

        let query = await Model.findById(req.params.id);
        if(populatOptions) query = query.populate('reviews');
        const doc = await query;

    if(!doc){
        return next(new AppError('there is no Document with this Id ', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            doc
        }
    });

    }
    catch(err){ 
        res.status(404).json({
            status: "Failed",
            message: err
        });
}
};

exports.getAll = Model => async(req, res)=>{

    try{     
        // this is for get all reviews for a certain tour
         let filter = {};
         if(req.params.tourId) filter = {tour: req.params.tourId}
     
    // excuting the query 
    const features = new APIFeatures(Model.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

    const doc = await features.query//.explain(); // we are using explain to get more operational details about the request of the query
        if(!doc){
            return next(new AppError('there are no Docs', 404));
        }

        res.status(200).json({
            status: 'success',
            results: doc.length,
            data: {
                doc
            }
        });
    }
    catch (err){
        res.status(404).json({
            status: "Failed",
            message: err.message

        });
    }
};
