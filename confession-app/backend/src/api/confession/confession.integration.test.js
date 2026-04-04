import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { connectTestDB, closeTestDB, clearTestDB } from '../../utils/testSetup.js';
import env from '../../config/env.js';

describe('Confession API Integration Tests', () => {
  beforeAll(async () => {
    // Setup in-memory DB
    await connectTestDB();
    // Provide a mocked device secret if it is missing
    env.DEVICE_ID_SECRET = 'super-secret-test-key';
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('Server and Database Basics', () => {
    it('should confirm server is running via health check', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });

    it('should fail health check if required secret is provided incorrectly', async () => {
      const originalHealthSecret = env.HEALTH_SECRET;
      env.HEALTH_SECRET = 'required-secret';
      
      const response = await request(app).get('/health');
      expect(response.status).toBe(401);
      
      const authorizedResponse = await request(app)
        .get('/health')
        .set('x-health-secret', 'required-secret');
      expect(authorizedResponse.status).toBe(200);

      env.HEALTH_SECRET = originalHealthSecret;
    });
  });

  describe('Post, Like, Reaction workflows', () => {
    let createdPostId;
    const deviceId = 'test-mock-device-id-123';

    it('should create a new confession post', async () => {
      const response = await request(app)
        .post('/api/confessions/add')
        .set('x-device-id', deviceId)
        .send({
          text: 'This is an automated test confession for integration testing.',
          type: 'deep'
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.text).toContain('automated test');
      expect(response.body.data.type).toBe('deep');
      
      createdPostId = response.body.data._id;
    });

    it('should like a confession post', async () => {
      // 1. Create a post
      const createRes = await request(app)
        .post('/api/confessions/add')
        .set('x-device-id', deviceId)
        .send({ text: 'Test post for liking', type: 'funny' });
      const postId = createRes.body.data._id;

      // 2. Like the post
      const likeRes = await request(app)
        .post(`/api/confessions/like/${postId}`)
        .set('x-device-id', 'another-device-id');
      
      expect(likeRes.status).toBe(200);
      expect(likeRes.body.data.likes).toBe(1);
      expect(likeRes.body.data.userVote).toBe('like');
    });

    it('should react to a confession post', async () => {
      // 1. Create a post
      const createRes = await request(app)
        .post('/api/confessions/add')
        .set('x-device-id', deviceId)
        .send({ text: 'Test post for reactions', type: 'secret' });
      const postId = createRes.body.data._id;

      // 2. React to the post
      const reactRes = await request(app)
        .post(`/api/confessions/react/${postId}`)
        .set('x-device-id', 'reactor-device-id')
        .send({ type: 'reaction', reactionValue: 'relatable' });
      
      expect(reactRes.status).toBe(200);
      expect(reactRes.body.data.reactions.relatable).toBe(1);
      expect(reactRes.body.data.userReaction).toBe('relatable');
    });

    it('should retrieve a feed including the new post', async () => {
      await request(app)
        .post('/api/confessions/add')
        .set('x-device-id', deviceId)
        .send({ text: 'Post specifically to test feed', type: 'general' });

      const feedRes = await request(app).get('/api/confessions');
      
      expect(feedRes.status).toBe(200);
      expect(feedRes.body.data.length).toBeGreaterThan(0);
      expect(feedRes.body.data[0].text).toBe('Post specifically to test feed');
    });
  });
});
