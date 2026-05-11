const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const authRoutes = require('../routes/auth');
const applicationRoutes = require('../routes/applications');
const User = require('../models/User');
const Application = require('../models/Application');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);

describe('Feature: Dashboard / Application Management (ID: 22101588)', () => {
  let authToken = '';
  let appId = '';

  // Increase timeout for DB operations
  jest.setTimeout(30000);

  beforeAll(async () => {
    // Connect to test database using MONGO_URI from .env
    let testUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/easyapply_test_dashboard';
    if (testUri.includes('?')) {
      testUri = testUri.replace('/EasyApply?', '/EasyApply_test_dash?');
    } else if (testUri.endsWith('/EasyApply')) {
      testUri = testUri.replace('/EasyApply', '/EasyApply_test_dash');
    } else {
      testUri += '_dash';
    }

    await mongoose.connect(testUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Programmatic Auth: Register a new user
    const userData = {
      name: 'Dashboard Tester',
      email: 'dash_test_22101588@example.com',
      password: 'Strong!Password123'
    };

    const regRes = await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    authToken = regRes.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  // --- Case A: Positive Flow (Happy Path) ---

  it('should create a new job application (Dashboard Entry)', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('x-auth-token', authToken)
      .send({
        company: 'Google',
        role: 'Frontend Engineer',
        status: 'applied',
        jobLink: 'https://google.com/jobs',
        salary: '$150k'
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
      .send({
        status: 'interview'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe('interview');
    // Verify activity log was updated
    expect(res.body.activityLog.some(log => log.action.includes('Status changed'))).toBe(true);
  });

  // --- Case B: Negative Flow (Error Handling) ---

  it('should return 400 if a required field (company) is missing (Validation Error)', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('x-auth-token', authToken)
      .send({
        role: 'Intern',
        status: 'applied'
      });

    // Note: The controller must handle validation to return 400
    // If it currently returns 500 on DB error, we should verify what it does
    expect(res.statusCode).toEqual(400);
    expect(res.body.msg).toBeDefined();
  });

  it('should return 404 for a non-existent application ID (Resource Not Found)', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/applications/${fakeId}`)
      .set('x-auth-token', authToken);

    expect(res.statusCode).toEqual(404);
    expect(res.body.msg).toBe('Application not found');
  });

  it('should return 401 when trying to access another user\'s application', async () => {
    // Create another user to get another token
    const otherUserRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Other User',
        email: 'other_22101588@example.com',
        password: 'Password!123'
      });
    const otherToken = otherUserRes.body.token;

    // Try to access the first user's application with the second user's token
    const res = await request(app)
      .get(`/api/applications/${appId}`)
      .set('x-auth-token', otherToken);

    expect(res.statusCode).toEqual(401);
    expect(res.body.msg).toBe('Not authorized');
  });

  // --- Case C: Security & Boundary ---

  it('should return 401 if no token is provided', async () => {
    const res = await request(app)
      .get('/api/applications');

    expect(res.statusCode).toEqual(401);
    expect(res.body.msg).toBe('No token, authorization denied');
  });

  // Final Cleanup
  it('should delete an application from the dashboard', async () => {
    const res = await request(app)
      .delete(`/api/applications/${appId}`)
      .set('x-auth-token', authToken);

    expect(res.statusCode).toEqual(200);
    expect(res.body.msg).toBe('Application removed');

    // Verify deletion
    const checkRes = await request(app)
      .get(`/api/applications/${appId}`)
      .set('x-auth-token', authToken);
    expect(checkRes.statusCode).toEqual(404);
  });
});
