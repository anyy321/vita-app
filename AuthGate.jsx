import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabaseClient.js";
import { createCheckoutLink } from "./infinitePay.js";
import { PRODUCTS, SUBSCRIPTION_PRODUCT, getProductById, formatPrice } from "./products.js";
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
          Vita · autoconhecimento
        </p>
      </div>
    </div>
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
  const [profile, setProfile] = useState(null); // { is_subscriber, subscription_expires_at, order_nsu }
  const [purchases, setPurchases] = useState([]); // linhas da tabela purchases (compras avulsas)
  const [loadingEntitlements, setLoadingEntitlements] = useState(false);

  const fetchEntitlements = useCallback(async (userId) => {
    setLoadingEntitlements(true);
    const [{ data: profileData }, { data: purchasesData }] = await Promise.all([
      supabase
        .from("profiles")
        .select("is_subscriber, subscription_expires_at, order_nsu")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("purchases")
        .select("product_id, order_nsu")
        .eq("user_id", userId),
    ]);
    setProfile(profileData || null);
    setPurchases(purchasesData || []);
    setLoadingEntitlements(false);
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
      fetchEntitlements(session.user.id);
    } else {
      setProfile(null);
      setPurchases([]);
    }
  }, [session, fetchEntitlements]);

  // Ainda não sabemos se tem sessão -> carregando
  if (session === undefined) return <LoadingScreen />;

  // Não logado -> tela de login
  if (!session) return <LoginScreen />;

  const hasActiveSubscription =
    !!profile?.is_subscriber &&
    !!profile?.subscription_expires_at &&
    new Date(profile.subscription_expires_at) > new Date();

  const unlockedIds = purchases.map((p) => p.product_id);

  // Cria o pedido no InfinitePay e leva para o checkout.
  // `productId` precisa bater com um id do catálogo em src/products.js
  async function goToCheckout(productId) {
    const product = getProductById(productId);
    if (!product) throw new Error("Produto não encontrado no catálogo.");

    // order_nsu carrega o produto + usuário, pra o webhook saber o que liberar.
    const orderNsu = `${product.id}__${session.user.id}__${Date.now()}`;

    // Guarda o order_nsu mais recente no perfil (compat. com o fluxo antigo de assinatura)
    if (product.type === "subscription") {
      await supabase
        .from("profiles")
        .update({ order_nsu: orderNsu })
        .eq("id", session.user.id);
    }

    const checkoutUrl = await createCheckoutLink(
      product,
      orderNsu,
      session.user.email
    );
    window.location.href = checkoutUrl;
  }

  return (
    <App
      session={session}
      initialSubscribed={hasActiveSubscription}
      initialUnlockedIds={unlockedIds}
      onBuyProduct={goToCheckout}
      onSubscribe={
        SUBSCRIPTION_PRODUCT
          ? () => goToCheckout(SUBSCRIPTION_PRODUCT.id)
          : undefined
      }
      onRefreshEntitlements={() => fetchEntitlements(session.user.id)}
      onSignOut={() => supabase.auth.signOut()}
    />
  );
}
