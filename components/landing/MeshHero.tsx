// Animated gradient mesh background for the landing hero. Three soft
// radial blobs drift on long, offset loops. Pure CSS + transforms — no
// canvas, no JS, no extra deps. Respects prefers-reduced-motion via
// the @media tier inside the keyframes (the global rule disables them).

export function MeshHero({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem]">
      {/* Layered mesh */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-32 -left-24 h-[560px] w-[560px] rounded-full bg-[radial-gradient(closest-side,_#99D4D7_0%,_transparent_72%)] opacity-80 animate-mesh-drift-a" />
        <div className="absolute -top-40 right-[-10%] h-[640px] w-[640px] rounded-full bg-[radial-gradient(closest-side,_#FFDDA9_0%,_transparent_70%)] opacity-70 animate-mesh-drift-b" />
        <div className="absolute bottom-[-20%] left-[18%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(closest-side,_#CCEAEB_0%,_transparent_72%)] opacity-80 animate-mesh-drift-c" />
        {/* Fine grain noise overlay for premium texture */}
        <div
          className="absolute inset-0 mix-blend-overlay opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
          }}
        />
        {/* Soft white wash at edges so text contrast stays strong */}
        <div className="absolute inset-0 bg-gradient-to-b from-surface-alt/0 via-surface-alt/0 to-surface-alt/40" />
      </div>
      {children}
    </div>
  );
}
