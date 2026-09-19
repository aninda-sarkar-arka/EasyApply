const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const authRoutes = require('../routes/auth');
const applicationRoutes = require('../routes/applications');
const User = require('../models/User');
const Application = require('../models/Application');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);

let mongod;

describe('Feature: Dashboard / Application Management (ID: 22101588)', () => {
  let authToken = '';
  let appId = '';

  jest.setTimeout(60000);

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());

    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Dashboard Tester',
        email: 'dash_test_22101588@example.com',
        password: 'Strong!Password123',
      });

    authToken = regRes.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
  });

  // --- Case A: Positive Flow ---

  it('should create a new job application (Dashboard Entry)', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('x-auth-token', authToken)
      .send({
        company: 'Google',
        role: 'Frontend Engineer',
        status: 'applied',
        jobLink: 'https://google.com/jobs',
        salary: '$150k',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.company).toBe('Google');
    appId = res.body._id;
  });

  it('should retrieve all applications for the dashboard', async () => {
    const res = await request(app)
      .get('/api/applications')
      .set('x-auth-token', authToken);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].company).toBe('Google');
  });

  it('should retrieve a specific application by ID', async () => {
    const res = await request(app)
      .get(`/api/applications/${appId}`)
      .set('x-auth-token', authToken);

    expect(res.statusCode).toEqual(200);
    expect(res.body._id).toBe(appId);
    expect(res.body.role).toBe('Frontend Engineer');
  });

  it('should update an application status', async () => {
    const res = await request(app)
      .put(`/api/applications/${appId}`)
      .set('x-auth-token', authToken)
      .send({ status: 'interview' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe('interview');
    expect(res.body.activityLog.some((log) => log.action.includes('Status changed'))).toBe(true);
  });

  // --- Case B: Negative Flow ---

  it('should return 400 if a required field (company) is missing', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('x-auth-token', authToken)
      .send({ role: 'Intern', status: 'applied' });

    expect(res.statusCode).toEqual(400);
    expect(res.body.msg).toBeDefined();
  });

  it('should return 404 for a non-existent application ID', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/applications/${fakeId}`)
      .set('x-auth-token', authToken);

    expect(res.statusCode).toEqual(404);
    expect(res.body.msg).toBe('Application not found');
  });

  it("should return 401 when accessing another user's application", async () => {
    const otherUserRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Other User', email: 'other_22101588@example.com', password: 'Password!123' });
    const otherToken = otherUserRes.body.token;

    const res = await request(app)
      .get(`/api/applications/${appId}`)
      .set('x-auth-token', otherToken);

    expect(res.statusCode).toEqual(401);
    expect(res.body.msg).toBe('Not authorized');
  });

  // --- Case C: Security ---

  it('should return 401 if no token is provided', async () => {
    const res = await request(app).get('/api/applications');

    expect(res.statusCode).toEqual(401);
    expect(res.body.msg).toBe('No token, authorization denied');
  });

  it('should delete an application from the dashboard', async () => {
    const res = await request(app)
      .delete(`/api/applications/${appId}`)
      .set('x-auth-token', authToken);

    expect(res.statusCode).toEqual(200);
    expect(res.body.msg).toBe('Application removed');

    const checkRes = await request(app)
      .get(`/api/applications/${appId}`)
      .set('x-auth-token', authToken);
    expect(checkRes.statusCode).toEqual(404);
  });
});
