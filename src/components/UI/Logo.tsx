import { cn } from '@/lib/utils';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    showText?: boolean;
}

const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12',
};

const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
};

/**
 * Monex Logo Component
 * Displays the Monex logo with optional text
 */
export function Logo({ size = 'md', className, showText = true }: LogoProps) {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            <img
                src="/logo.png"
                alt="Monex Logo"
                className={cn(sizeClasses[size], 'object-contain')}
            />
            {showText && (
                <span className={cn('font-semibold', textSizeClasses[size])}>
                    Monex
                </span>
            )}
        </div>
    );
}

/**
 * Monex Icon Component (just the icon, no text)
 * Use for favicons, small spaces, etc.
 */
export function LogoIcon({ size = 'md', className }: Omit<LogoProps, 'showText'>) {
    return (
        <img
            src="/logo.png"
            alt="Monex"
            className={cn(sizeClasses[size], 'object-contain', className)}
        />
    );
}

export default Logo;
