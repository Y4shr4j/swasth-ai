import { useState } from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  className?: string;
  fallbackClassName?: string;
}

export default function Avatar({
  src,
  name,
  className = 'w-11 h-11 rounded-full',
  fallbackClassName = 'bg-[#EBF6FC] text-[#0B5D7A]',
}: AvatarProps) {
  const [failed, setFailed] = useState(false);

  const initials = name
    .replace(/^Dr\.\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setFailed(true)}
        className={`${className} object-cover shrink-0 border border-white shadow-sm`}
      />
    );
  }

  return (
    <div
      className={`${className} ${fallbackClassName} flex items-center justify-center font-bold text-sm shrink-0`}
    >
      {initials}
    </div>
  );
}
