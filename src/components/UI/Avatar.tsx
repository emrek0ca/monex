import * as React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string;
    alt?: string;
    fallback?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
    xl: 'h-14 w-14 text-lg',
};

export function Avatar({
    src,
    alt = 'Avatar',
    fallback,
    size = 'md',
    className,
    ...props
}: AvatarProps) {
    const [imageError, setImageError] = React.useState(false);

    const showFallback = !src || imageError;

    return (
        <div
            className={cn(
                'relative inline-flex items-center justify-center rounded-full bg-muted font-medium text-muted-foreground overflow-hidden',
                sizeClasses[size],
                className
            )}
            {...props}
        >
            {showFallback ? (
                <span className="uppercase">
                    {fallback || alt?.charAt(0) || '?'}
                </span>
            ) : (
                <img
                    src={src}
                    alt={alt}
                    className="h-full w-full object-cover"
                    onError={() => setImageError(true)}
                />
            )}
        </div>
    );
}

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    max?: number;
}

export function AvatarGroup({
    children,
    max = 4,
    className,
    ...props
}: AvatarGroupProps) {
    const avatars = React.Children.toArray(children);
    const showAvatars = avatars.slice(0, max);
    const remaining = avatars.length - max;

    return (
        <div
            className={cn('flex -space-x-2', className)}
            {...props}
        >
            {showAvatars}
            {remaining > 0 && (
                <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs font-medium text-muted-foreground border-2 border-background">
                    +{remaining}
                </div>
            )}
        </div>
    );
}
