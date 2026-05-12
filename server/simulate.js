require('dotenv').config();
const mongoose = require('mongoose');
const Reading = require('./models/Reading');

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Simulation: Connected to MongoDB Atlas');
  console.log('🚀 Starting simulation... (sending data every 5 seconds)');
  startSimulating();
})
.catch(err => console.error('❌ MongoDB Connection Error:', err));

function startSimulating() {
  const animals = [
    { id: 'tag01', name: 'Cow 007' },
    { id: 'tag02', name: 'Cow 008' },
    { id: 'tag03', name: 'Cow 009' }
  ];

  setInterval(async () => {
    const animal = animals[Math.floor(Math.random() * animals.length)];
    
    try {
      const newReading = new Reading({
        tagId: animal.id,
        animalName: animal.name,
        temperature: (37.5 + (Math.random() * 2 - 1)).toFixed(1),
        battery: Math.floor(70 + Math.random() * 30),
        latitude: -21.4123 + (Math.random() - 0.5) * 0.005,
        longitude: 28.0678 + (Math.random() - 0.5) * 0.005,
        status: Math.random() > 0.3 ? 'Moving' : 'Stationary',
        timestamp: new Date(),
      });

      await newReading.save();
      console.log(`💾 [SIM] Saved reading for ${animal.name} (${animal.id})`);
    } catch (err) {
      console.error('❌ Simulation Error:', err);
    }
  }, 3600000); // 1 hour interval
}
