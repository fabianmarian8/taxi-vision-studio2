/**
 * Admin Login API Tests
 *
 * Tests for /api/admin/login endpoint
 * Covers: authentication, validation, rate limiting
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, expectError, expectJsonResponse } from '../api-helpers';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  verifyCredentials: vi.fn(),
  createSession: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
  checkRateLimit: vi.fn().mockReturnValue({ success: true, remaining: 4 }),
}));

// Import after mocks
import { POST } from '@app/api/admin/login/route';
import { verifyCredentials, createSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

describe('POST /api/admin/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Validation', () => {
    it('should return 400 when username is missing', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: { password: 'test123' },
      });

      const response = await POST(request as never);

      await expectError(response, 400, 'Username and password are required');
    });

    it('should return 400 when password is missing', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: { username: 'admin' },
      });

      const response = await POST(request as never);

      await expectError(response, 400, 'Username and password are required');
    });

    it('should return 400 when body is empty', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: {},
      });

      const response = await POST(request as never);

      await expectError(response, 400, 'Username and password are required');
    });
  });

  describe('Authentication', () => {
    it('should return 401 for invalid credentials', async () => {
      vi.mocked(verifyCredentials).mockResolvedValue(false);

      const request = createMockRequest({
        method: 'POST',
        body: { username: 'admin', password: 'wrongpassword' },
      });

      const response = await POST(request as never);

      await expectError(response, 401, 'Invalid credentials');
      expect(verifyCredentials).toHaveBeenCalledWith('admin', 'wrongpassword');
    });

    it('should return success for valid credentials', async () => {
      vi.mocked(verifyCredentials).mockResolvedValue(true);
      vi.mocked(createSession).mockResolvedValue(undefined);

      const request = createMockRequest({
        method: 'POST',
        body: { username: 'admin', password: 'correctpassword' },
      });

      const response = await POST(request as never);
      const json = await expectJsonResponse(response, 200);

      expect(json).toEqual({ success: true });
      expect(createSession).toHaveBeenCalledWith('admin');
    });
  });

  describe('Rate Limiting', () => {
    it('should return 429 when rate limit exceeded', async () => {
      const resetAt = new Date(Date.now() + 60000);
      vi.mocked(checkRateLimit).mockReturnValue({
        success: false,
        remaining: 0,
        resetAt,
      });

      const request = createMockRequest({
        method: 'POST',
        body: { username: 'admin', password: 'test123' },
      });

      const response = await POST(request as never);

      expect(response.status).toBe(429);
      expect(response.headers.get('Retry-After')).toBeDefined();

      const json = (await response.json()) as { error: string; retryAfter: number };
      expect(json.error).toContain('Too many login attempts');
      expect(json.retryAfter).toBeGreaterThan(0);
    });

    it('should allow request when within rate limit', async () => {
      vi.mocked(checkRateLimit).mockReturnValue({
        success: true,
        remaining: 3,
        resetAt: new Date(),
      });
      vi.mocked(verifyCredentials).mockResolvedValue(true);
      vi.mocked(createSession).mockResolvedValue(undefined);

      const request = createMockRequest({
        method: 'POST',
        body: { username: 'admin', password: 'test123' },
      });

      const response = await POST(request as never);

      expect(response.status).toBe(200);
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on unexpected error', async () => {
      vi.mocked(checkRateLimit).mockReturnValue({ success: true, remaining: 4, resetAt: new Date() });
      vi.mocked(verifyCredentials).mockRejectedValue(new Error('Database connection failed'));

      const request = createMockRequest({
        method: 'POST',
        body: { username: 'admin', password: 'test123' },
      });

      const response = await POST(request as never);

      await expectError(response, 500, 'Internal server error');
    });
  });
});
