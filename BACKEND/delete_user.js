const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const emailToDelete = process.argv[2];

if (!emailToDelete) {
    console.error("Please provide an email to delete. Example: node delete_user.js shriyanshmgs235@gmail.com");
    process.exit(1);
}

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("MONGO_URI not found in environment variables.");
    process.exit(1);
}

async function run() {
    try {
        console.log(`Connecting to MongoDB...`);
        await mongoose.connect(MONGO_URI);
        console.log(`Connected successfully.`);

        // Find and delete the user
        const UserSchema = new mongoose.Schema({}, { strict: false });
        const User = mongoose.model('User', UserSchema, 'users'); // collection name defaults to pluralized model name

        console.log(`Searching for user with email: ${emailToDelete}...`);
        const result = await User.deleteOne({ email: emailToDelete });

        if (result.deletedCount > 0) {
            console.log(`SUCCESS: User with email "${emailToDelete}" was successfully deleted from the database.`);
        } else {
            console.log(`INFO: No user found with email "${emailToDelete}".`);
        }

    } catch (err) {
        console.error("ERROR deleting user:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

run();
