export default function ScrollingDivider() {
  const words = [
    "MRUDULA VASTRA",
    "✦",
    "PREMIUM COLLECTION",
    "✦",
    "HANDPICKED SAREES",
    "✦",
    "KIDS WEAR",
    "✦",
    "ETHNIC",
    "✦"
  ];

  // Two copies is enough for seamless looping with CSS translate
  const repeatedWords = [...words, ...words];

  return (
    <div className="bg-forest py-4 lg:py-5 overflow-hidden flex whitespace-nowrap border-y border-gold/20">
      <div
        className="flex gap-8 lg:gap-12 items-center min-w-max pr-8 lg:pr-12"
        style={{
          animation: "scroll-marquee 30s linear infinite",
          willChange: "transform",
        }}
      >
        {repeatedWords.map((word, i) => (
          <span
            key={i}
            className="font-playfair text-[11px] lg:text-[13px] tracking-[0.25em] uppercase text-gold"
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}
