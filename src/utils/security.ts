/**
 * Security Utilities for Monex Application
 * 
 * This module provides security functions to protect against:
 * - XSS (Cross-Site Scripting) attacks
 * - Data exposure through localStorage
 * - Input sanitization
 * - Secure token handling
 */

import CryptoJS from 'crypto-js';
import DOMPurify from 'dompurify';

// Encryption key - In production, this should come from environment variables
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'monex-secure-key-2024';

/**
 * Encrypt sensitive data before storing
 */
export function encryptData(data: string): string {
    try {
        return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
    } catch (error) {
        console.error('Encryption failed:', error);
        return '';
    }
}

/**
 * Decrypt sensitive data
 */
export function decryptData(encryptedData: string): string {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('Decryption failed:', error);
        return '';
    }
}

/**
 * Secure localStorage wrapper with encryption
 */
export const secureStorage = {
    setItem: (key: string, value: unknown): void => {
        try {
            const stringValue = JSON.stringify(value);
            const encrypted = encryptData(stringValue);
            localStorage.setItem(key, encrypted);
        } catch (error) {
            console.error('Secure storage setItem failed:', error);
        }
    },

    getItem: <T>(key: string): T | null => {
        try {
            const encrypted = localStorage.getItem(key);
            if (!encrypted) return null;
            const decrypted = decryptData(encrypted);
            if (!decrypted) return null;
            return JSON.parse(decrypted) as T;
        } catch (error) {
            console.error('Secure storage getItem failed:', error);
            return null;
        }
    },

    removeItem: (key: string): void => {
        localStorage.removeItem(key);
    },

    clear: (): void => {
        localStorage.clear();
    }
};

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'span'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    });
}

/**
 * Sanitize user input - removes any HTML/script tags
 */
export function sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';
    // Remove all HTML tags
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string {
    const sanitized = sanitizeInput(email).toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(sanitized) ? sanitized : '';
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash sensitive data (one-way, for comparison purposes)
 */
export function hashData(data: string): string {
    return CryptoJS.SHA256(data).toString();
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
} {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) {
        score += 1;
    } else {
        feedback.push('Password must be at least 8 characters');
    }

    if (password.length >= 12) {
        score += 1;
    }

    if (/[a-z]/.test(password)) {
        score += 1;
    } else {
        feedback.push('Add lowercase letters');
    }

    if (/[A-Z]/.test(password)) {
        score += 1;
    } else {
        feedback.push('Add uppercase letters');
    }

    if (/[0-9]/.test(password)) {
        score += 1;
    } else {
        feedback.push('Add numbers');
    }

    if (/[^a-zA-Z0-9]/.test(password)) {
        score += 1;
    } else {
        feedback.push('Add special characters');
    }

    return {
        isValid: score >= 4,
        score,
        feedback
    };
}

/**
 * Rate limiter for API calls (client-side)
 */
class RateLimiter {
    private requests: Map<string, number[]> = new Map();
    private maxRequests: number;
    private windowMs: number;

    constructor(maxRequests: number = 10, windowMs: number = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
    }

    canMakeRequest(key: string): boolean {
        const now = Date.now();
        const windowStart = now - this.windowMs;

        let timestamps = this.requests.get(key) || [];
        timestamps = timestamps.filter(t => t > windowStart);

        if (timestamps.length >= this.maxRequests) {
            return false;
        }

        timestamps.push(now);
        this.requests.set(key, timestamps);
        return true;
    }

    getRemainingRequests(key: string): number {
        const timestamps = this.requests.get(key) || [];
        const windowStart = Date.now() - this.windowMs;
        const validTimestamps = timestamps.filter(t => t > windowStart);
        return Math.max(0, this.maxRequests - validTimestamps.length);
    }
}

// Export a singleton rate limiter for AI queries
export const aiRateLimiter = new RateLimiter(10, 60000); // 10 requests per minute

/**
 * Content Security Policy headers helper
 * Note: These should ideally be set on the server side
 */
export const CSP_DIRECTIVES = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'"],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'img-src': ["'self'", 'data:', 'https:'],
    'connect-src': ["'self'", 'https://*.pocketbase.io', 'https://api.groq.com'],
};

/**
 * Detect potential XSS patterns in input
 */
export function detectXSSPatterns(input: string): boolean {
    const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+=/gi,
        /<iframe/gi,
        /<object/gi,
        /<embed/gi,
        /eval\(/gi,
        /expression\(/gi,
    ];

    return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Secure session management
 */
export const sessionManager = {
    SESSION_KEY: 'monex_session',
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes

    startSession(): void {
        const sessionData = {
            startTime: Date.now(),
            lastActivity: Date.now(),
        };
        sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
    },

    updateActivity(): void {
        const session = this.getSession();
        if (session) {
            session.lastActivity = Date.now();
            sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        }
    },

    getSession(): { startTime: number; lastActivity: number } | null {
        const data = sessionStorage.getItem(this.SESSION_KEY);
        if (!data) return null;
        try {
            return JSON.parse(data);
        } catch {
            return null;
        }
    },

    isSessionValid(): boolean {
        const session = this.getSession();
        if (!session) return false;
        return Date.now() - session.lastActivity < this.SESSION_TIMEOUT;
    },

    endSession(): void {
        sessionStorage.removeItem(this.SESSION_KEY);
    }
};
