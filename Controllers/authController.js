const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const AppError = require('./../util/appError');
const sendEmail  = require('./../util/email');
const User = require('./../models/userModel');

const signToken = id => {
    return jwt.sign(
        { id: id },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE_IN 
        }
    );
};

const createSendToken = (user, satusCode, res)=>{
    const token = signToken(user._id);
    
    const cookieOptions = {
        expires: new Date(Date.now()+ process.env.JWT_COOKIE_EXPIRE_IN * 24 *60 *60 *1000), // to be in  ms
        secure: true,
        httpOly: true
    }

// sent the jwt to the cookie to be saved there 
    res.cookie('jwt', token, cookieOptions);

    user.password = undefined;


    res.status(satusCode).json({
       status: 'success',
       token,
       data: {
        user
       }
    })


}


exports.signup = async (req, res, next) => {
    try {
        const newUser = await User.create({ 
            name: req.body.name,  
            email: req.body.email, 
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
            role: req.body.role
        });

        // BUILDING THE TOKEN 
        createSendToken(newUser, 201 , res);
        
    } 
    catch (err) {
        res.status(500).json({  
            status: 'fail',
            message: err.message
        });
    }
};

exports.login = async (req, res, next) => {
    try {
        // Get the email and the password from the body 
        const { email, password } = req.body;

        // 1) Check if the email and the password exist 
        if (!email || !password) {
            return next(new AppError('Please provide email and password', 400));
        }

        // 2) Check if the user exists and password is correct 
        const user = await User.findOne({ email }).select('+password'); 

        if (!user || !(await user.correctPassword(password, user.password))) {
            return next(new AppError('Incorrect email or password', 401));
        }

        // 3) If everything is okay send a token to the client 
        createSendToken(user, 200 , res);
    } 
    catch (err) {
        res.status(500).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Middleware for authentication
exports.protect = async (req, res, next) => {
    try {
        // 1) Get the token and check if it exists 
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) { // 
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new AppError('You are not logged in! Please log in to get access', 401));
        }

        // 2) Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // No need for `await`
        //console.log(decoded);

        // 3) Check if the user still exists in the DB 
        const freshUser = await User.findById(decoded.id);
        if (!freshUser) {
            return next(new AppError('The user belonging to this token no longer exists.', 401));
        }

        // 4) Check if the user changed password after the JWT was issued 
        if (freshUser.changedPasswordAfter(decoded.iat)) {
            return next(new AppError('Password changed recently. Please log in again!', 401));
        }

        req.user = freshUser;
        next();
    } 
    catch (err) {
        res.status(500).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Authorization 

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('You do not have permission to perform this action', 403)
            );
        }
        next();
    };
};

// forget the password and send an email with the whole details 

exports.forgetPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken(); 
  await user.save({ validateBeforeSave: false });

  // 3) Send reset link
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n\nIf you didn't forget your password, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      text: message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    // Reset the token and expiry
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!', 500)
    );
  }
};

// reset the password 
exports.resetPassword = async(req, res, next)=>{

// 1- Get user baed on the token 
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({passwordResetToken:hashedToken, passwordResetExpires: {$gt: Date.now()}});
     
    // 2- if token not expired and there is a user set the new password
    if(!user ){
        return next(new AppError('Token is invalid or has expired',400));
    }

    user.password = req.body.password;
    user.passwordConfirm= req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

// 4- log the user in, sent JWT  as a new token. 
createSendToken(user, 200 , res);
};


// update the password 
exports.updatePassword = async (req, res, next)=>{
// Get the user from its password 
const newPassword = req.body.newPassword;
const confirmnewPassword = req.body.confirmnewPassword;

const user = await User.findById(req.user.id).select('+password');

// Old password before updating and check if it is correct 
if(!(await user.correctPassword(req.body.oldPassword, user.password))){
    return next(new AppError('The old Password is not corect, Try again', 401))
}

// if correct update the password
user.password = newPassword;
user.confirmPassword = confirmnewPassword;
await user.save(); // we should always use it when we change anything in the data
// log user and send JWT 
createSendToken(user, 200, res);
};



exports.logout = (req, res)=>{

    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOly: true
    });
    res.status(200).json({
        status: 'success'
    });
}

