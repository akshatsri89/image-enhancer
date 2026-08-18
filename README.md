# Elviora AI Image Enhancer

This is a free, browser-based AI image upscaler. It runs an ESRGAN neural network on the visitor's device, so uploaded images stay in the browser and no API keys, credits, or server-side AI provider are required.

## Deploy

Push this project to GitHub and deploy it on Vercel or GitHub Pages. It is now a static website; no environment variables are needed.

```powershell
git add .
git commit -m "Use browser-based AI upscaling"
git push
```

Vercel will automatically deploy the latest GitHub commit. The AI model is downloaded from the UpscalerJS CDN the first time a visitor enhances an image, so the first use can take a little longer.

## Notes

- 2× output is best for most images. 4× runs two local model passes and can be slow on phones or older laptops.
- Images larger than 1100px on their longest side are resized before enhancement to protect browser memory.
- This is local super-resolution. It improves detail and resolution, but it cannot reliably recreate information that is completely missing from an extremely blurred image.
