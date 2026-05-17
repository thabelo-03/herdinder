const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Asset = require('./models/Asset');
const Reading = require('./models/Reading');
const Alert = require('./models/Alert');
const Report = require('./models/Report');

dotenv.config();

const mockUsers = [
  {
    name: 'Fortune Cookie',
    email: 'fortuemoney@gmail.com',
    password: 'password123',
    phone: '+263 77 123 4567',
    role: 'client',
    subscription: {
      plan: 'enterprise',
      tagCount: 450,
      pricePerTag: 10.00,
      currency: 'ZAR',
      status: 'active',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2026-01-01'),
    }
  },
  {
    name: 'John Smith',
    email: 'thabz@gmail.com',
    password: 'password123',
    phone: '+263 71 987 6543',
    role: 'client',
    subscription: {
      plan: 'standard',
      tagCount: 50,
      pricePerTag: 15.00,
      currency: 'ZAR',
      status: 'active',
      startDate: new Date('2025-03-15'),
      endDate: new Date('2026-03-15'),
    }
  },
  {
    name: 'Mary Gumbo',
    email: 'mary@gumbofarm.com',
    password: 'password123',
    phone: '+263 78 555 0199',
    role: 'client',
    subscription: {
      plan: 'community',
      tagCount: 15,
      pricePerTag: 0,
      currency: 'ZAR',
      status: 'active',
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-06-01'),
    }
  },
  {
    name: 'David Ndlovu',
    email: 'david@veld.io',
    password: 'password123',
    phone: '+263 73 333 4444',
    role: 'client',
    subscription: {
      plan: 'starter',
      tagCount: 10,
      pricePerTag: 20.00,
      currency: 'ZAR',
      status: 'expired',
      startDate: new Date('2024-05-10'),
      endDate: new Date('2025-05-10'),
    }
  },
  {
    name: 'Admin User',
    email: 'admin@herdfinder.com',
    password: 'adminpassword',
    phone: '+263 00 000 0000',
    role: 'admin',
  }
];

const mockAnimals = [
  { name: 'Cow 007', category: 'cattle', deviceType: 'ear_tag', herdName: 'Herd A', tagId: '2026013033030880', temperature: 37.8, battery: 85, status: 'Moving', latitude: -21.408, longitude: 28.069 },
  { name: 'Cow 015', category: 'cattle', deviceType: 'ear_tag', herdName: 'Herd A', tagId: 'HF-000015', temperature: 32.7, battery: 92, status: 'Stationary', latitude: -21.401, longitude: 28.059 },
  { name: 'Cow 003', category: 'cattle', deviceType: 'ear_tag', herdName: 'Herd B', tagId: 'HF-000003', temperature: 36.5, battery: 78, status: 'Moving', latitude: -21.428, longitude: 28.079 },
  { name: 'Cow 012', category: 'cattle', deviceType: 'ear_tag', herdName: 'Herd A', tagId: 'HF-000012', temperature: 36.6, battery: 10, status: 'Stationary', latitude: -21.414, longitude: 28.076 },
  { name: 'Cow 009', category: 'cattle', deviceType: 'ear_tag', herdName: 'Herd B', tagId: 'HF-000009', temperature: 37.2, battery: 65, status: 'Moving', latitude: -21.424, longitude: 28.061 },
  { name: 'Bike 01', category: 'motorbike', deviceType: 'dragino_tracker', herdName: 'Fleet 1', tagId: 'DT-000001', battery: 88, status: 'Parked', latitude: -21.413, longitude: 28.082, make: 'Honda', model: 'CG125', plateNumber: 'ABZ 1234' },
  { name: 'Bike 02', category: 'motorbike', deviceType: 'dragino_tracker', herdName: 'Fleet 1', tagId: 'DT-000002', battery: 72, status: 'Moving', latitude: -21.431, longitude: 28.072, make: 'Yamaha', model: 'DT125', plateNumber: 'ABZ 5678' },
  { name: 'Truck 01', category: 'vehicle', deviceType: 'dragino_tracker', herdName: 'Fleet 1', tagId: 'DT-000003', battery: 95, status: 'Parked', latitude: -21.415, longitude: 28.054, make: 'Toyota', model: 'Hilux', plateNumber: 'ABZ 9012' },
  { name: 'Cow 101', category: 'cattle', deviceType: 'ear_tag', herdName: 'Herd B', tagId: 'HF-000101', temperature: 36.9, battery: 90, status: 'Stationary', latitude: -21.366, longitude: 28.114 },
  { name: 'Cow 042', category: 'cattle', deviceType: 'ear_tag', herdName: 'Herd A', tagId: 'HF-000042', temperature: 40.2, battery: 82, status: 'Stationary', latitude: -21.414, longitude: 28.061 },
  { name: 'Bike 04', category: 'motorbike', deviceType: 'dragino_tracker', herdName: 'Fleet 1', tagId: 'DT-000004', battery: 98, status: 'Moving', latitude: -21.536, longitude: 28.144, make: 'KTM', model: 'EXC 300', plateNumber: 'ABZ 7777' },

  // --- NEW SCENARIOS (20+ Total) ---
  // High Temp Critical
  { name: 'Cow 201', category: 'cattle', deviceType: 'ear_tag', herdName: 'Herd A', tagId: 'HF-000201', temperature: 41.5, battery: 80, status: 'Stationary', latitude: -21.410, longitude: 28.065 },
  { name: 'Cow 202', category: 'cattle', deviceType: 'ear_tag', herdName: 'Herd B', tagId: 'HF-000202', temperature: 40.8, battery: 45, status: 'Moving', latitude: -21.412, longitude: 28.068 },
  
  // Outside Safe Zone
  { name: 'Cow 301', category: 'cattle', deviceType: 'ear_tag', herdName: 'Herd A', tagId: 'HF-000301', temperature: 37.5, battery: 60, status: 'Moving', latitude: -21.480, longitude: 28.150 },
  { name: 'Cow 302', category: 'cattle', deviceType: 'ear_tag', herdName: 'Herd C', tagId: 'HF-000302', temperature: 38.1, battery: 90, status: 'Moving', latitude: -21.520, longitude: 28.180 },
  
  // Low Battery
  { name: 'Cow 401', category: 'cattle', deviceType: 'ear_tag', herdName: 'Herd B', tagId: 'HF-000401', temperature: 36.8, battery: 4, status: 'Stationary', latitude: -21.418, longitude: 28.062 },
  { name: 'Bike 05', category: 'motorbike', deviceType: 'dragino_tracker', herdName: 'Fleet 1', tagId: 'DT-000005', battery: 2, status: 'Parked', latitude: -21.411, longitude: 28.077, make: 'Lifan', model: 'LF125', plateNumber: 'ABZ 8888' },
  
  // Speeding Motorbikes
  { name: 'Bike 06', category: 'motorbike', deviceType: 'dragino_tracker', herdName: 'Fleet 1', tagId: 'DT-000006', battery: 85, status: 'Moving', latitude: -21.450, longitude: 28.100, make: 'Suzuki', model: 'GN125', plateNumber: 'ABZ 9999', speed: 95 },
  { name: 'Bike 07', category: 'motorbike', deviceType: 'dragino_tracker', herdName: 'Fleet 2', tagId: 'DT-000007', battery: 77, status: 'Moving', latitude: -21.480, longitude: 28.120, make: 'Kawasaki', model: 'KLX150', plateNumber: 'ABZ 1111', speed: 110 },
  
  // Tamper / Theft
  { name: 'Bike 08', category: 'motorbike', deviceType: 'dragino_tracker', herdName: 'Fleet 2', tagId: 'DT-000008', battery: 92, status: 'Moving', latitude: -21.405, longitude: 28.055, make: 'Yamaha', model: 'Crux', plateNumber: 'ABZ 2222', tamperDetected: true, buzzerEnabled: true },
  { name: 'Truck 02', category: 'vehicle', deviceType: 'dragino_tracker', herdName: 'Fleet 1', tagId: 'DT-000009', battery: 60, status: 'Moving', latitude: -21.390, longitude: 28.040, make: 'Nissan', model: 'NP200', plateNumber: 'ABZ 3333', tamperDetected: true },
  
  // Sick Cattle (Hypothermia / Offline)
  { name: 'Cow 501', category: 'cattle', deviceType: 'ear_tag', herdName: 'Herd C', tagId: 'HF-000501', temperature: 34.2, battery: 55, status: 'Stationary', latitude: -21.422, longitude: 28.072 },
  { name: 'Cow 502', category: 'cattle', deviceType: 'ear_tag', herdName: 'Herd A', tagId: 'HF-000502', temperature: 35.0, battery: 0, status: 'Offline', latitude: -21.415, longitude: 28.060 },
  
  // General healthy ones
  { name: 'Cow 601', category: 'cattle', deviceType: 'ear_tag', herdName: 'Herd C', tagId: 'HF-000601', temperature: 37.0, battery: 88, status: 'Moving', latitude: -21.420, longitude: 28.070 },
  { name: 'Cow 602', category: 'cattle', deviceType: 'ear_tag', herdName: 'Herd B', tagId: 'HF-000602', temperature: 37.2, battery: 79, status: 'Stationary', latitude: -21.419, longitude: 28.069 },
  { name: 'Cow 603', category: 'cattle', deviceType: 'ear_tag', herdName: 'Herd A', tagId: 'HF-000603', temperature: 37.4, battery: 95, status: 'Moving', latitude: -21.418, longitude: 28.068 },
  { name: 'Cow 604', category: 'cattle', deviceType: 'ear_tag', herdName: 'Herd C', tagId: 'HF-000604', temperature: 37.1, battery: 82, status: 'Stationary', latitude: -21.417, longitude: 28.067 },
  { name: 'Bike 09', category: 'motorbike', deviceType: 'dragino_tracker', herdName: 'Fleet 2', tagId: 'DT-000010', battery: 100, status: 'Parked', latitude: -21.410, longitude: 28.080, make: 'Honda', model: 'TVS', plateNumber: 'ABZ 4444' },
  { name: 'Truck 03', category: 'vehicle', deviceType: 'dragino_tracker', herdName: 'Fleet 1', tagId: 'DT-000011', battery: 90, status: 'Parked', latitude: -21.400, longitude: 28.050, make: 'Isuzu', model: 'KB250', plateNumber: 'ABZ 5555' },
  { name: 'Cow 701', category: 'cattle', deviceType: 'ear_tag', herdName: 'Herd A', tagId: 'HF-000701', temperature: 37.6, battery: 70, status: 'Moving', latitude: -21.416, longitude: 28.066 },
  { name: 'Cow 702', category: 'cattle', deviceType: 'ear_tag', herdName: 'Herd B', tagId: 'HF-000702', temperature: 37.3, battery: 88, status: 'Stationary', latitude: -21.415, longitude: 28.065 }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Asset.deleteMany({});
    await Reading.deleteMany({});
    await Alert.deleteMany({});
    await Report.deleteMany({});
    console.log('Cleared existing data');

    const createdUsers = [];
    for (const user of mockUsers) {
      const newUser = await User.create(user);
      createdUsers.push(newUser);
    }
    console.log(`Created ${createdUsers.length} users`);

    const fortune = createdUsers.find(u => u.email === 'fortuemoney@gmail.com');
    const john = createdUsers.find(u => u.email === 'thabz@gmail.com');
    const mary = createdUsers.find(u => u.email === 'mary@gumbofarm.com');
    const david = createdUsers.find(u => u.email === 'david@veld.io');

    const assetsToCreate = mockAnimals.map((animal, index) => {
      // Distribute assets (Give Fortune most of them for testing)
      let owner;
      if (index < 25) owner = fortune._id;
      else if (index < 28) owner = john._id;
      else if (index < 30) owner = mary._id;
      else owner = david._id;
      return { ...animal, owner };
    });

    const createdAssets = await Asset.insertMany(assetsToCreate);
    console.log(`Created ${createdAssets.length} assets linked to users`);

    const readingsToCreate = [];
    for (const asset of createdAssets) {
      for (let i = 0; i < 5; i++) {
        readingsToCreate.push({
          assetId: asset._id,
          tagId: asset.tagId,
          animalName: asset.name,
          temperature: (asset.temperature || 36) + (Math.random() - 0.5) * 2,
          battery: (asset.battery || 80) - i,
          latitude: asset.latitude + (Math.random() - 0.5) * 0.01,
          longitude: asset.longitude + (Math.random() - 0.5) * 0.01,
          status: asset.status,
          timestamp: new Date(Date.now() - i * 3600000),
        });
      }
    }
    await Reading.insertMany(readingsToCreate);
    console.log(`Created ${readingsToCreate.length} readings`);

    const alertsToCreate = createdAssets.map((asset) => {
      let type, message, severity;
      if (asset.temperature > 40) {
        type = 'HIGH_TEMPERATURE';
        message = `${asset.name} has critical fever (${asset.temperature}°C)`;
        severity = 'critical';
      } else if (asset.latitude < -21.45 || asset.latitude > -21.35) {
        type = 'LEFT_SAFE_ZONE';
        message = `${asset.name} has exited the safe boundary`;
        severity = 'warning';
      } else if (asset.battery < 5) {
        type = 'LOW_BATTERY';
        message = `${asset.name} battery is critically low (${asset.battery}%)`;
        severity = 'critical';
      } else if (asset.tamperDetected) {
        type = 'THEFT_ALERT';
        message = `Tamper detected on ${asset.name}!`;
        severity = 'critical';
      } else if (asset.speed > 90) {
        type = 'SPEEDING';
        message = `${asset.name} is speeding (${asset.speed} km/h)`;
        severity = 'warning';
      } else {
        return null; // Skip healthy assets
      }

      return {
        assetId: asset._id,
        owner: asset.owner,
        animalName: asset.name,
        assetCategory: asset.category,
        type,
        message,
        severity,
        read: false,
        createdAt: new Date(Date.now() - Math.random() * 86400000),
      };
    }).filter(a => a !== null);

    await Alert.insertMany(alertsToCreate);
    console.log(`Created ${alertsToCreate.length} alerts`);

    const reportsToCreate = createdUsers.filter(u => u.role === 'client').map(user => ({
      owner: user._id,
      title: `${user.name} Weekly Summary`,
      type: 'health',
      status: 'completed',
      createdAt: new Date(Date.now() - 2 * 86400000),
    }));
    await Report.insertMany(reportsToCreate);
    console.log(`Created ${reportsToCreate.length} reports`);

    console.log('Database seeding completed successfully');
    process.exit();
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDB();
