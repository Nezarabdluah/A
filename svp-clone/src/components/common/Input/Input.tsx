import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import styles from './Input.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    fullWidth?: boolean;
    required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            error,
            helperText,
            startIcon,
            endIcon,
            fullWidth = false,
            required = false,
            type = 'text',
            className = '',
            disabled,
            ...props
        },
        ref
    ) => {
        const [showPassword, setShowPassword] = useState(false);
        const [isFocused, setIsFocused] = useState(false);

        const inputType = type === 'password' && showPassword ? 'text' : type;

        const wrapperClasses = [
            styles.wrapper,
            fullWidth && styles['wrapper--fullWidth'],
            className,
        ]
            .filter(Boolean)
            .join(' ');

        const inputClasses = [
            styles.input,
            error && styles['input--error'],
            disabled && styles['input--disabled'],
            isFocused && styles['input--focused'],
            startIcon && styles['input--withStartIcon'],
            (endIcon || type === 'password') && styles['input--withEndIcon'],
        ]
            .filter(Boolean)
            .join(' ');

        return (
            <div className={wrapperClasses}>
                {label && (
                    <label className={styles.label}>
                        {label}
                        {required && <span className={styles.required}>*</span>}
                    </label>
                )}

                <div className={styles.inputWrapper}>
                    {startIcon && (
                        <div className={styles.startIcon}>{startIcon}</div>
                    )}

                    <input
                        ref={ref}
                        type={inputType}
                        className={inputClasses}
                        disabled={disabled}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        aria-invalid={!!error}
                        aria-describedby={
                            error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
                        }
                        {...props}
                    />

                    {type === 'password' && (
                        <button
                            type="button"
                            className={styles.passwordToggle}
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <EyeOff size={20} />
                            ) : (
                                <Eye size={20} />
                            )}
                        </button>
                    )}

                    {endIcon && type !== 'password' && (
                        <div className={styles.endIcon}>{endIcon}</div>
                    )}
                </div>

                {error && (
                    <div className={styles.error} id={`${props.id}-error`}>
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {helperText && !error && (
                    <div className={styles.helperText} id={`${props.id}-helper`}>
                        {helperText}
                    </div>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
