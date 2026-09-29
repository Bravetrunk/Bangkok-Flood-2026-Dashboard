const activeDistricts = {
  'Lat Krabang': { th: 'ลาดกระบัง', note: 'เคหะร่มเกล้า/ถนนลาดกระบัง' },
  'Bang Kapi': { th: 'บางกะปิ', note: 'แฟลตคลองจั่น/คลองแสนแสบ' },
  'Min Buri': { th: 'มีนบุรี', note: 'สุวินทวงศ์/หทัยราษฎร์' },
  'Saphan Sung': { th: 'สะพานสูง', note: 'พื้นที่เชื่อมรามคำแหง' },
  'Suanluang': { th: 'สวนหลวง', note: 'คลองประเวศ/อ่อนนุช' },
  'Bueng Kum': { th: 'บึงกุ่ม', note: 'นวมินทร์/เสรีไทย' },
  'Khlong Sam Wa': { th: 'คลองสามวา', note: 'หทัยราษฎร์/นิมิตใหม่' },
  'Sai Mai': { th: 'สายไหม', note: 'พหลโยธิน/วัชรพล' }
};

const geoUrls = [
  'bangkok-districts.geojson',
  'https://raw.githubusercontent.com/pcrete/gsvloader-demo/master/geojson/Bangkok-districts.geojson'
];

let map;
let geoLayer;
let districtLayers = {};

function showView(viewId) {
  document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === viewId));
  document.querySelectorAll('.tab').forEach(button => {
    const selected = button.dataset.view === viewId;
    button.classList.toggle('active', selected);
    if (selected) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  });
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (viewId === 'mapview') {
    initMap();
    if (map) requestAnimationFrame(() => map.invalidateSize());
  }
  if (viewId === 'dashboard' && typeof Chart !== 'undefined') {
    requestAnimationFrame(() => {
      Chart.getChart('rainChart')?.resize();
      Chart.getChart('econChart')?.resize();
    });
  }
}

document.querySelectorAll('.tab').forEach(button => {
  if (button.classList.contains('active')) button.setAttribute('aria-current', 'true');
  button.addEventListener('click', () => showView(button.dataset.view));
});
document.querySelectorAll('[data-open-view]').forEach(button => {
  button.addEventListener('click', () => showView(button.dataset.openView));
});

function message(text, kind = '') {
  const element = document.createElement('p');
  element.className = `map-message ${kind}`.trim();
  element.textContent = text;
  element.setAttribute('role', 'status');
  return element;
}

async function getDistrictData() {
  let lastError;
  for (const url of geoUrls) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`GeoJSON ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data.features) || !data.features.length) throw new Error('GeoJSON ไม่มีข้อมูลเขต');
      return data;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

function initMap() {
  if (map) return;
  const list = document.getElementById('districtList');
  if (typeof L === 'undefined') {
    list.replaceChildren(message('โหลดแผนที่ไม่สำเร็จ โปรดตรวจการเชื่อมต่อแล้วรีเฟรชหน้าเว็บ', 'error'));
    return;
  }
  map = L.map('map', { zoomControl: false }).setView([13.7563, 100.60], 11);
  L.control.zoom({ position: 'bottomleft' }).addTo(map);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  loadDistricts();
}

async function loadDistricts() {
  const list = document.getElementById('districtList');
  list.replaceChildren(message('กำลังโหลดข้อมูลเขต…'));
  try {
    const data = await getDistrictData();
    districtLayers = {};
    if (geoLayer) map.removeLayer(geoLayer);
    geoLayer = L.geoJSON(data, {
      style: feature => {
        const reported = !!activeDistricts[feature.properties.dname_e];
        return {
          fillColor: reported ? '#eb5337' : '#81aeb2',
          fillOpacity: reported ? .7 : .3,
          color: '#ffffff',
          weight: 1.4
        };
      },
      onEachFeature: (feature, layer) => {
        const properties = feature.properties;
        const reported = activeDistricts[properties.dname_e];
        const name = reported ? reported.th : properties.dname.replace(/^เขต/, '');
        districtLayers[properties.dname_e] = layer;
        const tooltip = document.createElement('div');
        const title = document.createElement('strong');
        title.textContent = name;
        tooltip.append(title, document.createElement('br'));
        const detail = document.createElement('span');
        detail.textContent = reported
          ? `ยังมีรายงานน้ำท่วม — ${reported.note}`
          : 'ไม่มีรายงานยืนยันว่ายังท่วมในชุดข้อมูลล่าสุด';
        tooltip.append(detail);
        layer.bindTooltip(tooltip, { sticky: true });
        layer.on('mouseover', () => layer.setStyle({ weight: 2.5, color: '#1b6a74', fillOpacity: .83 }));
        layer.on('mouseout', () => geoLayer.resetStyle(layer));
      }
    }).addTo(map);
    map.fitBounds(geoLayer.getBounds(), { padding: [22, 22] });
    renderDistricts(data.features);
  } catch (error) {
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'retry';
    retry.textContent = 'ลองโหลดอีกครั้ง';
    retry.addEventListener('click', loadDistricts);
    list.replaceChildren(message('โหลดข้อมูลเขตไม่สำเร็จ โปรดตรวจการเชื่อมต่อ', 'error'), retry);
  }
}

function renderDistricts(features) {
  const list = document.getElementById('districtList');
  const search = document.getElementById('search');
  const districts = features.map(feature => {
    const en = feature.properties.dname_e;
    const reported = activeDistricts[en];
    return { en, th: reported ? reported.th : feature.properties.dname.replace(/^เขต/, ''), reported };
  }).sort((a, b) => Number(!!b.reported) - Number(!!a.reported) || a.th.localeCompare(b.th, 'th'));

  function draw() {
    const query = search.value.trim().toLowerCase();
    const matches = districts.filter(item => !query || item.th.includes(query) || item.en.toLowerCase().includes(query));
    if (!matches.length) {
      list.replaceChildren(message('ไม่พบเขตที่ค้นหา'));
      return;
    }
    list.replaceChildren(...matches.map(item => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'district';
      const dot = document.createElement('i');
      dot.style.background = item.reported ? '#eb5337' : '#81aeb2';
      dot.setAttribute('aria-hidden', 'true');
      const name = document.createElement('span');
      name.textContent = item.th;
      button.append(dot, name);
      if (item.reported) {
        const badge = document.createElement('span');
        badge.className = 'status';
        badge.textContent = 'ยังท่วม';
        button.append(badge);
      }
      button.addEventListener('click', () => {
        const layer = districtLayers[item.en];
        if (!layer) return;
        map.fitBounds(layer.getBounds(), { padding: [60, 60], maxZoom: 14 });
        layer.openTooltip();
      });
      return button;
    }));
  }
  search.oninput = draw;
  draw();
}

const activeTable = document.getElementById('activeTable');
activeTable.replaceChildren(...Object.values(activeDistricts).map(item => {
  const row = document.createElement('tr');
  const name = document.createElement('td');
  name.textContent = item.th;
  const state = document.createElement('td');
  const badge = document.createElement('span');
  badge.className = 'status';
  badge.textContent = 'ยังมีน้ำท่วม';
  state.append(badge);
  const note = document.createElement('td');
  note.textContent = item.note;
  row.append(name, state, note);
  return row;
}));

if (typeof Chart === 'undefined') {
  document.querySelectorAll('.chart').forEach(element => {
    element.replaceChildren(message('โหลดกราฟไม่สำเร็จ โปรดตรวจการเชื่อมต่อแล้วรีเฟรชหน้าเว็บ', 'error'));
  });
} else {
  Chart.defaults.color = '#557074';
  Chart.defaults.borderColor = '#d3e0e0';
  Chart.defaults.font.family = 'Noto Sans Thai, Sarabun, sans-serif';
  new Chart(document.getElementById('rainChart'), {
    type: 'bar',
    data: {
      labels: ['มีนบุรี', 'คลองสามวา', 'ลาดกระบัง'],
      datasets: [{ data: [101.5, 96.5, 86.5], backgroundColor: ['#eb5337', '#eaa548', '#257f8a'], borderRadius: 10 }]
    },
    options: {
      responsive: true,
      animation: false,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, title: { display: true, text: 'มิลลิเมตร' } }, x: { grid: { display: false } } }
    }
  });
  new Chart(document.getElementById('econChart'), {
    type: 'doughnut',
    data: {
      labels: ['กรุงเทพฯ', 'ภาคตะวันออก', 'ปริมณฑล', 'พื้นที่อื่น'],
      datasets: [{ data: [7014, 2976, 1839, 454], backgroundColor: ['#eb5337', '#257f8a', '#e5d82c', '#81aeb2'], borderColor: '#eef1ef', borderWidth: 3 }]
    },
    options: {
      responsive: true,
      animation: false,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16 } } }
    }
  });
}
