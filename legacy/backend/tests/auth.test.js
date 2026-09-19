const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const authRoutes = require('../routes/auth');
const User = require('../models/User');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

let mongod;

describe('Authentication API', () => {
  jest.setTimeout(60000);

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
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

  it('should login with valid credentials', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'login@test.com', password: 'Strong!Password123' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'Strong!Password123' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should reject login with wrong password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'login2@test.com', password: 'Strong!Password123' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login2@test.com', password: 'WrongPassword!99' });

    expect(res.statusCode).toEqual(400);
    expect(res.body.msg).toBe('Invalid credentials');
  });
});
