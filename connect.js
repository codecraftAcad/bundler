const mongoose = require('mongoose')
const dotenv = require('dotenv').config()



const connectDB = async ()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(conn.connection.id)
    } catch (error) {
        console.log(error)
    }
}


module.exports = connectDB