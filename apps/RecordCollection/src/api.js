const cover = (seed) => `https://picsum.photos/seed/${seed}/300/300`;

const DEMO_RELEASES = [
  { id: 1, title: 'Kind of Blue Skies', artist: 'The Modal Trio', year: 1961, label: 'Blue Note', genres: ['Jazz'], coverImage: cover('a1') },
  { id: 2, title: 'Wandering Static', artist: 'Nils Aho', year: 2018, label: 'Warp', genres: ['Electronic'], coverImage: cover('a2') },
  { id: 3, title: 'Low Country', artist: 'Marla Vance', year: 1974, label: 'Stax', genres: ['Soul'], coverImage: cover('a3') },
  { id: 4, title: 'Second Hand Sun', artist: 'The Alright', year: 1996, label: 'Sub Pop', genres: ['Rock'], coverImage: cover('a4') },
  { id: 5, title: 'Nightbus', artist: 'Kaito Reyes', year: 2021, label: 'Ghostly', genres: ['Electronic'], coverImage: cover('a5') },
  { id: 6, title: 'Salt Air', artist: 'June Pallas', year: 1988, label: 'ECM', genres: ['Jazz'], coverImage: cover('a6') },
  { id: 7, title: 'Concrete Garden', artist: 'Vero Line', year: 1979, label: 'Rough Trade', genres: ['Rock'], coverImage: cover('a7') },
  { id: 8, title: 'Paper Moons', artist: 'The Alright', year: 1998, label: 'Sub Pop', genres: ['Rock'], coverImage: cover('a8') }
];

export async function fetchCollection() {
  try {
    const res = await fetch('/api/collection');
    if (!res.ok) throw new Error('bad response');
    const data = await res.json();
    if (!data.releases || !data.releases.length) throw new Error('empty');
    return { releases: data.releases, isDemo: false };
  } catch {
    return { releases: DEMO_RELEASES, isDemo: true };
  }
}
