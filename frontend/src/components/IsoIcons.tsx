/** Small isometric glyphs for the hero path. Teal faces, hard top-left light. */
const defs = (id: string) => (
  <defs>
    <linearGradient id={`${id}t`} x1="0" y1="0" x2="1" y2="1">
      <stop stopColor="#8fe3df" />
      <stop offset="1" stopColor="#3cb5b2" />
    </linearGradient>
    <linearGradient id={`${id}l`} x1="0" y1="0" x2="0" y2="1">
      <stop stopColor="#2a8f8d" />
      <stop offset="1" stopColor="#12504f" />
    </linearGradient>
    <linearGradient id={`${id}r`} x1="0" y1="0" x2="0" y2="1">
      <stop stopColor="#1c6e6c" />
      <stop offset="1" stopColor="#0a3534" />
    </linearGradient>
  </defs>
);

/** Shield on a slab — minting a twin. */
export function IsoShield() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden>
      {defs("s")}
      <path d="M32 44 52 33v7L32 51 12 40v-7z" fill="url(#sl)" />
      <path d="M32 51 52 40v-7L32 44z" fill="url(#sr)" />
      <path d="M32 22 52 33 32 44 12 33z" fill="#0d3b3a" stroke="#3cb5b2" strokeOpacity=".5" />
      <path d="M32 6c5 3.5 10 4.6 14 4.8v11c0 8-5.6 14-14 17-8.400-3-14-9-14-17v-11c4-.2 9-1.300 14-4.800z" fill="url(#st)" />
      <path d="M32 6v32c8.400-3 14-9 14-17V10.800C42 10.600 37 9.500 32 6z" fill="#000" opacity=".16" />
      <circle cx="32" cy="22" r="4" fill="#0b2f2e" />
      <path d="M30.500 24h3l1 7h-5z" fill="#0b2f2e" />
    </svg>
  );
}

/** Parcel cube — tracking events. */
export function IsoBox() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden>
      {defs("b")}
      <path d="M32 10 54 21v24L32 56 10 45V21z" fill="url(#bl)" />
      <path d="M32 33 54 21v24L32 56z" fill="url(#br)" />
      <path d="M32 10 54 21 32 33 10 21z" fill="url(#bt)" />
      <path d="M21 15.500 43 27l0 6" stroke="#0b2f2e" strokeWidth="3.500" strokeLinejoin="round" opacity=".55" />
      <path d="M32 33v23" stroke="#0b2f2e" strokeWidth="0" />
      <path d="M43 27 32 33v23l11-5.500z" fill="#fff" opacity=".07" />
    </svg>
  );
}

/** Scan card with magnifier — verification. */
export function IsoScan() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden>
      {defs("c")}
      <path d="M6 30 28 19l30 15-22 11z" fill="url(#cr)" />
      <path d="M6 30 36 45v5L6 35z" fill="url(#cl)" />
      <path d="M36 45 58 34v5L36 50z" fill="url(#cr)" />
      <path d="M6 30 28 19l30 15-22 11z" fill="#0d3b3a" stroke="#3cb5b2" strokeOpacity=".6" />
      <path d="m22 33 6-3 6 3-6 3zM30 37l7-3.500 6 3-7 3.500z" fill="url(#ct)" opacity=".9" />
      <circle cx="26" cy="22" r="11" fill="#06201f" fillOpacity=".55" stroke="url(#ct)" strokeWidth="3" />
      <path d="m34 30 8 8" stroke="url(#ct)" strokeWidth="4" strokeLinecap="round" />
      <path d="m21 22 4 4 6-7" stroke="#8fe3df" strokeWidth="2.200" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Key on a plate — proving ownership. */
export function IsoKey() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden>
      {defs("k")}
      <path d="M32 40 54 29v6L32 46 10 35v-6z" fill="url(#kl)" />
      <path d="M32 46 54 35v-6L32 40z" fill="url(#kr)" />
      <path d="M32 18 54 29 32 40 10 29z" fill="#0d3b3a" stroke="#3cb5b2" strokeOpacity=".5" />
      <ellipse cx="22" cy="24" rx="11" ry="9" fill="none" stroke="url(#kt)" strokeWidth="5" />
      <path d="m30 27 17 8" stroke="url(#kt)" strokeWidth="5" strokeLinecap="round" />
      <path d="m39 31 1.500 5M44 33.500l1.500 5" stroke="url(#kt)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
