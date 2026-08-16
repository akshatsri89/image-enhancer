module.exports = async function handler(request, response) {
  if (request.method !== "GET") return response.status(405).json({ error: "Method not allowed" });
  if (!process.env.REPLICATE_API_TOKEN) return response.status(500).json({ error: "The image service is not configured yet." });
  const { id } = request.query;
  if (!/^[a-z0-9]+$/i.test(id || "")) return response.status(400).json({ error: "Invalid prediction." });

  try {
    const modelResponse = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}` }
    });
    const prediction = await modelResponse.json();
    if (!modelResponse.ok) throw new Error(prediction.detail || "Could not check restoration status.");
    return response.status(200).json({ status: prediction.status, output: prediction.output, error: prediction.error });
  } catch (error) {
    return response.status(500).json({ error: error.message || "Could not check restoration status." });
  }
}
