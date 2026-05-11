const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const authRoutes = require('../routes/auth');
const User = require('../models/User');

const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Authentication API', () => {
  // Increase timeout to 30 seconds to allow DB connection safely (especially for cloud)
  jest.setTimeout(30000);

  beforeAll(async () => {
    let testUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/easyapply_test';
    if (testUri.includes('?')) {
      testUri = testUri.replace('/EasyApply?', '/EasyApply_test_auth?');
    } else if (testUri.endsWith('/EasyApply')) {
      testUri = testUri.replace('/EasyApply', '/EasyApply_test_auth');
    } else {
      testUri += '_auth';
    }

    await mongoose.connect(testUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany();
  });

  it('should reject a weak password that is too short', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'short' });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body.msg).toContain('more than 8 characters');
  });

  it('should reject a password without a special character', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'longpassword' });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body.msg).toContain('special character');
  });

  it('should reject a password without a lowercase character', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'LONGPASSWORD!1' });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body.msg).toContain('lowercase letter');
  });

  it('should register successfully with a strong password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'strong@test.com', password: 'Strong!Password123' });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });
});
