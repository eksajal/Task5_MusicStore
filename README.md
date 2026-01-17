# Procedural Music Store Showcase

A single-page application (SPA) that generates a deterministic music library using seeded random algorithms.

## 🚀 Quick Start
1. Clone the repository: `git clone [https://github.com/eksajal/Task5_MusicStore.git](https://github.com/eksajal/Task5_MusicStore.git)`
2. Install dependencies: `npm install`
3. Start the server: `npm start`
4. View the app: `http://localhost:3000`

## 🛠 Features
- **Deterministic Generation**: Every seed (64-bit) produces a unique but reproducible set of songs, artists, and covers.
- **Dual-Mode UI**: 
  - **Table View**: Paginated with expandable rows for details.
  - **Gallery View**: Infinite scrolling card layout.
- **Seeded Audio**: Uses `Tone.js` to synthesize melodies derived from song metadata.
- **Seeded Visuals**: Dynamic HTML5 Canvas generates album art on the fly.
- **Parameter Independence**: Changing "Likes" updates counts without regenerating song titles or artists.

## 📦 Tech Stack
- **Backend**: Node.js, Express, @faker-js/faker, Seedrandom
- **Frontend**: Tailwind CSS, Tone.js, HTML5 Canvas
