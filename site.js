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
