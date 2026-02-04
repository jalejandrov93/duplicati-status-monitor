interface ServerIconProps {
  color: string;
  className?: string;
}

export function ServerIcon({ color, className = "" }: ServerIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="2"
        y="4"
        width="20"
        height="6"
        rx="2"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      <rect
        x="2"
        y="14"
        width="20"
        height="6"
        rx="2"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      <circle cx="6" cy="7" r="1" fill={color} />
      <circle cx="6" cy="17" r="1" fill={color} />
      <rect x="10" y="6" width="8" height="2" rx="1" fill={color} opacity="0.5" />
      <rect x="10" y="16" width="8" height="2" rx="1" fill={color} opacity="0.5" />
    </svg>
  );
}
