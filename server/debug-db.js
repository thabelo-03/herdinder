const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Alert = require('./models/Alert');
const User = require('./models/User');

dotenv.config();

const checkAlerts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    const users = await User.find({});
    console.log('Users in DB:', users.map(u => ({ id: u._id, email: u.email, role: u.role })));
    
    const alerts = await Alert.find({});
    console.log('Total Alerts in DB:', alerts.length);
    if (alerts.length > 0) {
      console.log('Sample Alert:', {
        id: alerts[0]._id,
        owner: alerts[0].owner,
        animalName: alerts[0].animalName,
        type: alerts[0].type
      });
    }
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkAlerts();
