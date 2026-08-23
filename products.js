// ============================================================
// CATÁLOGO DE PRODUTOS — Vita
// ============================================================
// Edite esta lista para adicionar, remover ou ajustar preços.
// Cada produto vira automaticamente um item vendável na Loja,
// com link de pagamento próprio e liberação automática.
//
// type:
//   "subscription" -> dá acesso completo ao app por X dias (renovável)
//   "one_time"      -> compra avulsa, acesso permanente àquele item
//
// free: true  -> marca o item como isca gratuita. Ele aparece na
//                 vitrine normalmente, mas sem cobrar nada — é liberado
//                 na hora, sem passar pelo checkout. Ótimo para atrair
//                 gente pra dentro do app e mostrar o resto que é pago.
//
// id: use só letras minúsculas, números e hífen — precisa ser ÚNICO
//     e, depois de publicado, NUNCA mude o id de um produto já vendido
//     (senão quem já comprou perde o registro de acesso).
// ============================================================

export const PRODUCTS = [
  {
    id: "assinatura-completa",
    type: "subscription",
    name: "Assinatura Vita — Acesso Completo",
    description: "Acesso a todos os protocolos, e-books e cronogramas por 30 dias.",
    price_cents: 3990, // R$ 39,90
    duration_days: 30,
  },

  // ---- Isca gratuita — exemplo ----
  // Deixe pelo menos 1 item com free:true sempre visível na vitrine.
  // {
  //   id: "ebook-primeiros-passos",
  //   type: "one_time",
  //   name: "E-book — Primeiros Passos no Autoconhecimento",
  //   description: "Introdução gratuita, uma amostra do que tem nos e-books pagos.",
  //   price_cents: 0,
  //   free: true,
  // },

  // ---- Cronogramas avulsos ----
  {
    id: "cronograma-autoconhecimento-30",
    type: "one_time",
    name: "Cronograma de Autoconhecimento — 30 dias",
    description: "Plano guiado dia a dia para se conhecer melhor, em 30 dias.",
    price_cents: 3000, // R$ 30,00
  },
  // Copie o bloco acima para adicionar outro cronograma, ex:
  // {
  //   id: "cronograma-ansiedade-21",
  //   type: "one_time",
  //   name: "Cronograma para Ansiedade — 21 dias",
  //   description: "...",
  //   price_cents: 3000,
  // },

  // ---- E-books avulsos ----
  {
    id: "ebook-autoconhecimento-vol1",
    type: "one_time",
    name: "E-book — Guia de Autoconhecimento Vol. 1",
    description: "Leitura guiada com reflexões e exercícios práticos.",
    price_cents: 2000, // R$ 20,00
  },
  // Copie o bloco acima para adicionar outro e-book.

  // ---- Vídeos avulsos (em breve) ----
  // {
  //   id: "video-nome-do-video",
  //   type: "one_time",
  //   name: "Vídeo — Nome do vídeo",
  //   description: "...",
  //   price_cents: 1500, // R$ 15,00
  // },
];

export function formatPrice(cents) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}

export const SUBSCRIPTION_PRODUCT = PRODUCTS.find(
  (p) => p.type === "subscription"
);

export const FREE_PRODUCTS = PRODUCTS.filter((p) => p.free);
export const PAID_PRODUCTS = PRODUCTS.filter((p) => !p.free);
