import { z } from 'zod';

/**
 * Password validation rules:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordSchema = z
    .string()
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
    .regex(/[a-z]/, 'Şifre en az bir küçük harf içermelidir')
    .regex(/[0-9]/, 'Şifre en az bir rakam içermelidir')
    .regex(/[^A-Za-z0-9]/, 'Şifre en az bir özel karakter içermelidir');

export const emailSchema = z
    .string()
    .min(1, 'E-posta adresi gereklidir')
    .email('Geçerli bir e-posta adresi giriniz');

export const nameSchema = z
    .string()
    .min(2, 'İsim en az 2 karakter olmalıdır')
    .max(50, 'İsim en fazla 50 karakter olabilir')
    .optional();

/**
 * Login form schema
 */
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Şifre gereklidir'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Register form schema with password confirmation
 */
export const registerSchema = z
    .object({
        name: nameSchema,
        email: emailSchema,
        password: passwordSchema,
        passwordConfirm: z.string().min(1, 'Şifre tekrarı gereklidir'),
    })
    .refine((data) => data.password === data.passwordConfirm, {
        message: 'Şifreler eşleşmiyor',
        path: ['passwordConfirm'],
    });

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Password strength calculator
 * Returns a score from 0-100
 */
export function calculatePasswordStrength(password: string): number {
    let score = 0;

    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[a-z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 15;

    return Math.min(100, score);
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(score: number): {
    label: string;
    color: string;
} {
    if (score < 40) return { label: 'Zayıf', color: 'text-red-500' };
    if (score < 70) return { label: 'Orta', color: 'text-yellow-500' };
    if (score < 90) return { label: 'Güçlü', color: 'text-green-500' };
    return { label: 'Çok Güçlü', color: 'text-emerald-500' };
}
