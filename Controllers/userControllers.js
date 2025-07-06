const AppError = require('./../util/appError');
const User = require('./../models/userModel');
const factory = require('./factoryController');
const multer = require('multer'); // to deal with the images 
const sharp = require('sharp'); // resize the image


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

// Uploading Images and make some changes on it 
const upload = multer({
    storage: multerStoraage,
    fileFilter: multerFilter
});
// upload one image
exports.uploadUserPhoto = upload.single('photo');


// First we need to save the images in the buffer not in the desc storage 
exports.resizeUserPhoto =async (req, res, next)=>{
if(!req.file) return next();
req.file.filename =`user-${req.user.id}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
    .resize(500,500)
    .toFormat('jpeg')
    .jpeg({quality: 90})
    .toFile(`public/img/users/${req.file.filename}`);
    next();
}










// this will filter the body before using updateMe function to put limitations in the update method 
const filterObj = (obj, ...allowedFields) =>{
const newObj ={};
Object.keys(obj).forEach(el=>{
if(allowedFields.includes(el)) newObj [el] = obj [el];
});
return newObj;
};

// Handelers
// do not use it with password updating 
exports.getAllUsers =factory.getAll(User); 
 exports.getUser = factory.getOne(User);
 exports.deleteUser = factory.deleteOne(User);
 exports.updateUser = factory.updateOne(User);

 exports.createUser = (req, res, next) =>{
    res.status(500).json(
        {
            status: 'error',
            message: 'Please use /127.0.0.1:3001/api/v1/users/signup to signUp'
        }
    );
 };
 
exports.getMe = (req, res, next)=>{
    req.params.id = req.user.id;
    next();
}

exports.updateMe =  (req, res, next)=>{
    req.params.id = req.user.id;
    next();
}

exports.deleteMe = async (req, res, next)=>{
    
        await User.findByIdAndUpdate(req.user.id, {active: false});
    
        res.status(200).json({
             satatus: 'success',
             data: {
                data: null
             }
    
        })
    
    
}
    