import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { pb } from '@/api/client';
import { Button } from '@/components/UI/Button';
import { Input } from '@/components/UI/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/UI/Card';
import { LanguageSwitcher } from '@/components/UI/LanguageSwitcher';
import { registerSchema, RegisterFormData, calculatePasswordStrength, getPasswordStrengthLabel } from '@/lib/validations';
import { Logo } from '@/components/UI/Logo';

export default function Register() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });
    const password = watch('password') || '';

    // Calculate password strength
    const passwordStrength = useMemo(() => calculatePasswordStrength(password), [password]);
    const strengthLabel = useMemo(() => getPasswordStrengthLabel(passwordStrength), [passwordStrength]);

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        setError('');
        try {
            // 1. Create user
            const userData = {
                email: data.email,
                password: data.password,
                passwordConfirm: data.passwordConfirm,
                name: data.name,
            };
            await pb.collection('monex_users').create(userData);

            // 2. Authenticate
            await pb.collection('monex_users').authWithPassword(data.email, data.password);

            // 3. Navigate
            navigate('/app');
        } catch (err: unknown) {
            if (import.meta.env.DEV) console.error(err);
            const errorMessage = err instanceof Error ? err.message : t('auth.createFailed');
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
            {/* Language Switcher */}
            <div className="absolute top-4 right-4">
                <LanguageSwitcher />
            </div>

            <div className="absolute inset-0 z-0 bg-background" />

            <Card className="z-10 w-full max-w-sm border-border bg-card text-card-foreground shadow-xl">
                <CardHeader>
                    <Logo size="sm" className="mb-2" />
                    <CardTitle className="text-2xl">{t('auth.register')}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        {t('auth.registerDesc')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                        {error && (
                            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                                {error}
                            </div>
                        )}
                        <div className="grid gap-2">
                            <label htmlFor="name" className="text-sm font-medium">{t('auth.name')}</label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                className="bg-background border-input"
                                {...register('name')}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="email" className="text-sm font-medium">{t('auth.email')}</label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                className="bg-background border-input"
                                {...register('email', { required: true })}
                            />
                            {errors.email && <span className="text-xs text-destructive">{t('auth.emailRequired')}</span>}
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="password" className="text-sm font-medium">{t('auth.password')}</label>
                            <Input
                                id="password"
                                type="password"
                                className="bg-background border-input"
                                {...register('password')}
                            />
                            {password && (
                                <div className="space-y-1">
                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${passwordStrength < 40 ? 'bg-red-500' :
                                                passwordStrength < 70 ? 'bg-yellow-500' :
                                                    'bg-green-500'
                                                }`}
                                            style={{ width: `${passwordStrength}%` }}
                                        />
                                    </div>
                                    <p className={`text-xs ${strengthLabel.color}`}>
                                        {strengthLabel.label}
                                    </p>
                                </div>
                            )}
                            {errors.password && <span className="text-xs text-destructive">{errors.password.message}</span>}
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="passwordConfirm" className="text-sm font-medium">{t('auth.confirmPassword')}</label>
                            <Input
                                id="passwordConfirm"
                                type="password"
                                className="bg-background border-input"
                                {...register('passwordConfirm')}
                            />
                            {errors.passwordConfirm && <span className="text-xs text-destructive">{errors.passwordConfirm.message}</span>}
                        </div>
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? t('auth.creatingAccount') : t('auth.createAccount')}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <div className="text-sm text-muted-foreground">
                        {t('auth.hasAccount')}{' '}
                        <Link to="/auth/login" className="text-primary hover:underline">
                            {t('auth.signIn')}
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
