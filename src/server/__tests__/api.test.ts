import request from 'supertest';
import express from 'express';
import cors from 'cors';
import apiRouter from '../routes/api';

const app = express();
app.use(express.json());
app.use(cors());
app.use('/api', apiRouter);

describe('API Routes', () => {
  describe('GET /api/templates', () => {
    it('should return all templates', async () => {
      const response = await request(app).get('/api/templates');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('description');
    });
  });

  describe('GET /api/templates/:id', () => {
    it('should return a specific template', async () => {
      const response = await request(app).get('/api/templates/small-project');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'small-project');
    });

    it('should return 404 for non-existent template', async () => {
      const response = await request(app).get('/api/templates/non-existent');
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/calculate', () => {
    const validRequest = {
      projectType: 'oneoff',
      globalParams: {
        currencyRate: 0.64,
        aiCapabilityFactor: 1.0,
        totalCostMultiplier: 1.0
      },
      modelConfig: {
        primaryModelId: 'claude_4_0_sonnet'
      },
      projectParams: {
        manualDevHours: 160,
        agenticMultiplier: 3.0,
        humanGuidanceTime: 8,
        outputTokenPercentage: 80,
        cachedTokenPercentage: 80,
        totalProjectTokens: 80000000,
        averageHourlyRate: 200
      }
    };

    it('should calculate costs for valid request', async () => {
      const response = await request(app)
        .post('/api/calculate')
        .send(validRequest);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('traditionalCost');
      expect(response.body).toHaveProperty('agenticCost');
      expect(response.body).toHaveProperty('savingsAnalysis');
      expect(response.body).toHaveProperty('visualisationData');
    });

    it('should validate request body', async () => {
      const invalidRequest = {
        ...validRequest,
        globalParams: {
          ...validRequest.globalParams,
          currencyRate: -1 // Invalid negative currency rate
        }
      };

      const response = await request(app)
        .post('/api/calculate')
        .send(invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Validation error');
      // Check for 'details' property which contains the specific validation errors
      expect(response.body).toHaveProperty('details');
      expect(typeof response.body.details).toBe('object');
    });

    it('should require project parameters for oneoff calculations', async () => {
      const invalidRequest = {
        ...validRequest,
        projectParams: undefined
      };

      const response = await request(app)
        .post('/api/calculate')
        .send(invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('required parameters');
    });

    it('should calculate ongoing costs with both team and product params', async () => {
      const ongoingRequest = {
        projectType: 'ongoing',
        globalParams: validRequest.globalParams,
        modelConfig: validRequest.modelConfig,
        teamParams: {
          numberOfDevs: 2,
          tokensPerDevPerDay: 5000000
        },
        productParams: {
          tokensPerDayOngoing: 10000000,
          numberOfApps: 1
        }
      };

      const response = await request(app)
        .post('/api/calculate')
        .send(ongoingRequest);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('dailyCosts');
      expect(response.body.dailyCosts).toHaveProperty('total');
      expect(response.body.dailyCosts).toHaveProperty('perDev');
    });

    it('should handle secondary model calculations', async () => {
      const requestWithSecondaryModel = {
        ...validRequest,
        modelConfig: {
          ...validRequest.modelConfig,
          secondaryModelId: 'claude_3_5_haiku',
          modelRatio: 0.7
        }
      };

      const response = await request(app)
        .post('/api/calculate')
        .send(requestWithSecondaryModel);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('agenticCost');
      expect(response.body).toHaveProperty('tokenUsage');
    });

    it('should allow product-only calculations with zero developers', async () => {
      const productOnlyRequest = {
        projectType: 'ongoing',
        globalParams: validRequest.globalParams,
        modelConfig: validRequest.modelConfig,
        teamParams: {
          numberOfDevs: 0,
          tokensPerDevPerDay: 0
        },
        productParams: {
          tokensPerDayOngoing: 1000000,
          numberOfApps: 1
        }
      };

      const response = await request(app)
        .post('/api/calculate')
        .send(productOnlyRequest);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('dailyCosts');
      expect(response.body.dailyCosts).toHaveProperty('total');
      expect(response.body.dailyCosts.perDev).toBeUndefined();
    });
  });
});
