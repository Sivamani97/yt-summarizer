const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

console.log('Attempting to connect to:', process.env.MONGODB_URI.replace(/:([^@]+)@/, ':****@'));

mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
})
.then(() => {
    console.log('✅ Connection successful!');
    process.exit(0);
})
.catch(err => {
    console.error('❌ Connection failed:');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    if (err.reason) {
        console.error('Reason:', JSON.stringify(err.reason, null, 2));
    }
    process.exit(1);
});
