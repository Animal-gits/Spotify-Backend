const mongoose = require('mongoose')

async function connectDB() {

    try{
        console.log(process.env.MONGO_URI)
        const conn = await mongoose.connect(process.env.MONGO_URI  ,{
            dbName : "apna_music"
        })

        console.log('MongoDB Connection Host !! :' , conn.connection.host);
        
    }
    catch(error){
        console.error('Databse Connection error', error?.message)
        process.exit(1)
    }
    
} 

module.exports = connectDB;