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
let sourceFile, sourceDataUrl, enhancedImageUrl, outputScale = 4;

strength.addEventListener('input', () => document.querySelector('#strengthValue').value = `${strength.value}%`);
document.querySelectorAll('.pill').forEach(btn => btn.addEventListener('click', () => { document.querySelector('.pill.active').classList.remove('active'); btn.classList.add('active'); outputScale = +btn.dataset.scale; }));
document.querySelectorAll('.tabs button').forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.view)));

function showView(view) {
  if (!sourceFile || (view === 'enhanced' && !enhancedImageUrl)) return;
  document.querySelector('.tabs .active').classList.remove('active'); document.querySelector(`[data-view="${view}"]`).classList.add('active');
  const enhanced = view === 'enhanced'; displayImage.src = enhanced ? enhancedImageUrl : sourceDataUrl;
  displayImage.classList.toggle('enhanced', enhanced); comparisonText.textContent = enhanced ? 'ENHANCED' : 'ORIGINAL'; resolutionText.textContent = enhanced ? `${outputScale}× AI RESTORED` : 'ORIGINAL IMAGE';
}
function loadFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  sourceFile = file; enhancedImageUrl = null; const reader = new FileReader();
  reader.onload = event => { sourceDataUrl = event.target.result; displayImage.src = sourceDataUrl; dropZone.classList.add('hidden'); imageStage.classList.remove('hidden'); enhanceBtn.disabled = false; fileInfo.textContent = `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB`; resolutionText.textContent = 'READY TO RESTORE'; resultActions.classList.add('hidden'); document.querySelector('[data-view="enhanced"]').disabled = true; showView('original'); };
  reader.readAsDataURL(file);
}
fileInput.addEventListener('change', event => loadFile(event.target.files[0]));
['dragenter', 'dragover'].forEach(type => dropZone.addEventListener(type, event => { event.preventDefault(); dropZone.classList.add('drag'); }));
['dragleave', 'drop'].forEach(type => dropZone.addEventListener(type, event => { event.preventDefault(); dropZone.classList.remove('drag'); }));
dropZone.addEventListener('drop', event => loadFile(event.dataTransfer.files[0]));

async function makeApiImage(dataUrl) {
  const image = new Image(); image.src = dataUrl; await image.decode();
  const limit = 1600, ratio = Math.min(1, limit / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas'); canvas.width = Math.round(image.naturalWidth * ratio); canvas.height = Math.round(image.naturalHeight * ratio); canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
  let quality = .9, compressed = canvas.toDataURL('image/jpeg', quality);
  while (compressed.length > 3500000 && quality > .45) { quality -= .1; compressed = canvas.toDataURL('image/jpeg', quality); }
  return compressed;
}
const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
function setProgress(percent, label) { progressBar.style.width = `${percent}%`; progressText.textContent = label; }
async function restoreImage() {
  processing.classList.remove('hidden'); imageStage.classList.add('scanning'); enhanceBtn.disabled = true;
  try {
    setProgress(8, 'Preparing your image…'); const apiImage = await makeApiImage(sourceDataUrl); setProgress(18, 'Sending image to restoration model…');
    const faceEnhance = document.querySelectorAll('.toggle-row input')[0].checked;
    const created = await fetch('/api/enhance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: apiImage, scale: outputScale, faceEnhance }) });
    const prediction = await created.json(); if (!created.ok) throw new Error(prediction.error || 'Could not start image restoration.');
    let latest = prediction, tries = 0;
    while (!latest.output && !latest.error && tries < 30) {
      setProgress(Math.min(25 + tries * 2, 88), tries < 3 ? 'Analyzing and removing noise…' : 'Recovering fine detail with AI…'); await wait(1600); tries += 1;
      const statusResponse = await fetch(`/api/prediction/${prediction.id}`); latest = await statusResponse.json(); if (!statusResponse.ok) throw new Error(latest.error || 'Could not check image restoration.');
    }
    if (!latest.output) throw new Error(latest.error || 'The restoration took too long. Please try again.');
    enhancedImageUrl = Array.isArray(latest.output) ? latest.output[0] : latest.output; setProgress(100, 'Restoration complete.'); await wait(350); done();
  } catch (error) { progressText.textContent = error.message || 'Something went wrong. Please try again.'; progressBar.style.background = '#e56754'; await wait(2300); processing.classList.add('hidden'); imageStage.classList.remove('scanning'); }
  finally { enhanceBtn.disabled = false; progressBar.style.background = ''; }
}
enhanceBtn.addEventListener('click', restoreImage);
function done() { processing.classList.add('hidden'); imageStage.classList.remove('scanning'); resultActions.classList.remove('hidden'); document.querySelector('[data-view="enhanced"]').disabled = false; showView('enhanced'); }
document.querySelector('#startOver').addEventListener('click', () => { sourceFile = sourceDataUrl = enhancedImageUrl = null; displayImage.src = ''; imageStage.classList.add('hidden'); dropZone.classList.remove('hidden'); resultActions.classList.add('hidden'); enhanceBtn.disabled = true; fileInfo.textContent = 'No image selected'; fileInput.value = ''; });
document.querySelector('#downloadBtn').addEventListener('click', () => { if (!enhancedImageUrl) return; const link = document.createElement('a'); link.href = enhancedImageUrl; link.download = `clarity-restored-${sourceFile.name.replace(/\.[^.]+$/, '')}.png`; link.target = '_blank'; link.rel = 'noopener'; link.click(); });
document.querySelector('#tryNow').addEventListener('click', () => document.querySelector('#quality').scrollIntoView({ behavior: 'smooth' }));
