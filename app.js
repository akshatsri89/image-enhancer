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
let sourceFile, outputScale = 4;

strength.addEventListener('input', () => document.querySelector('#strengthValue').value = `${strength.value}%`);
document.querySelectorAll('.pill').forEach(btn => btn.addEventListener('click', () => { document.querySelector('.pill.active').classList.remove('active'); btn.classList.add('active'); outputScale = +btn.dataset.scale; }));
document.querySelectorAll('.tabs button').forEach(btn => btn.addEventListener('click', () => {
  if (!sourceFile) return;
  document.querySelector('.tabs .active').classList.remove('active'); btn.classList.add('active');
  const enhanced = btn.dataset.view === 'enhanced' && resultActions.classList.contains('hidden') === false;
  displayImage.classList.toggle('enhanced', enhanced); comparisonText.textContent = enhanced ? 'ENHANCED' : 'ORIGINAL';
}));
function loadFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  sourceFile = file; const reader = new FileReader();
  reader.onload = e => { displayImage.src = e.target.result; dropZone.classList.add('hidden'); imageStage.classList.remove('hidden'); enhanceBtn.disabled = false; fileInfo.textContent = `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB`; resolutionText.textContent = 'READY TO ENHANCE'; resultActions.classList.add('hidden'); document.querySelector('[data-view="enhanced"]').disabled = true; };
  reader.readAsDataURL(file);
}
fileInput.addEventListener('change', e => loadFile(e.target.files[0]));
['dragenter','dragover'].forEach(type => dropZone.addEventListener(type, e => { e.preventDefault(); dropZone.classList.add('drag'); }));
['dragleave','drop'].forEach(type => dropZone.addEventListener(type, e => { e.preventDefault(); dropZone.classList.remove('drag'); }));
dropZone.addEventListener('drop', e => loadFile(e.dataTransfer.files[0]));
enhanceBtn.addEventListener('click', () => {
  processing.classList.remove('hidden'); imageStage.classList.add('scanning'); let pct = 0;
  const phases = ['Analyzing image structure…','Removing noise and artifacts…','Recovering fine details…','Upscaling to HD…','Finishing color and texture…'];
  const timer = setInterval(() => { pct += Math.ceil(Math.random()*10); if (pct > 100) pct = 100; progressBar.style.width = `${pct}%`; progressText.textContent = phases[Math.min(phases.length-1, Math.floor(pct/21))]; if (pct === 100) { clearInterval(timer); setTimeout(done, 500); } }, 260);
});
function done() { processing.classList.add('hidden'); imageStage.classList.remove('scanning'); displayImage.classList.add('enhanced'); resultActions.classList.remove('hidden'); document.querySelector('[data-view="enhanced"]').disabled = false; document.querySelector('[data-view="original"]').classList.remove('active'); document.querySelector('[data-view="enhanced"]').classList.add('active'); comparisonText.textContent = 'ENHANCED'; resolutionText.textContent = `${outputScale}× HD RESTORED`; }
document.querySelector('#startOver').addEventListener('click', () => { sourceFile = null; displayImage.src = ''; imageStage.classList.add('hidden'); dropZone.classList.remove('hidden'); resultActions.classList.add('hidden'); enhanceBtn.disabled = true; fileInfo.textContent = 'No image selected'; fileInput.value = ''; });
document.querySelector('#downloadBtn').addEventListener('click', () => { const link = document.createElement('a'); link.href = displayImage.src; link.download = `clarity-enhanced-${sourceFile.name}`; link.click(); });
document.querySelector('#tryNow').addEventListener('click', () => document.querySelector('#quality').scrollIntoView({behavior:'smooth'}));
