import * as React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'circular' | 'text';
}

export function Skeleton({
    className,
    variant = 'default',
    ...props
}: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse bg-muted',
                variant === 'circular' && 'rounded-full',
                variant === 'text' && 'h-4 rounded',
                variant === 'default' && 'rounded-lg',
                className
            )}
            {...props}
        />
    );
}

// Card skeleton for loading states
export function CardSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('liquid-card p-5 space-y-3', className)}>
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
        </div>
    );
}

// Transaction skeleton
export function TransactionSkeleton() {
    return (
        <div className="flex items-center justify-between p-4 border-b last:border-b-0">
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                </div>
            </div>
            <Skeleton className="h-5 w-16" />
        </div>
    );
}

// Chart skeleton
export function ChartSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('liquid-card p-5', className)}>
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-4 rounded" />
            </div>
            <div className="h-64 flex items-end justify-evenly gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton
                        key={i}
                        className="w-full"
                        style={{ height: `${Math.random() * 60 + 40}%` }}
                    />
                ))}
            </div>
        </div>
    );
}

// Stats row skeleton
export function StatsRowSkeleton() {
    return (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    );
}

// Table skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: rows }).map((_, i) => (
                <TransactionSkeleton key={i} />
            ))}
        </div>
    );
}
