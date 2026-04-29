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
