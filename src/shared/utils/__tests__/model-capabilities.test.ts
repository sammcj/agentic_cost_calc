import { isModelAgenticCapable, getModelAgenticWarning } from '../modelConfig';

describe('Model Capabilities Tests', () => {
  describe('isModelAgenticCapable', () => {
    it('returns true for agentic-capable models', () => {
      expect(isModelAgenticCapable('claude_3_7_sonnet')).toBe(true);
      expect(isModelAgenticCapable('gemini_2_5_pro')).toBe(true);
    });

    it('returns false for non-agentic-capable models', () => {
      expect(isModelAgenticCapable('amazon_nova_lite')).toBe(false);
      expect(isModelAgenticCapable('claude_3_5_haiku')).toBe(false);
      expect(isModelAgenticCapable('amazon_nova_pro')).toBe(false);
    });

    it('returns false for non-existent models', () => {
      expect(isModelAgenticCapable('non_existent_model')).toBe(false);
    });
  });

  describe('getModelAgenticWarning', () => {
    it('returns undefined for agentic-capable models', () => {
      expect(getModelAgenticWarning('claude_3_7_sonnet')).toBeUndefined();
      expect(getModelAgenticWarning('gemini_2_5_pro')).toBeUndefined();
    });

    it('returns warning message for non-agentic-capable models', () => {
      expect(getModelAgenticWarning('amazon_nova_lite')).toBe(
        '>> Warning! Amazon Nova Lite is not capable of performing agentic coding tasks. Please select a different model for agentic development!'
      );
      expect(getModelAgenticWarning('amazon_nova_pro')).toBe(
        '>> Warning! Amazon Nova Pro is not capable of performing agentic coding tasks. Please select a different model for agentic development!'
      );
    });

    it('returns undefined for non-existent models', () => {
      expect(getModelAgenticWarning('non_existent_model')).toBe(
        '>> Warning! Non Existent Model is not capable of performing agentic coding tasks. Please select a different model for agentic development!'
      );
    });
  });
});
