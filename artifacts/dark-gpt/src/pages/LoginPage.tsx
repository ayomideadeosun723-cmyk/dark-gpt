import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useVerifyAccess } from "@workspace/api-client-react";

const SLIDES = [
  "/images/slide1.webp",
  "/images/slide2.webp",
  "/images/slide3.webp",
  "/images/slide4.jpeg",
  "/images/slide5.png",
  "/images/slide6.jpeg",
];

export default function LoginPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [step, setStep] = useState<"landing" | "keygate">("landing");
  const [keyInput, setKeyInput] = useState("");
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();
  const verifyAccess = useVerifyAccess();

  useEffect(() => {
    const interval = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        setTransitioning(false);
      }, 1000);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (step === "keygate") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [step]);

  const handleTap = () => setStep("keygate");

  const handleVerify = async () => {
    if (!keyInput.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      await verifyAccess.mutateAsync({ data: { key: keyInput.trim() } });
      localStorage.setItem("darkgpt_entered", "true");
      setLocation("/chat");
    } catch {
      setError("Wrong key. You are not welcome here.");
      setShaking(true);
      setKeyInput("");
      setTimeout(() => setShaking(false), 600);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleVerify();
    if (e.key === "Escape") { setStep("landing"); setError(""); setKeyInput(""); }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Sliding background */}
      <div className="absolute inset-0 z-0">
        {SLIDES.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${src})`,
              opacity: i === currentSlide ? (transitioning ? 0 : 1) : 0,
              transition: "opacity 1.2s ease-in-out",
            }}
          />
        ))}
        <div className="absolute inset-0 bg-black/68" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 10%, rgba(0,0,0,0.88) 100%)" }} />
      </div>

      {/* Blood drips */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-around pointer-events-none overflow-hidden">
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="w-0.5 rounded-b-full"
            style={{
              background: "linear-gradient(to bottom, #8b0000, transparent)",
              height: `${22 + (i * 19) % 75}px`,
              animation: `bloodDrip ${3 + i * 0.3}s ease-in ${i * 0.22}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-20 flex flex-col items-center gap-8 px-6 text-center">
        {/* Title */}
        <div className="animate-float">
          <h1
            className="font-gothic glow-red animate-flicker"
            style={{ fontSize: "clamp(3.5rem, 12vw, 7rem)", color: "#cc0000", lineHeight: 1.05, letterSpacing: "0.04em" }}
          >
            FYT GPT
          </h1>
          <div className="mt-2 h-px bg-gradient-to-r from-transparent via-red-800 to-transparent w-full" />
          <p className="font-cinzel text-xs tracking-[0.45em] text-red-900 mt-2 uppercase">FYT GPT — Forged by LORDFYT</p>
        </div>

        {/* Tagline */}
        <p className="font-crimson text-xl italic max-w-sm" style={{ color: "#c8a0a0", textShadow: "0 0 12px rgba(139,0,0,0.5)" }}>
          "Where light ends, I begin."
        </p>

        {/* Step: Landing — TAP TO CONTINUE */}
        {step === "landing" && (
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleTap}
              className="relative group"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <div
                className="px-12 py-5 rounded-sm font-cinzel text-lg uppercase tracking-[0.25em] transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg,#8b0000,#5c0000)",
                  border: "1px solid #cc0000",
                  color: "#ffcccc",
                  boxShadow: "0 0 20px rgba(139,0,0,0.6), 0 0 40px rgba(139,0,0,0.3)",
                  letterSpacing: "0.3em",
                }}
              >
                TAP TO CONTINUE
              </div>
              <div className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: "0 0 30px rgba(204,0,0,0.5), inset 0 0 20px rgba(204,0,0,0.1)" }} />
            </button>
            <p className="font-crimson text-sm italic" style={{ color: "#4a1515" }}>Abandon all hope, ye who enter here</p>
          </div>
        )}

        {/* Step: Key Gate */}
        {step === "keygate" && (
          <div
            className="flex flex-col items-center gap-4 w-full max-w-xs"
            style={{ animation: shaking ? "shake 0.5s ease-in-out" : "none" }}
          >
            <p className="font-cinzel text-xs uppercase tracking-widest" style={{ color: "#8b0000" }}>
              🔐 Enter Access Key
            </p>

            <input
              ref={inputRef}
              type="password"
              value={keyInput}
              onChange={(e) => { setKeyInput(e.target.value); setError(""); }}
              onKeyDown={handleKeyDown}
              placeholder="••••••••••••"
              className="input-dark w-full px-4 py-3 rounded-sm font-mono text-center text-lg tracking-widest"
              style={{ letterSpacing: "0.3em" }}
            />

            {error && (
              <p className="font-crimson text-sm" style={{ color: "#ff4444", textShadow: "0 0 8px rgba(255,0,0,0.5)" }}>
                ☠ {error}
              </p>
            )}

            <div className="flex gap-3 w-full">
              <button
                onClick={handleVerify}
                disabled={!keyInput.trim() || loading}
                className="btn-dark flex-1 py-3 rounded-sm text-xs"
              >
                {loading ? "CHECKING..." : "ENTER THE DARKNESS"}
              </button>
              <button
                onClick={() => { setStep("landing"); setError(""); setKeyInput(""); }}
                className="px-4 py-3 rounded-sm text-xs font-cinzel border border-red-900/40 text-red-900 hover:text-blood transition-all"
              >
                ←
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Creator credit */}
      <div className="absolute bottom-4 left-0 right-0 z-20 text-center">
        <p className="font-cinzel text-xs" style={{ color: "#2d0d0d" }}>
          Created by LORDFYT &nbsp;•&nbsp; All souls consumed
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-10px); }
          30% { transform: translateX(10px); }
          45% { transform: translateX(-8px); }
          60% { transform: translateX(8px); }
          75% { transform: translateX(-4px); }
          90% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
