// Cole este código no Supabase Dashboard > Edge Functions > Deploy a new function > Via Editor
// Nome sugerido da função: infinitepay-webhook

import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const payload = await req.json();

    // A InfinitePay manda, entre outras coisas, o order_nsu que criamos
    // e o valor pago (paid_amount) em centavos.
    const orderNsu = payload.order_nsu;
    const paidAmount = payload.paid_amount ?? payload.amount;

    if (!orderNsu) {
      return new Response(JSON.stringify({ error: "order_nsu ausente" }), {
        status: 400,
      });
    }

    // Só libera se o valor pago bater com o esperado (proteção simples contra fraude)
    const EXPECTED_AMOUNT_CENTS = 3990; // deve bater com SUBSCRIPTION_PRICE_CENTS do app
    if (paidAmount && paidAmount < EXPECTED_AMOUNT_CENTS) {
      return new Response(
        JSON.stringify({ error: "valor pago menor que o esperado" }),
        { status: 400 }
      );
    }

    // Usa a chave de serviço (service_role) pra poder escrever no banco
    // ignorando as regras de RLS — só essa função no servidor tem essa chave,
    // ela nunca fica exposta no app.
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        is_subscriber: true,
        subscription_expires_at: expiresAt.toISOString(),
      })
      .eq("order_nsu", orderNsu);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
    });
  }
});
