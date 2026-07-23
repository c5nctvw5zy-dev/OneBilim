import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, ShieldCheck, XCircle } from "lucide-react";
import BilimLoader from "@/components/BilimLoader";

// Beta auth.oauth namespace — typed wrapper so TS stays happy.
type OAuthNs = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};
const oauth = (supabase.auth as unknown as { oauth: OAuthNs }).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("authorization_id параметрі жоқ.");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/login?next=" + encodeURIComponent(next);
        return;
      }
      if (!oauth) {
        setError("OAuth SDK қолжетімсіз.");
        return;
      }
      const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) {
        setError(error.message ?? String(error));
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message ?? String(error));
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("Авторизация сервері қайту URL-ін қайтармады.");
      return;
    }
    window.location.href = target;
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
        <Card className="max-w-md w-full p-6 space-y-3">
          <div className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            <h1 className="text-xl font-semibold">Қосылу мүмкін болмады</h1>
          </div>
          <p className="text-sm text-muted-foreground break-words">{error}</p>
        </Card>
      </main>
    );
  }

  if (!details) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <BilimLoader label="Авторизация деректері жүктелуде..." />
      </main>
    );
  }

  const clientName = details?.client?.name ?? details?.client?.client_name ?? "сыртқы қосымша";
  const redirectUri = details?.client?.redirect_uris?.[0] ?? details?.redirect_uri ?? "";
  const scopes: string[] = Array.isArray(details?.scopes)
    ? details.scopes
    : typeof details?.scope === "string"
    ? details.scope.split(" ").filter(Boolean)
    : [];

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <Card className="max-w-lg w-full p-8 space-y-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">
              {clientName} қосымшасын BilimApp-қа қосу
            </h1>
            <p className="text-sm text-muted-foreground">
              Бұл қосымша сіздің атыңыздан BilimApp құралдарын пайдалана алады.
            </p>
          </div>
        </div>

        <div className="rounded-xl border p-4 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="font-medium">Қосымша сұрайды:</span>
          </div>
          <ul className="pl-6 list-disc text-muted-foreground space-y-1">
            <li>Профиль және негізгі есеп деректерін оқу</li>
            <li>Сізге көрінетін мектеп деректеріне қол жеткізу (сыныптар, кесте, бағалар, хабарландырулар)</li>
            {scopes.length > 0 && (
              <li>Қосымша рұқсаттар: {scopes.join(", ")}</li>
            )}
          </ul>
          {redirectUri && (
            <p className="text-xs text-muted-foreground mt-2 break-all">
              Қайту URL: {redirectUri}
            </p>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          BilimApp рөлдері мен RLS ережелері бәрібір қолданылады — қосымша сіз көре алатын деректерден артық ештеңе ала алмайды.
        </p>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" disabled={busy} onClick={() => decide(false)}>
            Бас тарту
          </Button>
          <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>
            {busy ? "Жіберілуде..." : "Рұқсат беру"}
          </Button>
        </div>
      </Card>
    </main>
  );
}
