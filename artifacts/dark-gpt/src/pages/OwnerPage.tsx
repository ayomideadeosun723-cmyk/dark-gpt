import { useState } from "react";
import { useLocation } from "wouter";

const SLIDES = [
  "/images/slide1.webp",
  "/images/slide2.webp",
  "/images/slide3.webp",
];

export default function OwnerPage() {
  const [step, setStep] = useState<"verify" | "dashboard">("verify");
  const [ownerKey, setOwnerKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [keyStatus, setKeyStatus] = useState<{ hasKey: boolean; preview: string | null } | null>(null);
  const [verifyError, setVerifyError] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [, setLocation] = useLocation();

  const verifyOwner = async () => {
    setVerifyError("");
    const res = await fetch("/api/owner/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ownerKey }),
    });
    if (!res.ok) { setVerifyError("Wrong key. You are not the owner."); return; }
    // load key status
    const statusRes = await fetch("/api/owner/groq-key-status", {
      method: "GET",
      headers: { "x-owner-key": ownerKey },
    });
    if (statusRes.ok) setKeyStatus(await statusRes.json());
    setStep("dashboard");
  };

  const saveGroqKey = async () => {
    if (!groqKey.trim()) return;
    setSaving(true); setSaveMsg("");
    const res = await fetch("/api/owner/set-groq-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ownerKey, groqKey }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setSaveMsg("✓ Groq API key sealed in the abyss!");
      setGroqKey("");
      setKeyStatus({ hasKey: true, preview: groqKey.slice(0, 8) + "••••••••" });
    } else {
      setSaveMsg("✗ " + (data.error ?? "Failed"));
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${SLIDES[0]})`, opacity: 0.25 }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, #0d0000 0%, #000000 100%)" }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">

        {/* VERIFY STEP */}
        {step === "verify" && (
          <div className="rounded-sm p-8 text-center" style={{ background: "linear-gradient(135deg,#0d0000,#1a0000)", border: "1px solid #8b0000" }}>
            <h1 className="font-gothic text-blood text-4xl glow-red animate-flicker mb-2">FYT GPT</h1>
            <p className="font-cinzel text-xs text-red-900 tracking-widest uppercase mb-6">Owner Control Panel</p>
            <div className="h-px bg-red-900/40 mb-6" />

            <p className="font-crimson text-sm mb-4" style={{ color: "#c8a0a0" }}>
              Enter the owner access key to continue.
            </p>
            <input
              type="password"
              value={ownerKey}
              onChange={(e) => { setOwnerKey(e.target.value); setVerifyError(""); }}
              onKeyDown={(e) => e.key === "Enter" && verifyOwner()}
              placeholder="••••••••••••"
              className="input-dark w-full px-4 py-3 rounded-sm font-mono text-center text-lg tracking-widest mb-3"
              autoFocus
            />
            {verifyError && <p className="font-crimson text-sm mb-3" style={{ color: "#ff4444" }}>☠ {verifyError}</p>}
            <button onClick={verifyOwner} className="btn-dark w-full py-3 rounded-sm text-xs mb-4">
              ENTER AS OWNER
            </button>
            <button onClick={() => setLocation("/")} className="font-cinzel text-xs text-red-900/50 hover:text-red-900 transition-colors">
              ← Back
            </button>
          </div>
        )}

        {/* DASHBOARD STEP */}
        {step === "dashboard" && (
          <div className="rounded-sm p-8" style={{ background: "linear-gradient(135deg,#0d0000,#1a0000)", border: "1px solid #8b0000" }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-gothic text-blood text-3xl glow-red">FYT GPT</h1>
                <p className="font-cinzel text-xs text-red-900 tracking-widest uppercase">Owner Panel</p>
              </div>
              <span className="font-cinzel text-xs px-2 py-1 rounded-sm" style={{ background: "#1a0000", border: "1px solid #226622", color: "#44cc44" }}>
                ✓ OWNER
              </span>
            </div>
            <div className="h-px bg-red-900/40 mb-6" />

            {/* Groq key status */}
            <div className="rounded-sm p-4 mb-4" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid #3d0000" }}>
              <p className="font-cinzel text-xs uppercase tracking-widest mb-2" style={{ color: "#8b0000" }}>Groq API Key</p>
              {keyStatus?.hasKey ? (
                <p className="font-mono text-sm" style={{ color: "#44cc44" }}>✓ Set — {keyStatus.preview}</p>
              ) : (
                <p className="font-crimson text-sm" style={{ color: "#ff9944" }}>⚠ Not set — bot will not respond</p>
              )}
            </div>

            {/* Set new key */}
            <p className="font-crimson text-sm mb-2" style={{ color: "#c8a0a0" }}>
              Set Groq API Key — get one free at{" "}
              <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="text-blood underline">console.groq.com</a>
            </p>
            <input
              type="password"
              value={groqKey}
              onChange={(e) => { setGroqKey(e.target.value); setSaveMsg(""); }}
              onKeyDown={(e) => e.key === "Enter" && saveGroqKey()}
              placeholder="gsk_••••••••••••••••••••••••••"
              className="input-dark w-full px-4 py-3 rounded-sm font-mono text-sm mb-3"
            />
            {saveMsg && (
              <p className="font-crimson text-sm mb-3" style={{ color: saveMsg.startsWith("✓") ? "#44cc44" : "#ff4444" }}>
                {saveMsg}
              </p>
            )}
            <button onClick={saveGroqKey} disabled={saving || !groqKey.trim()} className="btn-dark w-full py-3 rounded-sm text-xs mb-6">
              {saving ? "SEALING..." : "SEAL THE KEY"}
            </button>

            <div className="h-px bg-red-900/40 mb-4" />
            <button onClick={() => setLocation("/chat")} className="font-cinzel text-xs text-red-900/50 hover:text-blood transition-colors block text-center w-full">
              → Enter the Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
