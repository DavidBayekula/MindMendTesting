
let COUNSELORS = [];

// Fetch JSON helper
async function fetchJSON(url, fallback) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Bad status");
    return await res.json();
  } catch {
    return fallback;
  }
}

async function wireCounselorSearch(){
  const nameEl = document.getElementById('counselorName');
  const stateEl = document.getElementById('counselorState');
  const univEl = document.getElementById('counselorUniv');
  const btn = document.getElementById('searchBtn');
  const out = document.getElementById('counselorResults');
  const label = document.getElementById('resultsFor');
  if(!nameEl || !stateEl || !univEl || !btn || !out) return;

  COUNSELORS = await fetchJSON('counselors.json', []);
  const universities = await fetchJSON('universities.json', {});

  // Populate state dropdown
  Object.keys(universities).sort().forEach(state => {
    const option = document.createElement('option');
    option.value = state;
    option.textContent = state;
    stateEl.appendChild(option);
  });

  function render(list, qName, qState, qUniv){
    if(label){
      const has = (qName || qState || qUniv);
      label.style.display = has ? 'block' : 'none';
      if(has){
        const parts = [];
        if(qName) parts.push(`name: “${qName}”`);
        if(qState) parts.push(`state: “${qState}”`);
        if(qUniv) parts.push(`university: “${qUniv}”`);
        label.textContent = "Showing results for " + parts.join(" • ");
      }
    }
    out.innerHTML = '';
    if(!list.length){
      out.innerHTML = `<p class="muted" style="margin-top:12px">No counselors matched your search.</p>`;
      return;
    }
    list.forEach(c=>{
      const card = document.createElement('div');
      card.className = 'c-card';
      card.innerHTML = `
        <div class="c-avatar" aria-hidden="true"></div>
        <div>
          <div style="font-weight:700;font-size:20px">${c.name}</div>
          <div class="muted">${c.university}</div>
          <p class="muted" style="margin:8px 0 0">${c.summary}</p>
          <div style="display:flex;gap:16px;margin-top:10px;align-items:center;color:#4b4b4b;flex-wrap:wrap">
            <a href="mailto:${c.email}">📧 ${c.email}</a>
            <a href="tel:${c.phone.replace(/[^0-9]/g,'')}">📞 ${c.phone}</a>
          </div>
        </div>
        <a class="chip" href="${c.linkUrl}" target="_blank" rel="noopener">${c.linkText}</a>`;
      out.appendChild(card);
    });
  }

  function filter(){
    const qName = (nameEl.value || '').trim().toLowerCase();
    const qState = (stateEl.value || '').trim();
    const qUniv = (univEl.value || '').trim();

    const results = COUNSELORS.filter(c => {
      const nameOk = !qName || c.name.toLowerCase().includes(qName);
      let univOk = true;
      if (qUniv) {
        univOk = c.university.toLowerCase() === qUniv.toLowerCase();
      } else if (qState) {
        univOk = universities[qState].some(u => u.toLowerCase() === c.university.toLowerCase());
      }
      return nameOk && univOk;
    });
    render(results, nameEl.value.trim(), qState, qUniv);
  }

  // Event listener for state change to populate universities
  stateEl.addEventListener('change', () => {
    const selectedState = stateEl.value;
    univEl.innerHTML = '<option value="">Any University</option>';
    if (selectedState && universities[selectedState]) {
      universities[selectedState].forEach(univ => {
        const option = document.createElement('option');
        option.value = univ;
        option.textContent = univ;
        univEl.appendChild(option);
      });
    }
    filter();
  });

  render(COUNSELORS, '', '', '');
  btn.addEventListener('click', filter);
  nameEl.addEventListener('keydown', e => { if (e.key === 'Enter') filter(); });
  nameEl.addEventListener('input', () => { if (!nameEl.value && !stateEl.value && !univEl.value) filter(); });
  univEl.addEventListener('change', filter);
}

// Only wire on the counselors page
document.addEventListener('DOMContentLoaded', () => {
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (path === 'counselor.html') wireCounselorSearch();
});