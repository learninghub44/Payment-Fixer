export async function onRequest(context: any) {
  const { request, params } = context;
  const path = Array.isArray(params.path) ? params.path.join("/") : (params.path ?? "");
  const url = new URL(request.url);
  const target = `https://kuwesa-payment-api.onrender.com/api/${path}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.set("x-forwarded-host", url.hostname);
  headers.set("x-forwarded-for", request.headers.get("cf-connecting-ip") || "");

  try {
    const proxyReq = new Request(target, {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
      redirect: "follow",
    });

    const res = await fetch(proxyReq);
    const contentType = res.headers.get("content-type") || "";

    // If Render returned HTML (cold start error page), return a clean JSON error
    if (!contentType.includes("application/json") && !contentType.includes("text/plain")) {
      const text = await res.text();
      if (text.includes("<!DOCTYPE") || text.includes("<html")) {
        return new Response(
          JSON.stringify({ error: "Server is starting up, please wait a moment and try again." }),
          { status: 503, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
        );
      }
    }

    const resHeaders = new Headers(res.headers);
    resHeaders.set("Access-Control-Allow-Origin", "*");
    resHeaders.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    resHeaders.set("Access-Control-Allow-Headers", "Content-Type,Authorization,Cookie");
    resHeaders.set("Access-Control-Allow-Credentials", "true");

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: resHeaders,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Failed to reach backend: " + err.message }),
      { status: 502, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization,Cookie",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
