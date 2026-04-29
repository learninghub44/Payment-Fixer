import { createApp } from "./app";

const app = createApp();
const PORT = Number(process.env.PORT || 8080);

if (!process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`KUWESA server listening on port ${PORT}`);
    const base =
      process.env.APP_BASE_URL ||
      `https://${(process.env.REPLIT_DOMAINS || "").split(",")[0]?.trim() || "localhost"}`;
    console.log(`Pesapal IPN will register against: ${base}/api/payments/ipn`);
  });
}

export default app;
