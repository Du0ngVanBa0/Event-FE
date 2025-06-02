import { ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';

interface UniverseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'solid' | 'outline';
    to?: string;
    fullWidth?: boolean;
}

const UniverseButton = ({
    children,
    variant = 'solid',
    to,
    fullWidth,
    className = '',
    style,
    ...props
}: UniverseButtonProps) => {
    const baseStyles: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        border: '2px solid',
        fontWeight: '500',
        fontSize: '1rem',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        fontFamily: 'inherit',
        outline: 'none',
        position: 'relative',
        overflow: 'hidden',
        ...(fullWidth && { width: '100%' }),
        ...style
    };

    const variantStyles = {
        solid: {
            backgroundColor: '#6366f1',
            borderColor: '#6366f1',
            color: 'white'
        },
        outline: {
            backgroundColor: 'white',
            borderColor: '#6366f1',
            color: '#6366f1'
        }
    };

    const buttonStyle: React.CSSProperties = {
        ...baseStyles,
        ...variantStyles[variant]
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
        const target = e.currentTarget;
        if (variant === 'outline') {
            target.style.backgroundColor = '#6366f1';
            target.style.color = 'white';
        } else {
            target.style.backgroundColor = '#4f46e5';
        }
        target.style.transform = 'translateY(-2px)';
        target.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.3)';
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
        const target = e.currentTarget;
        if (variant === 'outline') {
            target.style.backgroundColor = 'white';
            target.style.color = '#6366f1';
        } else {
            target.style.backgroundColor = '#6366f1';
        }
        target.style.transform = 'translateY(0)';
        target.style.boxShadow = 'none';
    };

    const buttonContent = (
        <button
            className={className}
            style={buttonStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            {...props}
        >
            {children}
        </button>
    );

    return to ? (
        <Link to={to} style={{ textDecoration: 'none' }}>
            {buttonContent}
        </Link>
    ) : buttonContent;
};

export default UniverseButton;