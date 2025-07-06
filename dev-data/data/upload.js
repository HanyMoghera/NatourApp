const fs = require('fs');
const mongoose = require('mongoose');
const dotenve =require('dotenv');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

// reading the config file 
dotenve.config({path: './.env'});

// to connect the app with atlas and compas
const DB ='mongodb://127.0.0.1:27017/tourdb';
mongoose.connect(DB).then(con => {
//console.log(con.connections);
console.log("DB connected successfully");
});


// reading Json File 
const tours =JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users =JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews =JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

//import data 
const importData = async()=>{

    try{
       const tour = await Tour.create(tours);
       if(tour) console.log('tour creation Done');
        const review= await Review.create(reviews);
        if(review) console.log('review creation Done');
        const user = await User.create(users, { validateBeforeSave : false } );
        if(user) console.log('User creation Done');
        console.log("Data Sucessfully loaded!")
    }
    catch(err){
        console.log(err)
    }
}


//Delete data 
const deleteData =  async()=>{

    try{
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log("Data Sucessfully Deleted!")
    }
    catch(err){
        console.log(err)
    }
};



if(process.argv[2] === '--import'){
    importData();
}
else if (process.argv[2] === '--delete'){
    deleteData();
 
}
   

// console.log(process.argv);