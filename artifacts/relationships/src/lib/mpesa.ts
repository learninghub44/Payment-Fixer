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

export type CreateOrderResult = {
  merchant_reference: string;
  checkout_request_id?: string;
  message: string;
};

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

export function createMpesaOrder(input: CreateOrderInput) {
  return api.post<CreateOrderResult>("/payments/create", input);
}

export function getPaymentStatus(merchantReference: string) {
  return api.get<{ status: PaymentStatus; purpose: string }>(
    `/payments/status?merchantReference=${encodeURIComponent(merchantReference)}`
  );
}

/**
 * Poll /payments/status after an STK push until the customer enters their
 * PIN (COMPLETED), cancels/times out (FAILED), or we give up.
 *
 * Returns the final status, or "PENDING" if we hit the timeout — the caller
 * should treat that as "still waiting, ask the user to check back".
 */
export async function pollPaymentStatus(
  merchantReference: string,
  { intervalMs = 3000, timeoutMs = 90000 }: { intervalMs?: number; timeoutMs?: number } = {}
): Promise<PaymentStatus> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    await new Promise((r) => setTimeout(r, intervalMs));
    try {
      const { status } = await getPaymentStatus(merchantReference);
      if (status === "COMPLETED" || status === "FAILED") return status;
    } catch {
      // transient network hiccup — keep polling
    }
  }
  return "PENDING";
}
