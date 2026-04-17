const mongoose = require('mongoose')


const connectMongoDB = async (uri) => {
    await mongoose.connect(uri)
        .then(() => console.log("MongoDB Connected Successfully!"))
        .catch((err) => (`Something Went Wrong Connection Not Maded! ${err.message}`))
}

module.exports = connectMongoDB;