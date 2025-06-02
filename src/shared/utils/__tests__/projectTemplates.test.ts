import { templates, getTemplateById } from '../projectTemplates';

describe('Project Templates', () => {
  describe('templates', () => {
    it('should have required fields for each template', () => {
      templates.forEach(template => {
        expect(template.id).toBeDefined();
        expect(template.name).toBeDefined();
        expect(template.description).toBeDefined();
        expect(template.examples).toBeDefined();
        expect(typeof template.examples).toBe('string');
      });
    });

    it('should have unique IDs', () => {
      const ids = templates.map(t => t.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it('should have valid project types', () => {
      const validTypes = ['oneoff', 'ongoing', 'both'];
      templates.forEach(template => {
        expect(validTypes).toContain(template.defaultValues.projectType);
      });
    });

    it('should have valid parameter ranges', () => {
      templates.forEach(template => {
        const { projectParams } = template.defaultValues;
        if (projectParams) {
          // Manual dev hours should be positive
          expect(projectParams.manualDevHours).toBeGreaterThan(0);

          // Agentic multiplier should be between 1 and 10
          expect(projectParams.agenticMultiplier).toBeGreaterThanOrEqual(1);
          expect(projectParams.agenticMultiplier).toBeLessThanOrEqual(10);

          // Token ratios should be percentages (0-100)
          expect(projectParams.outputTokenPercentage).toBeGreaterThanOrEqual(0);
          expect(projectParams.outputTokenPercentage).toBeLessThanOrEqual(100);
          expect(projectParams.cachedTokenPercentage).toBeGreaterThanOrEqual(0);
          expect(projectParams.cachedTokenPercentage).toBeLessThanOrEqual(100);

          // Total project tokens should be positive
          expect(projectParams.totalProjectTokens).toBeGreaterThan(0);

          // Hourly rate should be positive
          expect(projectParams.averageHourlyRate).toBeGreaterThan(0);
        }
      });
    });

    it('should have required fields for each project type', () => {
      templates.forEach(template => {
        const { projectType, projectParams, productParams, teamParams } = template.defaultValues;

        if (projectType === 'oneoff') {
          expect(projectParams).toBeDefined();
          expect(projectParams?.manualDevHours).toBeDefined();
          expect(projectParams?.agenticMultiplier).toBeDefined();
          expect(projectParams?.totalProjectTokens).toBeDefined();
        }

        if (projectType === 'ongoing') {
          if (productParams) {
            expect(productParams.tokensPerDayOngoing).toBeDefined();
          }
          if (teamParams) {
            expect(teamParams.tokensPerDevPerDay).toBeDefined();
          }
          expect(productParams || teamParams).toBeDefined();
        }
      });
    });
  });

  describe('getTemplateById', () => {
    it('should return correct template for valid ID', () => {
      const template = getTemplateById('small-project');
      expect(template).toBeDefined();
      expect(template.id).toBe('small-project');
    });

    it('should throw error for invalid ID', () => {
      expect(() => getTemplateById('invalid-id')).toThrow();
    });
  });
});
