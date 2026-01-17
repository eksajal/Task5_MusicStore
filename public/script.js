let state = {
    seed: "123456",
    locale: "en",
    likes: 3.7,
    page: 1,
    view: "table",
    loading: false,
    hasMore: true
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadData();
});

function setupEventListeners() {
    const inputs = {
        seed: document.getElementById('seed'),
        locale: document.getElementById('locale'),
        likes: document.getElementById('likes'),
        viewTable: document.getElementById('viewTable'),
        viewGallery: document.getElementById('viewGallery'),
        shuffle: document.getElementById('shuffleSeed')
    };

    inputs.seed.oninput = (e) => updateParam('seed', e.target.value);
    inputs.locale.onchange = (e) => updateParam('locale', e.target.value);
    inputs.likes.oninput = (e) => {
        document.getElementById('likesVal').innerText = e.target.value;
        updateParam('likes', e.target.value);
    };
    
    inputs.shuffle.onclick = () => {
        const newSeed = Math.floor(Math.random() * 1000000).toString();
        inputs.seed.value = newSeed;
        updateParam('seed', newSeed);
    };

    inputs.viewTable.onclick = () => switchView('table');
    inputs.viewGallery.onclick = () => switchView('gallery');

    // Infinite Scroll Observer
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && state.view === 'gallery' && !state.loading) {
            state.page++;
            loadData(true);
        }
    }, { threshold: 0.1 });
    observer.observe(document.getElementById('sentinel'));
}

// --- Core Logic ---

async function updateParam(key, value) {
    state[key] = value;
    state.page = 1;
    state.hasMore = true;
    window.scrollTo(0, 0);
    loadData();
}

function switchView(viewType) {
    state.view = viewType;
    state.page = 1;
    
    // UI Toggle logic
    document.getElementById('viewTable').classList.toggle('bg-white', viewType === 'table');
    document.getElementById('viewGallery').classList.toggle('bg-white', viewType === 'gallery');
    
    loadData();
}

async function loadData(append = false) {
    state.loading = true;
    const url = `/api/songs?seed=${state.seed}&locale=${state.locale}&page=${state.page}&likes=${state.likes}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        render(data, append);
    } catch (err) {
        console.error("Fetch error:", err);
    } finally {
        state.loading = false;
    }
}

// --- Rendering ---

function render(songs, append) {
    const container = document.getElementById('displayArea');
    if (!append) container.innerHTML = '';

    if (state.view === 'table') {
        renderTable(songs, container);
    } else {
        renderGallery(songs, container);
    }
}

function renderTable(songs, container) {
    let table = document.querySelector('table');
    if (!table) {
        container.innerHTML = `
            <table class="w-full text-left border-collapse bg-white shadow-md rounded-lg overflow-hidden">
                <thead class="bg-gray-200">
                    <tr>
                        <th class="p-3">#</th>
                        <th class="p-3">Title</th>
                        <th class="p-3">Artist</th>
                        <th class="p-3">Album</th>
                        <th class="p-3">Likes</th>
                    </tr>
                </thead>
                <tbody id="tableBody"></tbody>
            </table>`;
        table = document.getElementById('tableBody');
    }

    songs.forEach(song => {
        const row = document.createElement('tr');
        row.className = "border-t hover:bg-blue-50 cursor-pointer transition";
        row.innerHTML = `
            <td class="p-3 font-mono text-sm">${song.index}</td>
            <td class="p-3 font-bold">${song.title}</td>
            <td class="p-3">${song.artist}</td>
            <td class="p-3 text-gray-500">${song.album}</td>
            <td class="p-3">❤️ ${song.likes}</td>
        `;
        row.onclick = () => toggleRowDetails(row, song);
        table.appendChild(row);
    });
}

function renderGallery(songs, container) {
    let grid = document.getElementById('galleryGrid');
    if (!grid) {
        container.innerHTML = `<div id="galleryGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"></div>`;
        grid = document.getElementById('galleryGrid');
    }

    songs.forEach(song => {
        const card = document.createElement('div');
        card.className = "bg-white p-4 rounded-xl shadow hover:shadow-lg transition flex flex-col items-center text-center";
        const canvasId = `canvas-gal-${song.index}`;
        
        // Escape quotes for the onclick function
        const escapedTitle = song.title.replace(/'/g, "\\'");

        card.innerHTML = `
            <canvas id="${canvasId}" width="200" height="200" class="rounded-lg mb-4 w-full aspect-square"></canvas>
            <h3 class="font-bold text-lg leading-tight truncate w-full">${song.title}</h3>
            <p class="text-sm text-gray-600 mb-2">${song.artist}</p>
            <div class="mt-auto w-full flex justify-between items-center pt-3 border-t">
                <span class="text-xs font-semibold px-2 py-1 bg-gray-100 rounded">${song.genre}</span>
                <button onclick="playSong('${escapedTitle}')" class="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm">▶ Play</button>
            </div>
        `;
        grid.appendChild(card);
        drawCover(canvasId, song.title, song.artist, song.seedContext);
    });
}

// --- Specialized Components ---

function toggleRowDetails(row, song) {
    const nextRow = row.nextElementSibling;
    if (nextRow && nextRow.classList.contains('detail-row')) {
        nextRow.remove();
        return;
    }

    const detailRow = document.createElement('tr');
    detailRow.className = "detail-row bg-gray-50 border-t";
    const canvasId = `canvas-table-${song.index}`;
    
    // Crucial: Escape single quotes for the inline onclick handler
    const escapedTitle = song.title.replace(/'/g, "\\'");

    detailRow.innerHTML = `
        <td colspan="5" class="p-6">
            <div class="flex flex-col md:flex-row gap-8 items-center">
                <canvas id="${canvasId}" width="200" height="200" class="shadow-xl rounded-lg"></canvas>
                <div class="flex-grow">
                    <h2 class="text-2xl font-bold mb-1">${song.title}</h2>
                    <p class="text-xl text-gray-700 mb-4">${song.artist} — ${song.album}</p>
                    <div class="bg-white p-4 rounded border italic text-gray-600 mb-4">"${song.review}"</div>
                    <button onclick="playSong('${escapedTitle}')" class="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700">
                        Play Preview
                    </button>
                </div>
            </div>
        </td>
    `;
    row.after(detailRow);
    drawCover(canvasId, song.title, song.artist, song.seedContext);
}

function drawCover(canvasId, title, artist, seed) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rng = new Math.seedrandom(seed);

    // Dynamic background
    const baseHue = Math.floor(rng() * 360);
    const grd = ctx.createLinearGradient(0, 0, 200, 200);
    grd.addColorStop(0, `hsl(${baseHue}, 60%, 50%)`);
    grd.addColorStop(1, `hsl(${(baseHue + 40) % 360}, 60%, 20%)`);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 200, 200);

    // Abstract shapes
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = "white";
    for(let i=0; i<3; i++) {
        ctx.beginPath();
        ctx.arc(rng()*200, rng()*200, rng()*100, 0, Math.PI*2);
        ctx.fill();
    }
    
    // Text rendering
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = "white";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 4;
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(title.substring(0, 20), 15, 170);
    ctx.font = "12px sans-serif";
    ctx.fillText(artist.substring(0, 25), 15, 185);
}

async function playSong(title) {
    // 1. Unlocks Audio Context for the browser
    await Tone.start();
    
    // 2. Create synthesis
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    const now = Tone.now();
    
    // Seeded melody logic
    const notes = ["C4", "E4", "G4", "B4", "D5", "A4"];
    for (let i = 0; i < 4; i++) {
        const charCode = title.charCodeAt(i) || 65;
        const note = notes[charCode % notes.length];
        synth.triggerAttackRelease(note, "8n", now + i * 0.25);
    }
}