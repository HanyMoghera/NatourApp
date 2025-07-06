class APIFeatures {
    constructor(query, queryStry){
        this.query = query;
        this.queryStry= queryStry;
    }



filter()
{

    const queryObj = { ...this.queryStry};  
    const excludedFields = ['page', 'sort', 'limit' , 'fields' ];
    excludedFields.forEach(el => delete queryObj[el]);
    
    // advanced filtring 
    let  queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    // console.log(JSON.parse(queryStry));

    // let  query =Tour.find(JSON.parse(queryStry)); // inside {} find I can add some more filtring 
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
}


sort(){
    
    //Sorting by a property 
    if(this.queryStry.sort){
        const sortBy = this.queryStry.sort.split(',').join(' ');
        this.query = this.query.sort(sortBy);
      } 
      else{
        this.query = this.query.sort('-createdAt');
      }
      return this;

}


limitFields(){
    if(this.queryStry.fields){
        const  fields = this.queryStry.fields.split(',').join(' '); 
        this.query = this.query.select(fields);
     }
     else{
         this.query = this.query.select('-__v'); 
     }
    return this;
}


paginate(){

    const page = this.queryStry.page*1||1;  // to get default value  1
    const limit = this.queryStry.limit*1||100;
    const skip = (page-1)*limit; 
 
    //page=2$limit=10 1-10, page 1 / 11-20 page 2 / 21-30 page 3
   this.query = this.query.skip(skip).limit(limit);

   return this;

}

}

module.exports = APIFeatures;