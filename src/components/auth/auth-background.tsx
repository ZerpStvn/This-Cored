const PARTICLES = [
  { top: "8%", left: "12%", size: 10, opacity: 0.5, rotate: 15 },
  { top: "14%", left: "82%", size: 14, opacity: 0.35, rotate: 45 },
  { top: "22%", left: "45%", size: 8, opacity: 0.4, rotate: 20 },
  { top: "30%", left: "6%", size: 12, opacity: 0.3, rotate: 60 },
  { top: "18%", left: "65%", size: 6, opacity: 0.5, rotate: 10 },
  { top: "40%", left: "90%", size: 10, opacity: 0.35, rotate: 30 },
  { top: "55%", left: "4%", size: 8, opacity: 0.4, rotate: 45 },
  { top: "62%", left: "20%", size: 14, opacity: 0.25, rotate: 15 },
  { top: "70%", left: "88%", size: 10, opacity: 0.4, rotate: 50 },
  { top: "78%", left: "58%", size: 8, opacity: 0.35, rotate: 25 },
  { top: "85%", left: "30%", size: 12, opacity: 0.3, rotate: 40 },
  { top: "90%", left: "75%", size: 6, opacity: 0.45, rotate: 10 },
  { top: "48%", left: "35%", size: 6, opacity: 0.3, rotate: 35 },
  { top: "10%", left: "30%", size: 8, opacity: 0.3, rotate: 55 },
  { top: "36%", left: "78%", size: 8, opacity: 0.3, rotate: 20 },
];

export function AuthBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-[#1c1440] via-[#3a2f7a] to-[#2f5fd6]">
      <div className="absolute -top-32 -left-24 size-[28rem] rounded-full bg-fuchsia-500/30 blur-3xl" />
      <div className="absolute top-1/3 -right-24 size-[26rem] rounded-full bg-indigo-500/30 blur-3xl" />
      <div className="absolute -bottom-40 left-1/4 size-[30rem] rounded-full bg-blue-500/30 blur-3xl" />

      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-[2px] bg-white"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
