import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { hashDeviceId } from './hash.utils.js';
import env from '../config/env.js';

describe('hashDeviceId', () => {
  const originalSecret = env.DEVICE_ID_SECRET;

  beforeEach(() => {
    env.DEVICE_ID_SECRET = 'test-secret-key-for-vitest';
  });

  afterEach(() => {
    env.DEVICE_ID_SECRET = originalSecret;
  });

  it('should return empty string if deviceId is empty', () => {
    expect(hashDeviceId('')).toBe('');
    expect(hashDeviceId(null)).toBe('');
    expect(hashDeviceId(undefined)).toBe('');
  });

  it('should hash a non-empty deviceId', () => {
    const hash = hashDeviceId('my-device-id');
    expect(hash).toBeTypeOf('string');
    expect(hash.length).toBeGreaterThan(0);
    expect(hash).not.toBe('my-device-id');
  });

  it('should consistently produce the same hash for the same deviceId', () => {
    const hash1 = hashDeviceId('test-device-123');
    const hash2 = hashDeviceId('test-device-123');
    expect(hash1).toBe(hash2);
  });

  it('should produce different hashes for different deviceIds', () => {
    const hash1 = hashDeviceId('test-device-123');
    const hash2 = hashDeviceId('test-device-456');
    expect(hash1).not.toBe(hash2);
  });
});
