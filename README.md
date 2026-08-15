# Clarity — AI Image Enhancer

A static web app for uploading a photo, adjusting enhancement settings, previewing a restored result, and downloading it.

## Publish it on GitHub Pages

1. Create a new GitHub repository, for example `image-enhancer`.
2. In this project folder, run the commands below, replacing `YOUR-USERNAME` with your GitHub account name:

   ```powershell
   git add .
   git commit -m "Add Clarity image enhancer"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/image-enhancer.git
   git push -u origin main
   ```

3. Open the repository on GitHub, then go to **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to **GitHub Actions**.
5. Wait for the **Deploy website to GitHub Pages** workflow to finish in the **Actions** tab.

Your site will be available at:

```
https://YOUR-USERNAME.github.io/image-enhancer/
```

Every future push to `main` automatically deploys the latest version. The workflow also supports the existing `master` branch until it is renamed.

## Important limitation

This is a client-side demo: it applies a visual presentation of enhancement and downloads the uploaded image. For actual AI denoising/upscaling, connect the Enhance button to an AI image-restoration API or backend; never put a private API key in `app.js`.
