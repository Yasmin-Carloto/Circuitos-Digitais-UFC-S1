const inputs = { bin: 2, oct: 8, dec: 10, hex: 16 };
let converting = false;

const patterns = {
  bin: /^[01]*$/,
  oct: /^[0-7]*$/,
  dec: /^[0-9]*$/,
  hex: /^[0-9a-fA-F]*$/
};

function convert(source) {
  if (converting) return;
  converting = true;

  const sourceText = document.getElementById(source);
  const raw = sourceText.value.trim();

  sourceText.classList.remove('error');
  document.getElementById('card-' + source).style.setProperty('--c', getColor(source));

  if (!raw) {
    clearOutputs(source);
    updateInfo(null);
    updateBits('');
    converting = false;
    return;
  }

  if (!patterns[source].test(raw)) {
    sourceText.classList.add('error');
    converting = false;
    return;
  }

  let value;
  try {
    value = BigInt(inputs[source] === 10 ? raw : parseInt(raw, inputs[source]));
  } catch(e) {
    sourceText.classList.add('error');
    converting = false;
    return;
  }

  for (const [id, base] of Object.entries(inputs)) {
    if (id === source) continue;
    const target = document.getElementById(id);
    target.classList.add('flash');
    setTimeout(() => target.classList.remove('flash'), 300);

    if (base === 2)  target.value = value.toString(2);
    else if (base === 8)  target.value = value.toString(8);
    else if (base === 10) target.value = value.toString(10);
    else if (base === 16) target.value = value.toString(16).toUpperCase();
  }

  if (source === 'hex') sourceText.value = raw.toUpperCase();

  updateBits(value.toString(2));

  document.getElementById('card-bin').classList.toggle('has-value', !!value.toString(2));

  updateInfo(value);

  converting = false;
}

function getColor(id) {
  const map = { bin: 'var(--accent)', oct: 'var(--accent2)', dec: 'var(--accent3)', hex: 'var(--accent4)' };
  return map[id];
}

function clearOutputs(source) {
  for (const id of Object.keys(inputs)) {
    if (id !== source) document.getElementById(id).value = '';
  }
  document.getElementById('card-bin').classList.remove('has-value');
}

function updateBits(binStr) {
  const container = document.getElementById('bits');
  if (!binStr) { container.innerHTML = ''; return; }

  const padded = binStr.padStart(Math.ceil(binStr.length / 8) * 8, '0');
  container.innerHTML = padded.split('').map(b =>
    `<div class="bit ${b === '1' ? 'one' : 'zero'}">${b}</div>`
  ).join('');
}

function updateInfo(value) {
  const bits = document.getElementById('info-bits');
  const bytes = document.getElementById('info-bytes');
  const val = document.getElementById('info-val');
  const pow = document.getElementById('info-pow');

  if (value === null) {
    bits.textContent = bytes.textContent = val.textContent = pow.textContent = '—';
    return;
  }

  const binStr = value.toString(2);
  const numBits = binStr.length;
  const numBytes = Math.ceil(numBits / 8);
  bits.textContent = numBits;
  bytes.textContent = numBytes;
  val.textContent = value.toLocaleString('pt-BR');

  if (value > 0n && (value & (value - 1n)) === 0n) {
    const exp = binStr.length - 1;
    pow.textContent = `2^${exp} ✓`;
    pow.style.color = 'var(--accent)';
  } else {
    pow.textContent = 'não';
    pow.style.color = '';
  }
}

function copyVal(id) {
  const sourceText = document.getElementById(id);
  if (!sourceText.value) return;
  navigator.clipboard.writeText(sourceText.value).then(() => {
    const btn = sourceText.parentElement.querySelector('.copy-btn');
    btn.textContent = 'COPIADO!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'COPIAR'; btn.classList.remove('copied'); }, 1500);
  });
}

function clearAll() {
  for (const id of Object.keys(inputs)) {
    document.getElementById(id).value = '';
    document.getElementById(id).classList.remove('error');
  }
  document.getElementById('card-bin').classList.remove('has-value');
  updateBits('');
  updateInfo(null);
}

const refVals = [0,1,2,4,8,10,15,16,32,64,128,255,256,512,1024,65535];
const refGrid = document.getElementById('ref-grid');
refVals.forEach(n => {
  const item = document.createElement('div');
  item.className = 'ref-item';
  item.innerHTML = `
    <span class="ref-dec">${n}</span>
    <span class="ref-hex">0x${n.toString(16).toUpperCase()}</span>
    <span class="ref-bin">${n.toString(2).padStart(Math.ceil(n.toString(2).length/4)*4,'0')}</span>
  `;
  item.onclick = () => {
    document.getElementById('dec').value = n;
    convert('dec');
  };
  refGrid.appendChild(item);
});

for (const id of Object.keys(inputs)) {
  document.getElementById(id).addEventListener('input', () => convert(id));
  document.getElementById(id).addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const ids = Object.keys(inputs);
      const next = ids[(ids.indexOf(id) + 1) % ids.length];
      document.getElementById(next).focus();
    }
  });
}