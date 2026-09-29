import React from 'react';

interface SquadronCrestProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showMotto?: boolean;
}

export const SquadronCrest: React.FC<SquadronCrestProps> = ({
  className = '',
  size = 'md',
  showMotto = false,
}) => {
  const sizeMap = {
    sm: 'h-8 max-w-[40px]',
    md: 'h-14 max-w-[60px]',
    lg: 'h-24 max-w-[100px]',
    xl: 'h-36 max-w-[150px]',
  };

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      <img
        src="/logo.png"
        alt="888 Avenger Royal Canadian Air Cadet Squadron Logo"
        className={`${sizeMap[size]} w-auto object-contain filter drop-shadow-sm`}
        loading="eager"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/src/assets/images/logo.png';
        }}
      />
      {showMotto && (
        <span className="mt-2.5 text-[11px] font-mono tracking-wider text-sky-800 font-semibold uppercase">
          888 Avenger · Vancouver, BC
        </span>
      )}
    </div>
  );
};
