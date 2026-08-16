// Safe deployment check: it never returns the token or account information.
module.exports = async function handler(request, response) {
  if (request.method !== "GET") return response.status(405).json({ error: "Method not allowed" });
  const token = process.env.REPLICATE_API_TOKEN?.trim();
  if (!token) return response.status(503).json({ configured: false, authorized: false, message: "REPLICATE_API_TOKEN is not available to this Vercel deployment." });

  try {
    const providerResponse = await fetch("https://api.replicate.com/v1/account", { headers: { Authorization: `Bearer ${token}` } });
    if (providerResponse.status === 401) return response.status(503).json({ configured: true, authorized: false, message: "Replicate rejected the configured token." });
    if (!providerResponse.ok) return response.status(503).json({ configured: true, authorized: false, message: "Could not validate the AI provider connection." });
    return response.status(200).json({ configured: true, authorized: true, message: "AI image restoration is ready." });
  } catch {
    return response.status(503).json({ configured: true, authorized: false, message: "Could not reach the AI provider." });
  }
};
