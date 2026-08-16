const REPLICATE_ENDPOINT = "https://api.replicate.com/v1/models/nightmareai/real-esrgan/predictions";

module.exports = async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed" });
  if (!process.env.REPLICATE_API_TOKEN) {
    return response.status(500).json({ error: "The image service is not configured yet." });
  }

  const { image, scale = 4, faceEnhance = true } = request.body || {};
  if (typeof image !== "string" || !image.startsWith("data:image/")) {
    return response.status(400).json({ error: "Please upload a valid image." });
  }

  try {
    const modelResponse = await fetch(REPLICATE_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        input: { image, scale: Math.min(Math.max(Number(scale) || 4, 2), 4), face_enhance: Boolean(faceEnhance) }
      })
    });
    const prediction = await modelResponse.json();
    if (!modelResponse.ok) throw new Error(prediction.detail || prediction.title || "Image restoration could not start.");
    return response.status(202).json({ id: prediction.id, status: prediction.status, output: prediction.output, error: prediction.error });
  } catch (error) {
    return response.status(500).json({ error: error.message || "Image restoration could not start." });
  }
}
