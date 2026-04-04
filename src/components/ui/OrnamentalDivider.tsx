interface OrnamentalDividerProps {
  className?: string;
}

export default function OrnamentalDivider({ className = "" }: OrnamentalDividerProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/40" />
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M9 0L10.5 7.5L18 9L10.5 10.5L9 18L7.5 10.5L0 9L7.5 7.5Z"
          fill="#B8963E"
          opacity="0.6"
        />
      </svg>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/40" />
    </div>
  );
}
