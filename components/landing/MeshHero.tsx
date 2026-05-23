// Subtle spotlight background for the landing hero. Less is more —
// one large soft brand-tinted orb behind the headline, with a faint
// horizon glow at the bottom of the section. No noise, no italic
// editorial styling. Linear/Stripe restraint.

export function MeshHero({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        {/* Single subtle spotlight, top-center, drifts slowly */}
        <div
          className="absolute top-[-30%] left-1/2 -translate-x-1/2 h-[820px] w-[820px] rounded-full bg-[radial-gradient(closest-side,_rgba(0,112,126,0.10)_0%,_transparent_72%)] animate-mesh-drift-a"
        />
        {/* Whisper of warmth lower-right */}
        <div className="absolute bottom-[-20%] right-[-10%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,_rgba(216,132,36,0.06)_0%,_transparent_70%)] animate-mesh-drift-b" />
        {/* Faint dotted grid for premium texture */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(15,31,34,0.6) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse at top, black 0%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at top, black 0%, transparent 70%)",
          }}
        />
      </div>
      {children}
    </div>
  );
}
