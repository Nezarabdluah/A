import React from 'react';
import { Loader2 } from 'lucide-react';
import styles from './Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    fullWidth?: boolean;
    isLoading?: boolean;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            fullWidth = false,
            isLoading = false,
            startIcon,
            endIcon,
            disabled,
            className = '',
            children,
            ...props
        },
        ref
    ) => {
        const classes = [
            styles.button,
            styles[`button--${variant}`],
            styles[`button--${size}`],
            fullWidth && styles['button--fullWidth'],
            isLoading && styles['button--loading'],
            className,
        ]
            .filter(Boolean)
            .join(' ');

        return (
            <button
                ref={ref}
                className={classes}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && (
                    <Loader2 className={styles.spinner} size={size === 'xs' || size === 'sm' ? 16 : 20} />
                )}

                {!isLoading && startIcon && (
                    <span className={styles.icon}>{startIcon}</span>
                )}

                <span className={styles.content}>{children}</span>

                {!isLoading && endIcon && (
                    <span className={styles.icon}>{endIcon}</span>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';
