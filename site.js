// Opens and closes the menu on phones
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
if (toggle && links) {
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
}

const $ = (id) => document.getElementById(id);

/* ---------- BMI ---------- */
if ($('bmi-form')) {
  let unit = 'metric';
  const setUnit = (u) => {
    unit = u;
    document.querySelectorAll('[data-unit]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.unit === u));
    $('h-metric').hidden = u !== 'metric';
    $('h-imp').hidden = u === 'metric';
    $('bmi-wl').textContent = u === 'metric' ? 'Weight (kg)' : 'Weight (lb)';
    $('bmi-w').placeholder = u === 'metric' ? 'e.g. 65' : 'e.g. 143';
    $('bmi-err').textContent = '';
  };
  document.querySelectorAll('[data-unit]').forEach((b) => b.addEventListener('click', () => setUnit(b.dataset.unit)));

  $('bmi-form').addEventListener('submit', (e) => {
    e.preventDefault();
    let cm, kg;
    const w = parseFloat($('bmi-w').value);
    if (unit === 'metric') {
      cm = parseFloat($('bmi-cm').value);
      kg = w;
    } else {
      cm = ((parseFloat($('bmi-ft').value) || 0) * 12 + (parseFloat($('bmi-in').value) || 0)) * 2.54;
      kg = w * 0.45359237;
    }
    if (!(cm >= 100 && cm <= 250) || !(kg >= 20 && kg <= 300)) {
      $('bmi-err').textContent = 'Please enter a realistic height and weight.';
      return;
    }
    $('bmi-err').textContent = '';
    const bmi = kg / Math.pow(cm / 100, 2);
    let cat, tip;
    if (bmi < 18.5) { cat = 'Below the healthy range'; tip = 'A doctor or dietitian can help you check you are getting enough energy and nutrients.'; }
    else if (bmi < 25) { cat = 'Healthy range'; tip = 'Keep up regular movement, balanced meals and good sleep.'; }
    else if (bmi < 30) { cat = 'Above the healthy range'; tip = 'Small steps like daily walks and balanced meals help. A doctor can give personal advice.'; }
    else { cat = 'Well above the healthy range'; tip = 'It is worth talking to a doctor about a plan that suits you. Small, steady changes work best.'; }
    const pos = Math.max(0, Math.min(100, ((bmi - 15) / 25) * 100));
    $('bmi-out').innerHTML =
      '<div class="big">' + bmi.toFixed(1) + '</div><div class="label">' + cat + '</div>' +
      '<div class="meter"><i style="left:' + pos + '%"></i></div>' +
      '<div class="meter-scale"><span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span></div>' +
      '<p style="margin-top:.8rem">' + tip + '</p>';
  });
}

/* ---------- Stress check-in ---------- */
if ($('stress-form')) {
  const qs = [
    'I felt unable to control the important things in my life.',
    'I felt nervous or on edge.',
    'I felt that difficulties were piling up too high.',
    'I had trouble relaxing or switching off.',
    'I had trouble sleeping because of worry.'
  ];
  const opts = ['Never', 'Sometimes', 'Often', 'Almost always'];
  $('stress-qs').innerHTML = qs.map((q, i) =>
    '<fieldset class="q"><legend class="sr-only">' + q + '</legend><p>' + (i + 1) + '. ' + q + '</p>' +
    opts.map((o, v) => '<label><input type="radio" name="q' + i + '" value="' + v + '"> ' + o + '</label>').join('') +
    '</fieldset>').join('');

  $('stress-form').addEventListener('submit', (e) => {
    e.preventDefault();
    let total = 0;
    for (let i = 0; i < qs.length; i++) {
      const c = document.querySelector('input[name="q' + i + '"]:checked');
      if (!c) { $('stress-err').textContent = 'Please answer all five questions.'; return; }
      total += +c.value;
    }
    $('stress-err').textContent = '';
    let h, p;
    if (total <= 5) { h = 'Low stress right now'; p = 'You seem to be coping well. Keep your routines: sleep, movement and time with people you like.'; }
    else if (total <= 10) { h = 'Moderate stress'; p = 'Stress is showing up. Try the breathing guide, plan a break, and talk to someone you trust.'; }
    else { h = 'High stress'; p = 'You are carrying a lot. Please consider talking to a counselor or doctor, and be kind to yourself while you do.'; }
    const out = $('stress-out');
    out.hidden = false;
    out.innerHTML = '<div class="big">' + total + ' / 15</div><div class="label">' + h + '</div><p>' + p + '</p>' +
      '<div class="actions" style="margin-top:.8rem"><a class="btn" href="#breathing">Try breathing</a><a class="btn btn-ghost" href="counseling.html">Find support</a></div>' +
      '<p class="note" style="margin-top:.8rem">This quick check is not a medical test or diagnosis.</p>';
    out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

/* ---------- Breathing guide ---------- */
if ($('br-btn')) {
  const patterns = {
    box: [['Breathe in', 4, 1], ['Hold', 4, 1], ['Breathe out', 4, 0.7], ['Hold', 4, 0.7]],
    '478': [['Breathe in', 4, 1], ['Hold', 7, 1], ['Breathe out', 8, 0.7]],
    calm: [['Breathe in', 4, 1], ['Breathe out', 6, 0.7]]
  };
  const orb = $('br-orb'), btn = $('br-btn');
  let running = false, timer = null;

  const stop = () => {
    running = false;
    clearTimeout(timer);
    orb.style.transitionDuration = '1s';
    orb.style.transform = 'scale(.7)';
    orb.textContent = 'Ready';
    btn.textContent = 'Start';
  };
  const step = (seq, i) => {
    if (!running) return;
    const [label, secs, scale] = seq[i % seq.length];
    const isOut = label === 'Breathe out';
    const isIn = label === 'Breathe in';
    orb.textContent = label;
    if (isIn || isOut) {
      orb.style.transitionDuration = secs + 's';
      orb.style.transform = 'scale(' + (isIn ? 1.25 : 0.7) + ')';
    }
    timer = setTimeout(() => step(seq, i + 1), secs * 1000);
  };
  btn.addEventListener('click', () => {
    if (running) { stop(); return; }
    running = true;
    btn.textContent = 'Stop';
    step(patterns[$('br-pattern').value], 0);
  });
  $('br-pattern').addEventListener('change', () => { if (running) stop(); });
}

/* ---------- Water ---------- */
if ($('water-form')) {
  $('water-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const w = parseFloat($('wa-w').value);
    if (!(w >= 20 && w <= 300)) { $('wa-err').textContent = 'Please enter a realistic weight in kg.'; return; }
    $('wa-err').textContent = '';
    const ml = w * 30 + parseInt($('wa-act').value, 10) + ($('wa-hot').checked ? 500 : 0);
    const litres = (Math.round(ml / 100) / 10).toFixed(1);
    $('wa-out').innerHTML = '<div class="big">' + litres + ' L</div><div class="label">about ' + Math.round(ml / 250) + ' glasses (250 ml) a day</div>' +
      '<p>Sip through the day, and drink more if you feel thirsty or your urine is dark.</p>';
  });
}

/* ---------- Sleep ---------- */
if ($('sleep-form')) {
  const mode = $('sl-mode');
  mode.addEventListener('change', () => {
    $('sl-tl').textContent = mode.value === 'wake' ? 'Wake-up time' : 'Bedtime';
    $('sl-time').value = mode.value === 'wake' ? '07:00' : '23:00';
  });
  const fmt = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  $('sleep-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('sl-time').value;
    if (!v) return;
    const [h, m] = v.split(':').map(Number);
    const base = new Date(2000, 0, 1, h, m);
    const cycles = [6, 5, 4];
    let html;
    if (mode.value === 'wake') {
      html = '<div class="label">Go to bed around:</div>' + cycles.map((c) => {
        const t = new Date(base.getTime() - (c * 90 + 15) * 60000);
        return '<p><strong>' + fmt(t) + '</strong> <span class="note">(' + c * 1.5 + ' hours of sleep)</span></p>';
      }).join('');
    } else {
      html = '<div class="label">Set your alarm for around:</div>' + cycles.map((c) => {
        const t = new Date(base.getTime() + (c * 90 + 15) * 60000);
        return '<p><strong>' + fmt(t) + '</strong> <span class="note">(' + c * 1.5 + ' hours of sleep)</span></p>';
      }).join('');
    }
    $('sl-out').innerHTML = html;
  });
}

/* ---------- Contact form (opens the email app) ---------- */
if ($('contact-form')) {
  $('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const n = $('c-name').value.trim(), em = $('c-email').value.trim(), s = $('c-sub').value.trim(), m = $('c-msg').value.trim();
    if (!n || !em || !s || !m || !/^\S+@\S+\.\S+$/.test(em)) {
      $('c-err').textContent = 'Please fill in every field with a valid email.';
      return;
    }
    $('c-err').textContent = '';
    const body = m + '\n\nFrom: ' + n + ' (' + em + ')';
    window.location.href = 'mailto:tagmasters@support.com?subject=' + encodeURIComponent(s) + '&body=' + encodeURIComponent(body);
  });
}
