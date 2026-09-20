/* global Response, URL, Request */
/**
 * Minimal Cloudflare Worker adapter used by the Sites host.
 * Vite copies this file to dist/index.js; locally, Vite still serves index.html.
 */
export default {
  async fetch(request, env) {
    if (!env.ASSETS?.fetch) {
      return new Response("Quorum static assets are unavailable.", { status: 503 });
    }

    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) return response;

    const url = new URL(request.url);
    const looksLikeFile = url.pathname.split("/").pop()?.includes(".");
    if (looksLikeFile) return response;

    // BrowserRouter routes such as /itinerary should return the SPA shell.
    return env.ASSETS.fetch(new Request(new URL("/", url.origin), request));
  },
};
