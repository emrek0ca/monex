import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { pb } from '@/api/client';
import { Button } from '@/components/UI/Button';
import { Input } from '@/components/UI/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/UI/Card';
import { LanguageSwitcher } from '@/components/UI/LanguageSwitcher';
import { loginSchema, LoginFormData } from '@/lib/validations';
import { Logo } from '@/components/UI/Logo';

export default function Login() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        setError('');
        try {
            await pb.collection('monex_users').authWithPassword(data.email, data.password);
            navigate('/app');
        } catch (err: unknown) {
            if (import.meta.env.DEV) console.error(err);
            setError(t('auth.invalidCredentials'));
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
                    <CardTitle className="text-2xl">{t('auth.login')}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        {t('auth.loginDesc')}
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
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-medium">{t('auth.password')}</label>
                                <Link to="/auth/forgot-password" className="text-xs text-primary hover:underline">{t('auth.forgotPassword')}</Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                required
                                className="bg-background border-input"
                                {...register('password', { required: true })}
                            />
                            {errors.password && <span className="text-xs text-destructive">{t('auth.passwordRequired')}</span>}
                        </div>
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? t('auth.signingIn') : t('auth.signIn')}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <div className="text-sm text-muted-foreground">
                        {t('auth.noAccount')}{' '}
                        <Link to="/auth/register" className="text-primary hover:underline">
                            {t('auth.signUp')}
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div >
    );
}
