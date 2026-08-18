const fileInput = document.querySelector('#fileInput');
const dropZone = document.querySelector('#dropZone');
const imageStage = document.querySelector('#imageStage');
const displayImage = document.querySelector('#displayImage');
const enhanceBtn = document.querySelector('#enhanceBtn');
const processing = document.querySelector('#processing');
const progressBar = document.querySelector('#progressBar');
const progressText = document.querySelector('#progressText');
const resultActions = document.querySelector('#resultActions');
const fileInfo = document.querySelector('#fileInfo');
const comparisonText = document.querySelector('#comparisonText');
const resolutionText = document.querySelector('#resolutionText');
const strength = document.querySelector('#strength');
let sourceFile, sourceDataUrl, enhancedImageUrl, outputScale = 2, upscaler;

strength.addEventListener('input', () => document.querySelector('#strengthValue').value = `${strength.value}%`);
document.querySelectorAll('.pill').forEach(btn => btn.addEventListener('click', () => {
  document.querySelector('.pill.active').classList.remove('active'); btn.classList.add('active'); outputScale = +btn.dataset.scale;
}));
document.querySelectorAll('.tabs button').forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.view)));

function showView(view) {
  if (!sourceFile || (view === 'enhanced' && !enhancedImageUrl)) return;
  document.querySelector('.tabs .active').classList.remove('active'); document.querySelector(`[data-view="${view}"]`).classList.add('active');
  const enhanced = view === 'enhanced'; displayImage.src = enhanced ? enhancedImageUrl : sourceDataUrl;
  displayImage.classList.toggle('enhanced', enhanced); comparisonText.textContent = enhanced ? 'ENHANCED' : 'ORIGINAL'; resolutionText.textContent = enhanced ? `${outputScale}× AI UPSCALED` : 'ORIGINAL IMAGE';
}
function loadFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  sourceFile = file; enhancedImageUrl = null; const reader = new FileReader();
  reader.onload = event => { sourceDataUrl = event.target.result; displayImage.src = sourceDataUrl; dropZone.classList.add('hidden'); imageStage.classList.remove('hidden'); enhanceBtn.disabled = false; fileInfo.textContent = `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB`; resolutionText.textContent = 'READY TO UPSCALE'; resultActions.classList.add('hidden'); document.querySelector('[data-view="enhanced"]').disabled = true; showView('original'); };
  reader.readAsDataURL(file);
}
fileInput.addEventListener('change', event => loadFile(event.target.files[0]));
['dragenter', 'dragover'].forEach(type => dropZone.addEventListener(type, event => { event.preventDefault(); dropZone.classList.add('drag'); }));
['dragleave', 'drop'].forEach(type => dropZone.addEventListener(type, event => { event.preventDefault(); dropZone.classList.remove('drag'); }));
dropZone.addEventListener('drop', event => loadFile(event.dataTransfer.files[0]));

async function prepareImage(dataUrl) {
  const image = new Image(); image.src = dataUrl; await image.decode();
  const limit = 1100, ratio = Math.min(1, limit / Math.max(image.naturalWidth, image.naturalHeight));
  if (ratio === 1) return dataUrl;
  const canvas = document.createElement('canvas'); canvas.width = Math.round(image.naturalWidth * ratio); canvas.height = Math.round(image.naturalHeight * ratio);
  canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height); return canvas.toDataURL('image/jpeg', .92);
}
function setProgress(percent, label) { progressBar.style.width = `${percent}%`; progressText.textContent = label; }
async function getUpscaler() {
  if (!window.Upscaler || !window.DefaultUpscalerJSModel) throw new Error('The local AI model could not load. Check your internet connection and try again.');
  if (!upscaler) { setProgress(18, 'Loading local AI model…'); upscaler = new window.Upscaler({ model: window.DefaultUpscalerJSModel }); }
  return upscaler;
}
async function restoreImage() {
  processing.classList.remove('hidden'); imageStage.classList.add('scanning'); enhanceBtn.disabled = true;
  try {
    setProgress(6, 'Preparing your image on this device…'); const input = await prepareImage(sourceDataUrl); const model = await getUpscaler();
    setProgress(35, 'AI is rebuilding image detail locally…');
    enhancedImageUrl = await model.upscale(input, { patchSize: 128, padding: 8, output: 'src' });
    if (outputScale === 4) { setProgress(72, 'Running the second HD detail pass…'); enhancedImageUrl = await model.upscale(enhancedImageUrl, { patchSize: 128, padding: 8, output: 'src' }); }
    setProgress(100, 'Enhancement complete.'); setTimeout(done, 350);
  } catch (error) { progressText.textContent = error.message || 'Enhancement could not complete. Try a smaller image.'; progressBar.style.background = '#e56754'; setTimeout(() => { processing.classList.add('hidden'); imageStage.classList.remove('scanning'); }, 3000); }
  finally { enhanceBtn.disabled = false; setTimeout(() => { progressBar.style.background = ''; }, 3200); }
}
enhanceBtn.addEventListener('click', restoreImage);
function done() { processing.classList.add('hidden'); imageStage.classList.remove('scanning'); resultActions.classList.remove('hidden'); document.querySelector('[data-view="enhanced"]').disabled = false; showView('enhanced'); }
document.querySelector('#startOver').addEventListener('click', () => { sourceFile = sourceDataUrl = enhancedImageUrl = null; displayImage.src = ''; imageStage.classList.add('hidden'); dropZone.classList.remove('hidden'); resultActions.classList.add('hidden'); enhanceBtn.disabled = true; fileInfo.textContent = 'No image selected'; fileInput.value = ''; });
document.querySelector('#downloadBtn').addEventListener('click', () => { if (!enhancedImageUrl) return; const link = document.createElement('a'); link.href = enhancedImageUrl; link.download = `clarity-upscaled-${sourceFile.name.replace(/\.[^.]+$/, '')}.png`; link.click(); });
document.querySelector('#tryNow').addEventListener('click', () => document.querySelector('#quality').scrollIntoView({ behavior: 'smooth' }));
