export async function onRequest(context: any) {
  const { request, params } = context;
  const path = Array.isArray(params.path) ? params.path.join("/") : (params.path ?? "");
  const url = new URL(request.url);
  const target = `https://kuwesa-payment-api.onrender.com/api/${path}${url.search}`;

  const headers = new Headers();
  // Forward important headers
  for (const [k, v] of request.headers.entries()) {
    if (!["host", "cf-connecting-ip", "cf-ray", "cf-visitor"].includes(k.toLowerCase())) {
      headers.set(k, v);
    }
  }
  headers.set("x-forwarded-host", url.hostname);
  headers.set("x-forwarded-proto", "https");

  try {
    const proxyReq = new Request(target, {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
      redirect: "follow",
    });

    const res = await fetch(proxyReq);
    const text = await res.text();

    // If Render returned HTML (cold start), return clean JSON error
    if (text.trimStart().startsWith("<")) {
      return new Response(
        JSON.stringify({ error: "Server is starting up, please wait 30 seconds and try again." }),
        { status: 503, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    const resHeaders = new Headers();
    resHeaders.set("Content-Type", res.headers.get("content-type") || "application/json");
    resHeaders.set("Access-Control-Allow-Origin", url.origin);
    resHeaders.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    resHeaders.set("Access-Control-Allow-Headers", "Content-Type,Authorization,Cookie,X-Requested-With");
    resHeaders.set("Access-Control-Allow-Credentials", "true");
    resHeaders.set("Access-Control-Expose-Headers", "Set-Cookie");

    // Forward cookies from backend to browser
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) resHeaders.set("set-cookie", setCookie);

    return new Response(text, { status: res.status, headers: resHeaders });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Failed to reach backend: " + err.message }),
      { status: 502, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }
}

export async function onRequestOptions(context: any) {
  const url = new URL(context.request.url);
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": url.origin,
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization,Cookie,X-Requested-With",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400",
    },
  });
}
