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
    name: 'Tendai Moyo',
    email: 'tendai@farm.co.zw',
    password: 'password123',
    phone: '+263 77 123 4567',
    role: 'client',
    subscription: {
      plan: 'enterprise',
      tagCount: 450,
      pricePerTag: 0.50,
      currency: 'USD',
      status: 'active',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2026-01-01'),
    }
  },
  {
    name: 'John Smith',
    email: 'jsmith@cattle.zw',
    password: 'password123',
    phone: '+263 71 987 6543',
    role: 'client',
    subscription: {
      plan: 'standard',
      tagCount: 50,
      pricePerTag: 0.75,
      currency: 'USD',
      status: 'active',
      startDate: new Date('2025-03-15'),
      endDate: new Date('2026-03-15'),
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
  {
    name: 'Cow 007',
    category: 'cattle',
    deviceType: 'ear_tag',
    herdName: 'Herd A',
    tagId: '2026013033030880',
    temperature: 37.8,
    battery: 85,
    status: 'Moving',
    latitude: -21.408,
    longitude: 28.069,
  },
  {
    name: 'Cow 015',
    category: 'cattle',
    deviceType: 'ear_tag',
    herdName: 'Herd A',
    tagId: 'HF-000015',
    temperature: 32.7,
    battery: 92,
    status: 'Stationary',
    latitude: -21.401,
    longitude: 28.059,
  },
  {
    name: 'Bike 01',
    category: 'motorbike',
    deviceType: 'dragino_tracker',
    herdName: 'Fleet 1',
    tagId: 'DT-000001',
    battery: 88,
    status: 'Parked',
    latitude: -21.413,
    longitude: 28.082,
    make: 'Honda',
    model: 'CG125',
    plateNumber: 'ABZ 1234',
  },
  {
    name: 'Truck 01',
    category: 'vehicle',
    deviceType: 'dragino_tracker',
    herdName: 'Fleet 1',
    tagId: 'DT-000003',
    battery: 95,
    status: 'Parked',
    latitude: -21.415,
    longitude: 28.054,
    make: 'Toyota',
    model: 'Hilux',
    plateNumber: 'ABZ 9012',
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Asset.deleteMany({});
    await Reading.deleteMany({});
    await Alert.deleteMany({});
    await Report.deleteMany({});
    console.log('Cleared existing data');

    // Create Users
    const createdUsers = [];
    for (const user of mockUsers) {
      const newUser = await User.create(user);
      createdUsers.push(newUser);
    }
    console.log(`Created ${createdUsers.length} users`);

    const tendai = createdUsers.find(u => u.email === 'tendai@farm.co.zw');
    const john = createdUsers.find(u => u.email === 'jsmith@cattle.zw');

    // Create Assets and link to users
    const assetsToCreate = mockAnimals.map((animal, index) => {
      // Assign first 2 to Tendai, next 2 to John
      const owner = index < 2 ? tendai._id : john._id;
      return { ...animal, owner };
    });

    const createdAssets = await Asset.insertMany(assetsToCreate);
    console.log(`Created ${createdAssets.length} assets linked to users`);

    // Create mock Readings for each asset
    const readingsToCreate = [];
    for (const asset of createdAssets) {
      // Create 5 historical readings for each asset
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
          timestamp: new Date(Date.now() - i * 3600000), // 1 hour apart
        });
      }
    }

    await Reading.insertMany(readingsToCreate);
    console.log(`Created ${readingsToCreate.length} readings`);

    // Create Alerts
    const alertsToCreate = createdAssets.map((asset, index) => ({
      assetId: asset._id,
      owner: asset.owner,
      animalName: asset.name,
      assetCategory: asset.category,
      type: index % 2 === 0 ? 'HIGH_TEMPERATURE' : 'LEFT_SAFE_ZONE',
      message: index % 2 === 0 ? `${asset.name} has high temperature` : `${asset.name} left the safe zone`,
      severity: index % 2 === 0 ? 'critical' : 'warning',
      read: false,
      createdAt: new Date(Date.now() - Math.random() * 86400000),
    }));
    await Alert.insertMany(alertsToCreate);
    console.log(`Created ${alertsToCreate.length} alerts linked to assets and users`);

    // Create Reports
    const reportsToCreate = [
      {
        owner: tendai._id,
        title: 'Weekly Herd Health Summary',
        type: 'health',
        status: 'completed',
        createdAt: new Date(Date.now() - 2 * 86400000),
      },
      {
        owner: john._id,
        title: 'Monthly Activity Report',
        type: 'activity',
        status: 'completed',
        createdAt: new Date(Date.now() - 5 * 86400000),
      }
    ];
    await Report.insertMany(reportsToCreate);
    console.log(`Created ${reportsToCreate.length} reports linked to users`);

    console.log('Database seeding completed successfully');
    process.exit();
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDB();
