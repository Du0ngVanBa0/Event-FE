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
    ...props
}: UniverseButtonProps) => {
    const baseStyles = `
    px-6 py-2 rounded-lg transition-all duration-300
    hover:transform hover:scale-105
    focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

    const variants = {
        solid: 'bg-primary text-white hover:shadow-glow',
        outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-black hover:shadow-glow'
    };

    const buttonContent = (
        <button
            className={`${baseStyles} ${variants[variant]}`}
            {...props}
        >
            {children}
        </button>
    );

    return to ? (
        <Link to={to}>
            {buttonContent}
        </Link>
    ) : buttonContent;
};

export default UniverseButton;