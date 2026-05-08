require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  console.log('Cleared users');



  
  const users = await User.create([
    {
      name: 'Priya Sharma',
      email: 'priya@test.com',
      phone: '9876543210',
      password: 'Test@1234',
      role: 'woman',
      location: { type: 'Point', coordinates: [77.3178, 28.4089] }, // Faridabad
    },
    {
      name: 'Neha Gupta',
      email: 'neha@test.com',
      phone: '9876543211',
      password: 'Test@1234',
      role: 'woman',
      location: { type: 'Point', coordinates: [77.3278, 28.4189] },
    },
    {
      name: 'Rahul Sharma',
      email: 'rahul@test.com',
      phone: '9876543212',
      password: 'Test@1234',
      role: 'volunteer',
      isActive: true,
      location: { type: 'Point', coordinates: [77.3200, 28.4100] }, // ~200m away
      totalAlertsHelped: 12,
      averageRating: 4.8,
    },
    {
      name: 'Amit Kumar',
      email: 'amit@test.com',
      phone: '9876543213',
      password: 'Test@1234',
      role: 'volunteer',
      isActive: true,
      location: { type: 'Point', coordinates: [77.3300, 28.4200] },
      totalAlertsHelped: 5,
      averageRating: 4.5,
    },
    {
      name: 'Vijay Singh',
      email: 'vijay@test.com',
      phone: '9876543214',
      password: 'Test@1234',
      role: 'volunteer',
      isActive: false,
      location: { type: 'Point', coordinates: [77.3400, 28.4300] },
      totalAlertsHelped: 20,
      averageRating: 4.9,
    },
  ]);

  console.log(`✅ Seeded ${users.length} users`);
  console.log('\nTest credentials:');
  console.log('  Woman:     priya@test.com    / Test@1234');
  console.log('  Volunteer: rahul@test.com    / Test@1234');
  console.log('  Volunteer: amit@test.com     / Test@1234');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
