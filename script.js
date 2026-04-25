/* ═══════════════════════════════════════════
   FITCOACH — Shared Script
   ═══════════════════════════════════════════ */
 
document.addEventListener('DOMContentLoaded', () => {
 
  // ─── CURSOR GLOW ───
  const glow = document.getElementById('cursorGlow');
  if (glow) {
    document.addEventListener('mousemove', e => {
      glow.style.left = e.clientX + 'px';
      glow.style.top  = e.clientY + 'px';
    });
  }
 
  // ─── SCROLL REVEAL ───
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
 
  // Trigger above-the-fold elements immediately
  const immediateSelectors = ['.hero .reveal', '.hero-split .reveal', '.page-header .reveal'];
  immediateSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => el.classList.add('visible'));
  });
 
  // ─── FAQ TOGGLE (sluzby.html) ───
  window.toggleFaq = function(item) {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  };
 
  // ─── MODAL (sluzby.html) ───
  window.openModal = function(tab, sluzba) {
    const backdrop = document.getElementById('modalBackdrop');
    if (!backdrop) return;
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    switchTab(tab);
    if (sluzba) {
      const selId = tab === 'rezervace' ? 'sluzbaSelect' : 'sluzbaSelectDotaz';
      const sel = document.getElementById(selId);
      if (sel) sel.value = sluzba;
    }
  };
 
  window.closeModal = function() {
    const backdrop = document.getElementById('modalBackdrop');
    if (!backdrop) return;
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  };
 
  window.handleBackdropClick = function(e) {
    if (e.target === document.getElementById('modalBackdrop')) closeModal();
  };
 
  window.switchTab = function(tab) {
    const formRez  = document.getElementById('formRezervace');
    const formDot  = document.getElementById('formDotaz');
    const tabRez   = document.getElementById('tabRezervace');
    const tabDot   = document.getElementById('tabDotaz');
    const eyebrow  = document.getElementById('modalEyebrow');
    const title    = document.getElementById('modalTitle');
    if (!formRez) return;
    formRez.classList.toggle('active', tab === 'rezervace');
    formDot.classList.toggle('active', tab === 'dotaz');
    tabRez.classList.toggle('active',  tab === 'rezervace');
    tabDot.classList.toggle('active',  tab === 'dotaz');
    if (tab === 'rezervace') {
      eyebrow.textContent = 'Nezávazně · zdarma';
      title.textContent   = 'REZERVACE';
    } else {
      eyebrow.textContent = 'Odpovím do 24 hodin';
      title.textContent   = 'DOTAZ';
    }
  };
 
  window.submitForm = async function(type) {
    const successId = type === 'rezervace' ? 'successRezervace' : 'successDotaz';
    const formId    = type === 'rezervace' ? 'formRezervace'    : 'formDotaz';
    const success   = document.getElementById(successId);
    const form      = document.getElementById(formId);
    if (!form) return;
 
    // Collect form data
    const inputs   = form.querySelectorAll('input, textarea, select');
    const data     = { _subject: type === 'rezervace' ? 'Nová rezervace konzultace' : 'Nový dotaz' };
    inputs.forEach(input => {
      if (input.placeholder || input.id) {
        const key = input.id || input.placeholder;
        data[key] = input.value;
      }
    });
 
    // Disable button, show loading state
    const btn = form.querySelector('.btn-primary');
    const originalText = btn ? btn.textContent : '';
    if (btn) { btn.textContent = 'Odesílám…'; btn.disabled = true; }
 
    try {
      const res = await fetch('https://formspree.io/f/mvzdlpek', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      });
 
      if (res.ok) {
        // Success — show confirmation
        [...form.querySelectorAll('.form-row, .form-group, .form-note, .btn-primary')]
          .forEach(el => el.style.display = 'none');
        success.classList.add('visible');
        setTimeout(() => {
          closeModal();
          setTimeout(() => {
            [...form.querySelectorAll('.form-row, .form-group, .form-note, .btn-primary')]
              .forEach(el => el.style.display = '');
            success.classList.remove('visible');
            // Reset inputs
            inputs.forEach(input => input.value = '');
            if (btn) { btn.textContent = originalText; btn.disabled = false; }
          }, 400);
        }, 2200);
      } else {
        throw new Error('Chyba serveru');
      }
    } catch (err) {
      // Error state
      if (btn) { btn.textContent = 'Chyba — zkus to znovu'; btn.disabled = false; btn.style.background = '#666'; }
      setTimeout(() => {
        if (btn) { btn.textContent = originalText; btn.style.background = ''; }
      }, 3000);
    }
  };
 
  // ESC closes modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') window.closeModal && closeModal();
  });
 
});