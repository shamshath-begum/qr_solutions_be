const mongoose=require('mongoose')

const TrainingSchema=new mongoose.Schema({
    Name:{type:String,required:true},
    
    timing:{type:String,required:true},
    status:{type:String,required:true},

    
    
    createdAt:{type:Date,default:Date.now()}
},{versionKey:false,collection:"training"})
const TrainingModel=mongoose.model('training',TrainingSchema)
module.exports={TrainingModel}


