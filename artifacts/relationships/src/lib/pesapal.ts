import { api } from "./api";

export type CreateOrderInput = {
  purpose: "membership" | "welfare";
  memberId?: string | null;
  campaignId?: string | null;
  amount: number;
  payerName: string;
  payerPhone: string;
  payerEmail?: string;
  description?: string;
};

export async function createPesapalOrder(input: CreateOrderInput) {
  return api.post<{ redirect_url: string; merchant_reference: string; order_tracking_id: string }>(
    "/payments/create",
    input
  );
}

export async function verifyPesapalStatus(orderTrackingId: string, merchantReference: string) {
  return api.get(`/payments/ipn?OrderTrackingId=${encodeURIComponent(orderTrackingId)}&OrderMerchantReference=${encodeURIComponent(merchantReference)}`);
}

/**
 * Navigate to a Pesapal redirect URL.
 *
 * Uses a temporary anchor with target="_top" so that we always break out of
 * any embedding iframe (e.g. the Replit preview pane, a partner site embed,
 * etc.) — pay.pesapal.com refuses to render inside an iframe (X-Frame-Options),
 * which is why a plain `window.location.href = url` silently fails in those
 * contexts. target="_top" works even cross-origin.
 */
export function navigateToPesapal(url: string) {
  if (typeof window === "undefined") return;
  try {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_top";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch {
    // last-ditch fallback
    window.location.href = url;
  }
}
