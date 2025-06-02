import express, { Request, Response, Router } from 'express';
import { calculateCosts } from '@/shared/utils/calculations';
import { templates, getTemplateById } from '@/shared/utils/projectTemplates';
import { CalculationRequestSchema } from '../validation/schemas';
import { ZodError } from 'zod';

const router: Router = express.Router();

// Get all templates
router.get('/templates', (_req: Request, res: Response) => {
  res.json(templates);
});

// Get template by ID
router.get('/templates/:id', (req: Request, res: Response) => {
  try {
    const template = getTemplateById(req.params.id);
    res.json(template);
  } catch (error) {
    res.status(404).json({ message: 'Template not found' + error});
  }
});

// Calculate costs
router.post('/calculate', (req: Request, res: Response) => {
  try {
    // Validate request body against schema
    const validatedRequest = CalculationRequestSchema.parse(req.body);

    // Perform calculation with validated data
    const result = calculateCosts(validatedRequest);

    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      // Format validation errors
      const validationErrors = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }));
      // Get the actual refinement error message if it exists
      const refinementError = error.errors.find(err => err.code === 'custom');
      res.status(400).json({
        message: refinementError?.message || 'Validation error',
        details: validationErrors.reduce((acc, curr) => ({
          ...acc,
          [curr.path]: curr.message
        }), {})
      });
    } else {
      console.error('Error during calculation:', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({ message });
    }
  }
});

export default router;
