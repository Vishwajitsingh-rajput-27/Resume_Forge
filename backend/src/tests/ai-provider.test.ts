import axios from 'axios';
import { AIService } from '../services/ai-provider';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock axios.create to return an object with a post method
const mockPost = jest.fn();
mockedAxios.create.mockReturnValue({ post: mockPost } as never);

const groqSuccessResponse = {
  data: {
    choices: [{ message: { content: 'Improved content here' } }],
    usage: { total_tokens: 150 },
  },
};

describe('AIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AI_PROVIDER = 'GROQ';
    process.env.GROQ_API_KEY = 'gsk_test_key';
  });

  describe('improveSummary', () => {
    it('returns improved summary text', async () => {
      mockPost.mockResolvedValueOnce(groqSuccessResponse);
      const result = await AIService.improveSummary(
        'I work as a developer and do stuff',
        'Senior Software Engineer'
      );
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('calls Groq chat completions endpoint', async () => {
      mockPost.mockResolvedValueOnce(groqSuccessResponse);
      await AIService.improveSummary('summary text', 'Engineer');
      expect(mockPost).toHaveBeenCalledWith(
        '/chat/completions',
        expect.objectContaining({ model: expect.any(String), messages: expect.any(Array) })
      );
    });
  });

  describe('generateSkillSuggestions', () => {
    it('parses JSON array from AI response', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          choices: [{ message: { content: '["React","TypeScript","Node.js","REST APIs","GraphQL"]' } }],
          usage: { total_tokens: 50 },
        },
      });
      const skills = await AIService.generateSkillSuggestions('Web Development');
      expect(Array.isArray(skills)).toBe(true);
      expect(skills.length).toBeGreaterThan(0);
    });

    it('falls back gracefully on malformed JSON', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          choices: [{ message: { content: 'React, TypeScript, Node.js, MongoDB' } }],
          usage: { total_tokens: 20 },
        },
      });
      const skills = await AIService.generateSkillSuggestions('Web Development');
      expect(Array.isArray(skills)).toBe(true);
    });
  });

  describe('improveExperienceBullet', () => {
    it('returns a single improved bullet point', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          choices: [{ message: { content: 'Architected microservices system reducing API latency by 60%' } }],
          usage: { total_tokens: 40 },
        },
      });
      const result = await AIService.improveExperienceBullet('made APIs faster', 'Backend Engineer');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(10);
    });
  });

  describe('matchJobDescription', () => {
    it('parses job match JSON response', async () => {
      const matchJson = JSON.stringify({
        matchScore: 78,
        matchedSkills: ['React', 'TypeScript'],
        missingSkills: ['Kubernetes'],
        keywordGaps: ['microservices'],
        suggestions: ['Add Kubernetes experience'],
      });
      mockPost.mockResolvedValueOnce({
        data: {
          choices: [{ message: { content: matchJson } }],
          usage: { total_tokens: 200 },
        },
      });
      const result = await AIService.matchJobDescription('my resume text', 'job description text');
      expect(result).toHaveProperty('matchScore');
      expect(result.matchScore).toBe(78);
      expect(Array.isArray(result.matchedSkills)).toBe(true);
      expect(Array.isArray(result.missingSkills)).toBe(true);
    });

    it('throws on malformed JSON', async () => {
      mockPost.mockResolvedValueOnce({
        data: { choices: [{ message: { content: 'not json at all' } }], usage: { total_tokens: 5 } },
      });
      await expect(AIService.matchJobDescription('resume', 'jd')).rejects.toThrow();
    });
  });

  describe('ping', () => {
    it('returns ok:true when provider responds', async () => {
      mockPost.mockResolvedValueOnce({
        data: { choices: [{ message: { content: 'OK' } }], usage: { total_tokens: 2 } },
      });
      const result = await AIService.ping();
      expect(result.ok).toBe(true);
      expect(result.provider).toBe('GROQ');
      expect(typeof result.latencyMs).toBe('number');
    });

    it('returns ok:false when provider throws', async () => {
      mockPost.mockRejectedValueOnce(new Error('Network error'));
      const result = await AIService.ping();
      expect(result.ok).toBe(false);
    });
  });
});
