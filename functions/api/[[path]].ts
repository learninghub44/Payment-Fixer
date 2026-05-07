export async function onRequest(context: any) {
  const { request, params } = context;
  const path = (params.path as string[]).join("/");
  const url = new URL(request.url);
  const target = `https://kuwesa-payment-api.onrender.com/api/${path}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.set("x-forwarded-host", url.hostname);

  const proxyReq = new Request(target, {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
    redirect: "follow",
  });

  const res = await fetch(proxyReq);

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
