import { useEffect, useState } from "react";

export default function WelcomeAnimation({ onDone }: { onDone?: () => void }) {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), 4500);
    const doneTimer = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 5000);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  if (!visible) return null;

  const text = "BilimApp білім беру жүйесіне қош келдіңіз!";
  const letters = Array.from(text);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden transition-opacity duration-500 ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background:
          "radial-gradient(circle at 30% 20%, hsl(217 91% 60%) 0%, hsl(224 76% 28%) 45%, hsl(222 45% 10%) 100%)",
        perspective: "1200px",
      }}
    >
      {/* animated star field */}
      <div className="absolute inset-0 opacity-40 welcome-stars" />

      {/* glowing orbit rings */}
      <div className="absolute welcome-ring" style={{ width: 520, height: 520 }} />
      <div className="absolute welcome-ring welcome-ring-2" style={{ width: 720, height: 720 }} />

      <div className="relative flex flex-col items-center gap-8 px-6 text-center">
        {/* 3D rotating cap */}
        <div className="welcome-cap-wrap">
          <div className="welcome-cap">🎓</div>
        </div>

        {/* Kinetic 3D letters */}
        <h1
          className="font-extrabold text-white drop-shadow-[0_6px_30px_rgba(59,130,246,0.55)]"
          style={{
            fontSize: "clamp(1.5rem, 4vw, 3rem)",
            transformStyle: "preserve-3d",
            letterSpacing: "0.01em",
          }}
        >
          {letters.map((ch, i) => (
            <span
              key={i}
              className="welcome-letter inline-block"
              style={{ animationDelay: `${0.6 + i * 0.035}s` }}
            >
              {ch === " " ? "\u00A0" : ch}
            </span>
          ))}
        </h1>

        <p
          className="text-white/80 text-sm md:text-base welcome-sub"
          style={{ animationDelay: "2.6s" }}
        >
          Сарсембек Алихан Ринатұлы жасаған платформа
        </p>
      </div>

      <style>{`
        @keyframes welcome-cap-spin {
          0%   { transform: rotateY(-180deg) rotateX(20deg) scale(0.2); opacity: 0; }
          25%  { transform: rotateY(0deg) rotateX(10deg) scale(1.15); opacity: 1; }
          60%  { transform: rotateY(180deg) rotateX(-8deg) scale(1); opacity: 1; }
          100% { transform: rotateY(360deg) rotateX(0deg) scale(1); opacity: 1; }
        }
        .welcome-cap-wrap {
          perspective: 900px;
        }
        .welcome-cap {
          font-size: clamp(80px, 14vw, 160px);
          transform-style: preserve-3d;
          animation: welcome-cap-spin 2.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          filter: drop-shadow(0 20px 40px rgba(0,0,0,0.5));
        }

        @keyframes welcome-letter-in {
          0%   { transform: translateY(40px) rotateX(-90deg); opacity: 0; }
          60%  { transform: translateY(-6px) rotateX(15deg); opacity: 1; }
          100% { transform: translateY(0) rotateX(0deg); opacity: 1; }
        }
        .welcome-letter {
          opacity: 0;
          transform-origin: 50% 100%;
          animation: welcome-letter-in 0.7s cubic-bezier(0.2, 0.9, 0.3, 1.2) forwards;
          text-shadow: 0 2px 20px rgba(96,165,250,0.6);
        }

        @keyframes welcome-sub-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .welcome-sub {
          opacity: 0;
          animation: welcome-sub-in 0.6s ease-out forwards;
        }

        @keyframes welcome-ring-spin {
          from { transform: rotate(0deg) rotateX(70deg); }
          to   { transform: rotate(360deg) rotateX(70deg); }
        }
        .welcome-ring {
          border: 1px solid rgba(255,255,255,0.18);
          border-top-color: rgba(255,255,255,0.7);
          border-radius: 50%;
          animation: welcome-ring-spin 4s linear infinite;
        }
        .welcome-ring-2 {
          border-top-color: rgba(147,197,253,0.8);
          animation-duration: 6s;
          animation-direction: reverse;
        }

        @keyframes welcome-stars-drift {
          from { background-position: 0 0, 0 0; }
          to   { background-position: 400px 200px, -300px 150px; }
        }
        .welcome-stars {
          background-image:
            radial-gradient(2px 2px at 20% 30%, rgba(255,255,255,0.9), transparent 60%),
            radial-gradient(1.5px 1.5px at 70% 60%, rgba(255,255,255,0.7), transparent 60%),
            radial-gradient(2px 2px at 40% 80%, rgba(255,255,255,0.8), transparent 60%),
            radial-gradient(1.5px 1.5px at 85% 20%, rgba(255,255,255,0.6), transparent 60%),
            radial-gradient(1.5px 1.5px at 10% 65%, rgba(255,255,255,0.7), transparent 60%);
          background-size: 600px 400px, 500px 350px, 700px 500px, 400px 300px, 550px 380px;
          animation: welcome-stars-drift 10s linear infinite;
        }
      `}</style>
    </div>
  );
}
