const express = require('express');
const userController = require('../Controllers/userControllers');
const authController = require('../Controllers/authController');

const router = express.Router();

// some controllers dif for the user 
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/updatePassword',authController.protect, authController.updatePassword);
router.get('/logout', authController.logout);


// all the routers after this point must me protected 
router.use(authController.protect);

router.patch('/updateMe',
         userController.updateMe, 
         userController.uploadUserPhoto,  
         userController.resizeUserPhoto,
        userController.updateUser);

router.patch('/deleteMe', userController.deleteMe);
router.get('/getMe', userController.getMe,userController.getUser);


router.use(authController.restrictTo('admin'));

// useful Endpoints for the admin CRUD
router
        .route('/')
        .get(userController.getAllUsers)
        .post(userController.createUser);


router
        .route('/:id')
        .get(userController.getUser)
        .delete(userController.deleteUser)
        .patch(userController.updateUser);

module.exports = router;