const mongoose = require('mongoose');
require('dotenv').config();

// Mask password for logging
const maskedUri = process.env.MONGODB_URI.replace(/:([^@]+)@/, ':****@');
console.log(`🔍 Debugging connection to: ${maskedUri}`);

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
})
.then(() => {
  console.log('✅ SUCCESS: Connection established!');
  process.exit(0);
})
.catch(err => {
  console.error('❌ CONNECTION ERROR DETAILS:');
  console.error(`- Name: ${err.name}`);
  console.error(`- Code: ${err.code}`);
  console.error(`- Message: ${err.message}`);
  
  if (err.message.includes('bad auth')) {
    console.log('\n💡 TROUBLESHOOTING TIP:');
    console.log('1. Go to "Database Access" in Atlas.');
    console.log('2. Find "fortuemoney_db_user".');
    console.log('3. Click "Edit" and then "Edit Password".');
    console.log('4. Set it to "bZQ26EsS6JW1o4bq" and click "Update User".');
    console.log('5. Wait 30 seconds for the change to propagate.');
  }
  
  process.exit(1);
});
