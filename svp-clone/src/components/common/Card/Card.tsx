import React from 'react';
import styles from './Card.module.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'outlined' | 'filled';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    clickable?: boolean;
    children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    (
        {
            variant = 'default',
            padding = 'md',
            clickable = false,
            className = '',
            children,
            ...props
        },
        ref
    ) => {
        const classes = [
            styles.card,
            styles[`card--${variant}`],
            styles[`card--padding-${padding}`],
            clickable && styles['card--clickable'],
            className,
        ]
            .filter(Boolean)
            .join(' ');

        return (
            <div ref={ref} className={classes} {...props}>
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className = '',
    children,
    ...props
}) => {
    return (
        <div className={`${styles.cardHeader} ${className}`} {...props}>
            {children}
        </div>
    );
};

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className = '',
    children,
    ...props
}) => {
    return (
        <div className={`${styles.cardBody} ${className}`} {...props}>
            {children}
        </div>
    );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className = '',
    children,
    ...props
}) => {
    return (
        <div className={`${styles.cardFooter} ${className}`} {...props}>
            {children}
        </div>
    );
};
