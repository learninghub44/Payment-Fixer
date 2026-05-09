export async function onRequest(context: any) {
  const { request, params } = context;
  const path = Array.isArray(params.path) ? params.path.join("/") : (params.path ?? "");
  const url = new URL(request.url);
  const target = `https://kuwesa-payment-api.onrender.com/api/${path}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.set("x-forwarded-host", url.hostname);

  try {
    const proxyReq = new Request(target, {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
      redirect: "follow",
    });

    const res = await fetch(proxyReq);

    // Read body once as text, then check and return
    const text = await res.text();

    // If Render returned HTML (cold start), return clean JSON error
    if (text.trimStart().startsWith("<")) {
      return new Response(
        JSON.stringify({ error: "Server is starting up, please wait 30 seconds and try again." }),
        { status: 503, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    return new Response(text, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") || "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization,Cookie",
        "Access-Control-Allow-Credentials": "true",
      },
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
