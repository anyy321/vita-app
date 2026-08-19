import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabaseClient.js";
import { createCheckoutLink, SUBSCRIPTION_PRICE_CENTS } from "./infinitePay.js";
import App from "./App.jsx";

const COLORS = {
  bg: "#F4EEE2",
  card: "#FFFFFF",
  border: "#E4D9C4",
  text: "#3E2E28",
  textSoft: "#8C7A6B",
  accent: "#8C5A52",
  gold: "#C9A24B",
};

function formatPrice(cents) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function Screen({ children }) {
  return (
    <div
      style={{ background: COLORS.bg, minHeight: "100vh" }}
      className="flex items-center justify-center px-5 py-10"
    >
      <div className="w-full max-w-sm">
        <div
          style={{ background: COLORS.card, borderColor: COLORS.border }}
          className="rounded-2xl border p-6 shadow-sm"
        >
          {children}
        </div>
        <p
          style={{ color: COLORS.textSoft }}
          className="text-center text-xs mt-3 opacity-60"
        >
          Vita · versão com login v3
        </p>
      </div>
    </div>
  );
}

function LoginScreen() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfoMsg("");
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfoMsg(
          "Conta criada! Verifique seu e-mail para confirmar antes de entrar."
        );
      }
    } catch (err) {
      setError(traduzErro(err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <h1
        style={{ color: COLORS.text }}
        className="text-2xl font-semibold text-center mb-1"
      >
        Vita
      </h1>
      <p
        style={{ color: COLORS.textSoft }}
        className="text-center text-sm mb-6"
      >
        {mode === "login" ? "Entre na sua conta" : "Crie sua conta"}
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          required
          placeholder="Seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ borderColor: COLORS.border, color: COLORS.text }}
          className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-current"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Senha (mínimo 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ borderColor: COLORS.border, color: COLORS.text }}
          className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-current"
        />

        {error && (
          <p className="text-sm" style={{ color: "#B97080" }}>
            {error}
          </p>
        )}
        {infoMsg && (
          <p className="text-sm" style={{ color: "#4F8C82" }}>
            {infoMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ background: COLORS.accent }}
          className="w-full rounded-lg py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading
            ? "Aguarde..."
            : mode === "login"
            ? "Entrar"
            : "Criar conta"}
        </button>
      </form>

      <button
        onClick={() => {
          setMode(mode === "login" ? "signup" : "login");
          setError("");
          setInfoMsg("");
        }}
        style={{ color: COLORS.textSoft }}
        className="w-full text-center text-sm mt-4 underline"
      >
        {mode === "login"
          ? "Não tem conta? Cadastre-se"
          : "Já tem conta? Entrar"}
      </button>
    </Screen>
  );
}

function traduzErro(msg) {
  if (!msg) return "Algo deu errado. Tente de novo.";
  if (msg.includes("Invalid login credentials"))
    return "E-mail ou senha incorretos.";
  if (msg.includes("User already registered"))
    return "Esse e-mail já tem uma conta. Tente entrar.";
  if (msg.includes("Password should be"))
    return "A senha precisa ter pelo menos 6 caracteres.";
  return msg;
}

function SubscribeScreen({ session, profile, onRefreshProfile }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const expired = profile?.subscription_expires_at
    ? new Date(profile.subscription_expires_at) < new Date()
    : false;

  async function handleAssinar() {
    setError("");
    setLoading(true);
    try {
      const orderNsu = `${session.user.id}-${Date.now()}`;

      // Salva o order_nsu no perfil, pra depois a "recebedora" do pagamento
      // conseguir saber de quem é esse pedido.
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ order_nsu: orderNsu })
        .eq("id", session.user.id);
      if (updateError) throw updateError;

      const checkoutUrl = await createCheckoutLink(
        orderNsu,
        session.user.email
      );
      window.location.href = checkoutUrl;
    } catch (err) {
      setError("Não foi possível gerar o link de pagamento. Tente de novo.");
      setLoading(false);
    }
  }

  async function handleVerificarPagamento() {
    setChecking(true);
    await onRefreshProfile();
    setChecking(false);
  }

  return (
    <Screen>
      <h1
        style={{ color: COLORS.text }}
        className="text-xl font-semibold text-center mb-1"
      >
        {expired ? "Sua assinatura venceu" : "Assine o Vita"}
      </h1>
      <p
        style={{ color: COLORS.textSoft }}
        className="text-center text-sm mb-5"
      >
        {expired
          ? "Renove para continuar tendo acesso completo."
          : "Acesso completo por 30 dias, pague no Pix ou parcele no cartão."}
      </p>

      <div
        style={{ borderColor: COLORS.border }}
        className="rounded-xl border p-4 text-center mb-5"
      >
        <span
          style={{ color: COLORS.gold }}
          className="text-3xl font-semibold"
        >
          {formatPrice(SUBSCRIPTION_PRICE_CENTS)}
        </span>
        <p style={{ color: COLORS.textSoft }} className="text-xs mt-1">
          por 30 dias de acesso
        </p>
      </div>

      {error && (
        <p className="text-sm text-center mb-3" style={{ color: "#B97080" }}>
          {error}
        </p>
      )}

      <button
        onClick={handleAssinar}
        disabled={loading}
        style={{ background: COLORS.accent }}
        className="w-full rounded-lg py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Gerando link..." : "Assinar agora"}
      </button>

      <button
        onClick={handleVerificarPagamento}
        disabled={checking}
        style={{ color: COLORS.textSoft, borderColor: COLORS.border }}
        className="w-full rounded-lg border py-3 text-sm mt-3 disabled:opacity-60"
      >
        {checking ? "Verificando..." : "Já paguei, verificar novamente"}
      </button>

      <button
        onClick={() => supabase.auth.signOut()}
        style={{ color: COLORS.textSoft }}
        className="w-full text-center text-xs mt-5 underline"
      >
        Sair
      </button>
    </Screen>
  );
}

function LoadingScreen() {
  return (
    <Screen>
      <p style={{ color: COLORS.textSoft }} className="text-center text-sm">
        Carregando...
      </p>
    </Screen>
  );
}

export default function AuthGate() {
  const [session, setSession] = useState(undefined); // undefined = ainda não sabemos
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const fetchProfile = useCallback(async (userId) => {
    setLoadingProfile(true);
    const { data } = await supabase
      .from("profiles")
      .select("is_subscriber, subscription_expires_at, order_nsu")
      .eq("id", userId)
      .maybeSingle();
    setProfile(data || null);
    setLoadingProfile(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile(session.user.id);
    } else {
      setProfile(null);
    }
  }, [session, fetchProfile]);

  // Ainda não sabemos se tem sessão -> carregando
  if (session === undefined) return <LoadingScreen />;

  // Não logado -> tela de login
  if (!session) return <LoginScreen />;

  // Logado, mas ainda buscando o perfil -> carregando
  if (loadingProfile && profile === null) return <LoadingScreen />;

  const hasActiveSubscription =
    profile?.is_subscriber &&
    profile?.subscription_expires_at &&
    new Date(profile.subscription_expires_at) > new Date();

  if (!hasActiveSubscription) {
    return (
      <SubscribeScreen
        session={session}
        profile={profile}
        onRefreshProfile={() => fetchProfile(session.user.id)}
      />
    );
  }

  return <App />;
}
