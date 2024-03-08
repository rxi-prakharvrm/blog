const mongoose = require('mongoose');
const connectDB = async () => {
    try {
        /*
            This line tells the mongoose to set the strictQuery option to false. This means that queries executed via Mongoose will not strictly enforce the schema, and documents returned from queries may contain properties that are not defined in the schema.
        */
        mongoose.set('strictQuery', false);

        /* 
            This line makes a connection to the MongoDB database using the MONGODB_URI environment variable. The MONGODB_URI environment variable is set in the .env file and contains the connection string to the MongoDB database.
        */
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        /* 
            This line logs a message to the console if the connection to the MongoDB database is successful. The message contains the host of the MongoDB database that the connection was made to.
        */
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch(error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

module.exports = connectDB;