import { describe, it, expect, beforeEach } from 'vitest'
import { checkRateLimit, getIpLimiter, getUserLimiter, getRateLimitHeaders } from '@/lib/rate-limit'

describe('Rate Limiting Utility', () => {
    describe('checkRateLimit', () => {
        it('should allow requests within rate limit', async () => {
            const result = await checkRateLimit('test-ip-1', 'ip', 'free')
            expect(result.allowed).toBe(true)
            expect(result.remaining).toBeGreaterThan(0)
        })

        it('should return headers with correct rate limit info', () => {
            const headers = getRateLimitHeaders('free', 15)
            expect(headers['X-RateLimit-Limit']).toBe('20')
            expect(headers['X-RateLimit-Remaining']).toBe('15')
            expect(headers['X-RateLimit-Reset']).toBeDefined()
        })
    })

    describe('getIpLimiter', () => {
        it('should return the same limiter for the same IP', () => {
            const limiter1 = getIpLimiter('192.168.1.1')
            const limiter2 = getIpLimiter('192.168.1.1')
            expect(limiter1).toBe(limiter2)
        })

        it('should return different limiters for different IPs', () => {
            const limiter1 = getIpLimiter('192.168.1.1')
            const limiter2 = getIpLimiter('192.168.1.2')
            expect(limiter1).not.toBe(limiter2)
        })
    })

    describe('getUserLimiter', () => {
        it('should return different limiters for different plans', () => {
            const freeLimiter = getUserLimiter('user-1', 'free')
            const proLimiter = getUserLimiter('user-1', 'pro')
            expect(freeLimiter).not.toBe(proLimiter)
        })

        it('should return the same limiter for same user and plan', () => {
            const limiter1 = getUserLimiter('user-2', 'pro')
            const limiter2 = getUserLimiter('user-2', 'pro')
            expect(limiter1).toBe(limiter2)
        })
    })
})
