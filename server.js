
const mongoose = require('mongoose');
const dotenve =require('dotenv');

// reading the config file 
dotenve.config({path: './.env'});

// to connect the app with atlas and compas
const DB = process.env.LOCALDATABASE;
mongoose.connect(DB).then(con => {
//console.log(con.connections);
console.log("DB connected successfully");
}).catch(err => {
    console.log(err)
})


const app = require('./app');

const port = process.env.PORT;
const server = app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
});



