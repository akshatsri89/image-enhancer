# Elviora AI Image Enhancer

This app performs genuine restoration with the Real-ESRGAN model: it removes noise, recovers detail, upscales the image, and can apply face recovery. The browser sends each request to the server-side `api/` routes; the Replicate API token is never exposed to visitors.

## Deploy from GitHub to Vercel

Vercel is required instead of GitHub Pages for the live app because GitHub Pages cannot run the secure API route that calls the AI model.

1. Create a new GitHub repository and push this project:

   ```powershell
   git add .
   git commit -m "Add AI image restoration"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/elviora-image-enhancer.git
   git push -u origin main
   ```

2. Create a [Replicate](https://replicate.com) account and make an API token.
3. Import the GitHub repository in [Vercel](https://vercel.com/new). The default settings work for this project.
4. In Vercel **Settings → Environment Variables**, add:

   ```
   REPLICATE_API_TOKEN = r8_your_token
   ```

5. Redeploy. Vercel will provide the public URL, such as `https://elviora-image-enhancer.vercel.app`.

Every push to `main` will create a new Vercel deployment automatically. GitHub Actions runs syntax validation for the website and API routes on every push and pull request.

## Notes

- The app uses `nightmareai/real-esrgan`, with selectable 2× or 4× output and face recovery.
- Large uploads are resized client-side to keep the server request fast and reliable.
- Real-ESRGAN is a restoration/upscaling model, not a magic reconstruction tool: it works best on moderate blur/noise and cannot reliably recreate detail that is completely absent.
- The model is billed by Replicate (currently listed at $2 per thousand output images). Set billing and usage limits in your Replicate account before publishing publicly.
