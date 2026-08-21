import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

type StatusKind = "success" | "error";
interface StatusEventDetail {
  kind: StatusKind;
  message?: string;
}

const EVENT = "bilim:status";

/** Кез келген жерден шақыруға болады: showStatus("success", "Сақталды") */
export function showStatus(kind: StatusKind, message?: string) {
  window.dispatchEvent(new CustomEvent<StatusEventDetail>(EVENT, { detail: { kind, message } }));
}

export default function StatusAnimation() {
  const [state, setState] = useState<StatusEventDetail | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<StatusEventDetail>).detail;
      setState(detail);
      const timer = setTimeout(() => setState(null), 1500);
      return () => clearTimeout(timer);
    };
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  if (!state) return null;
  const isSuccess = state.kind === "success";

  return (
    <div className="pointer-events-none fixed inset-0 z-[200] flex items-center justify-center">
      <div
        className="flex flex-col items-center gap-3 rounded-2xl bg-card/95 px-8 py-7 shadow-2xl backdrop-blur"
        style={{ animation: "bilim-pop 320ms cubic-bezier(.2,.9,.3,1.4)", perspective: 600 }}
      >
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-full ${isSuccess ? "bg-success/15" : "bg-destructive/15"}`}
          style={{ animation: "bilim-spin3d 700ms ease-out", transformStyle: "preserve-3d" }}
        >
          {isSuccess ? (
            <Check className="h-9 w-9 text-success" strokeWidth={3} />
          ) : (
            <X className="h-9 w-9 text-destructive" strokeWidth={3} />
          )}
        </div>
        {state.message && (
          <p className={`max-w-[260px] text-center text-sm font-medium ${isSuccess ? "text-success" : "text-destructive"}`}>
            {state.message}
          </p>
        )}
      </div>
      <style>{`
        @keyframes bilim-pop { from { opacity: 0; transform: scale(.85) } to { opacity: 1; transform: scale(1) } }
        @keyframes bilim-spin3d { from { transform: rotateY(-180deg) scale(.6) } to { transform: rotateY(0deg) scale(1) } }
      `}</style>
    </div>
  );
}
