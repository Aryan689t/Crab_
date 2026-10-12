import React from 'react';

interface CrabLogoProps {
  className?: string;
  size?: number;
  variant?: 'orange' | 'white';
}

export const CrabLogo: React.FC<CrabLogoProps> = ({
  className = 'w-7 h-7',
  size,
  variant = 'orange',
}) => {
  const style = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <img
      src="/crab-logo.png"
      alt="CRAB"
      style={style}
      className={`object-contain shrink-0 select-none ${
        variant === 'white' ? 'brightness-0 invert' : ''
      } ${className}`}
      draggable={false}
    />
  );
};

export default CrabLogo;
