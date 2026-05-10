require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const errorHandler = require('./middleware/errorHandler');
const User = require('./models/User');
const getRedisClient = require('./config/redis');

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost,http://localhost:8080')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/api/health', async (req, res) => {
  let redis = 'down';
  try {
    const redisClient = getRedisClient();
    const pong = await redisClient.ping();
    if (pong === 'PONG') redis = 'up';
  } catch (error) {
    redis = 'down';
  }

  res.json({
    status: 'ok',
    service: 'photosphere-api',
    pid: process.pid,
    redis
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use(errorHandler);

const seedUsers = async () => {
  const users = [
    {
      name: 'Default Creator',
      email: process.env.SEED_CREATOR_EMAIL || 'creator@photosphere.local',
      password: process.env.SEED_CREATOR_PASSWORD || 'password123',
      role: 'creator'
    },
    {
      name: 'Default Consumer',
      email: process.env.SEED_CONSUMER_EMAIL || 'consumer@photosphere.local',
      password: process.env.SEED_CONSUMER_PASSWORD || 'password123',
      role: 'consumer'
    }
  ];

  for (const userData of users) {
    const exists = await User.findOne({ email: userData.email.toLowerCase() });
    if (!exists) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await User.create({
        name: userData.name,
        email: userData.email.toLowerCase(),
        password: hashedPassword,
        role: userData.role
      });
      console.log(`Seeded ${userData.role}: ${userData.email}`);
    }
  }
};

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    getRedisClient();
    await seedUsers();
    app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
})();
