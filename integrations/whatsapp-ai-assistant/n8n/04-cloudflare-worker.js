export default {
  async fetch(request, env) {
    // One public Meta callback dispatches GET verification and POST events.
    const target = request.method === "GET" ? env.N8N_VERIFY_URL
      : request.method === "POST" ? env.N8N_POST_URL : null;
    if (!target) return new Response("Method not allowed", { status: 405 });

    // Fail closed: authenticate every Meta POST against the exact raw bytes.
    let rawBody;
    if (request.method === "POST") {
      if (!env.WHATSAPP_APP_SECRET) {
        return new Response("Webhook signature validation is not configured", { status: 503 });
      }
      rawBody = await request.clone().arrayBuffer();
      const supplied = request.headers.get("x-hub-signature-256") || "";
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(env.WHATSAPP_APP_SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const digest = new Uint8Array(await crypto.subtle.sign("HMAC", key, rawBody));
      const expected = "sha256=" + Array.from(digest, b => b.toString(16).padStart(2, "0")).join("");

      // Constant-time comparison for equal-length ASCII signatures.
      let mismatch = supplied.length ^ expected.length;
      const max = Math.max(supplied.length, expected.length);
      for (let i = 0; i < max; i++) {
        mismatch |= (supplied.charCodeAt(i) || 0) ^ (expected.charCodeAt(i) || 0);
      }
      if (mismatch !== 0) return new Response("Invalid signature", { status: 403 });
    }

    const targetUrl = new URL(target);
    targetUrl.search = new URL(request.url).search;
    const init = {
      method: request.method,
      headers: request.headers,
      redirect: "manual"
    };
    if (request.method !== "GET") init.body = rawBody;
    // Do not log tokens, headers, or customer message bodies.
    return fetch(new Request(targetUrl, init));
  }
};
