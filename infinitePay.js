// Configurações do checkout da InfinitePay.
// O "handle" é o seu InfiniteTag (sem o $) — é uma informação pública, como um Pix.
const INFINITEPAY_HANDLE = "sam_terapia";

// Valor da assinatura, em CENTAVOS (R$ 39,90 = 3990)
export const SUBSCRIPTION_PRICE_CENTS = 3990;

// Endereço da nossa "recebedora" de avisos de pagamento (Edge Function do Supabase).
// Esse endereço é atualizado depois que a função for publicada no passo seguinte.
const WEBHOOK_URL =
  "https://rteoqbrevblkvzyxbkjp.supabase.co/functions/v1/infinitepay-webhook";

/**
 * Cria um link de pagamento da InfinitePay para o usuário atual.
 * @param {string} orderNsu - identificador único do pedido (vamos usar o id do usuário + timestamp)
 * @param {string} userEmail - e-mail do usuário, pra preencher o checkout
 * @returns {Promise<string>} a URL do checkout pra redirecionar o usuário
 */
export async function createCheckoutLink(orderNsu, userEmail) {
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
          price: SUBSCRIPTION_PRICE_CENTS,
          description: "Assinatura Vita - 30 dias",
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
