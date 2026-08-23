// Configurações do checkout da InfinitePay.
// O "handle" é o seu InfiniteTag (sem o $) — é uma informação pública, como um Pix.
const INFINITEPAY_HANDLE = "sam_terapia";

// Endereço da nossa "recebedora" de avisos de pagamento (Edge Function do Supabase).
// Nome da função no Supabase: bright-task
const WEBHOOK_URL =
  "https://rteoqbrevblkvzyxbkjp.supabase.co/functions/v1/bright-task";

/**
 * Cria um link de pagamento da InfinitePay para QUALQUER produto do catálogo.
 * @param {object} product - um item de src/products.js (precisa ter id, name, price_cents)
 * @param {string} orderNsu - identificador único do pedido
 * @param {string} userEmail - e-mail do usuário, pra preencher o checkout
 * @returns {Promise<string>} a URL do checkout pra redirecionar o usuário
 */
export async function createCheckoutLink(product, orderNsu, userEmail) {
  const response = await fetch("https://api.checkout.infinitepay.io/links", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      handle: INFINITEPAY_HANDLE,
      redirect_url: window.location.origin,
      webhook_url: WEBHOOK_URL,
      order_nsu: orderNsu,
      customer: {
        email: userEmail,
      },
      items: [
        {
          quantity: 1,
          price: product.price_cents,
          description: product.name,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error("Não foi possível criar o link de pagamento.");
  }

  const data = await response.json();
  return data.url;
}
