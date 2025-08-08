const cards = document.getElementById('cards');
const filterCity = document.getElementById('filterCity');
const filterBtn = document.getElementById('filterBtn');
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');

document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());

async function fetchRegistrations(params = {}) {
  const usp = new URLSearchParams(params);
  const res = await fetch(`/api/registrations?${usp.toString()}`);
  const data = await res.json();
  return data.results || [];
}

function renderCards(list) {
  cards.innerHTML = '';
  if (list.length === 0) {
    cards.innerHTML = '<p>No matches found. Try another city or register your dog!</p>';
    return;
  }
  list.forEach(item => {
    const img = item.imageUrls && item.imageUrls[0] ? item.imageUrls[0] : 'https://place.dog/600/360';
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `
      <img src="${img}" alt="${item.breed || 'Dog'}" />
      <div class="body">
        <div class="title">${item.breed || 'Dog'} • ${item.gender || ''}</div>
        <div class="meta">${item.city || ''}${item.city && item.state ? ', ' : ''}${item.state || ''}</div>
        <div class="meta">Service: ${item.serviceType || 'Stud Service'}${item.ageMonths ? ' • Age: ' + item.ageMonths + ' mo' : ''}</div>
      </div>
    `;
    cards.appendChild(el);
  });
}

async function initialLoad() {
  const list = await fetchRegistrations();
  renderCards(list);
}

filterBtn && filterBtn.addEventListener('click', async () => {
  const city = filterCity.value.trim();
  renderCards(await fetchRegistrations(city ? { city } : {}));
});

searchBtn && searchBtn.addEventListener('click', async () => {
  const city = cityInput.value.trim();
  document.getElementById('filterCity').value = city;
  renderCards(await fetchRegistrations(city ? { city } : {}));
});

initialLoad();