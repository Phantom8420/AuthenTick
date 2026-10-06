export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <defs>
        <linearGradient id="lg" x1="4" y1="4" x2="36" y2="36">
          <stop stopColor="#8fe3df" />
          <stop offset="1" stopColor="#2a8f8d" />
        </linearGradient>
      </defs>
      <path d="M20 3 35 11.500v17L20 37 5 28.500v-17z" stroke="url(#lg)" strokeWidth="1.800" strokeLinejoin="round" />
      <path d="M20 11 28.500 16v8L20 29l-8.500-5v-8z" fill="url(#lg)" opacity=".2" />
      <path d="m14.500 20.400 3.600 3.600 7.600-8" stroke="url(#lg)" strokeWidth="2.600" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
