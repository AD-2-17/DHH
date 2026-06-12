// ─── ALBUM STORIES ─────────────────────────────────────────────────
// Researched backstories for the canon releases (sources: Wikipedia,
// Rolling Stone India, Billboard, The Indian Music Diaries, Outlook).
// storyFor(album) falls back to catalog metadata for everything else.

const norm = (s) =>
  (s || "").replace(/Δ/g, "a").replace(/\$/g, "s").normalize("NFKD")
    .replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

const S = {};
const put = (artist, title, story) => { S[norm(artist) + "|" + norm(title)] = story; };

/* ── Seedhe Maut ── */
put("Seedhe Maut", "Bayaan",
  "The debut that reset Delhi's standard. Two years in the making, released through Azadi Records in 2018 and produced front-to-back by Sez on the Beat, Bayaan turned the duo's SPIT DOPE cypher chemistry into a confessional, braggadocious statement — led by the single 'Shaktimaan'.");
put("Seedhe Maut", "Nayaab",
  "The sophomore album that proved Bayaan was no fluke. Nayaab ('rare') doubled down on dense, technical Hindi rap and cemented Encore ABJ and Calm as the sharpest pens in the subcontinent.");
put("Seedhe Maut", "Lunch Break",
  "An 18-track, zero-skip mixtape that pulled the entire scene onto one plate — KR$NA, Faris Shafi, Rawal, Yungsta, Sonnyjim and even Badshah show up. 'Khatta Flow', '11K' and 'Luka Chippi' ran the year 2023.");
put("Seedhe Maut", "Kshama",
  "One half of the duo's 2024 twin-release era. Kshama ('forgiveness') is the introspective face of the pair — patience, restraint and growth after a decade in the game.");
put("Seedhe Maut", "SHAKTI",
  "The other half of the 2024 twins — where Kshama forgives, SHAKTI ('power') swings. Aggressive, bass-heavy and built for the mosh pit.");
put("Seedhe Maut", "Nanchaku",
  "Delhi meets Pune: Seedhe Maut linking with MC STAN was the crossover the scene begged for — two schools of Indian rap snapping together like the weapon it's named after.");
put("Seedhe Maut", "101",
  "A statement single from the duo's early run — a crash course (a literal 101) in why two MCs trading bars over one beat beats anyone's solo show.");
put("Seedhe Maut", "Shaktimaan",
  "The lead single that announced Bayaan — flipping India's first superhero into a flex about being your own saviour, over a knocking Sez on the Beat instrumental.");
put("Seedhe Maut", "SHUTDOWN",
  "A 2024 warning shot dropped between the twin albums — the duo reminding everyone that even their loosies end careers.");
put("Seedhe Maut", "Namastute",
  "A folded-hands greeting with a smirk — Seedhe Maut at their most playful, packing double-time flows into a track that became a live-show staple.");

/* ── KR$NA ── */
put("KR$NA", "Still Here",
  "The title says it all — fifteen years after he started as Young Prozpekt, KR$NA dropped Still Here in 2021 at the peak of his beef era, with Badshah, Raftaar, Ikka, Karma and Rashmeet Kaur pulling up on the remix cut. Proof of longevity in a scene that forgets fast.");
put("KR$NA", "FAR FROM OVER",
  "A 2023 EP built on the Still Here thesis: the veteran refusing the rocking chair. Sharper, shorter, all teeth.");
put("KR$NA", "Time Will Tell",
  "KR$NA betting on the long game — a meditation on patience and receipts from one of the most technically feared MCs in India.");

/* ── MC STAN ── */
put("MC Stan", "Tadipaar",
  "Named after the externment order ('tadipaar') that exiled him from his own Pune basti, MC Stan's debut is a masterclass in lyrical storytelling — winding, multi-part songs over beats that sample traditional Indian instruments.");
put("MC Stan", "Insaan",
  "The follow-up Rolling Stone India called his moodiest work — growing up in the basti, then coping with fame that arrived overnight. Where Tadipaar swerved, Insaan cuts straight. It out-streamed pop records on release.");

/* ── DIVINE ── */
put("DIVINE", "Kohinoor",
  "DIVINE's debut album (October 2019), named after the diamond — 'a mountain of light' for the moment Indian hip-hop finally hit the limelight. The first Indian rap album to chart on Billboard's Top Albums.");
put("DIVINE", "Punya Paap",
  "Sin and virtue wrestle across DIVINE's 2020 sophomore album on Mass Appeal India — Nas's label. It chronicles the climb from Andheri East gullies to the top of the scene, and what it cost.");
put("DIVINE", "Gunehgar",
  "The 2022 album where gully rap went global on its own terms — Armani White and Grammy-winner Hit-Boy on the credits, Mumbai still in the DNA.");
put("DIVINE", "Street Dreams",
  "A 2024 collaboration project flexing how far the gully sound travels — DIVINE curating the next wave while still rapping like he's hungry.");
put("DIVINE", "Kaam 25 (Sacred Games)",
  "The Netflix Sacred Games anthem that put DIVINE's voice under every binge-watcher's skin in 2018.");

/* ── Talha Anjum / Talhah Yunus ── */
put("Talha Anjum", "Open Letter",
  "The Young Stunners co-founder's 2023 debut solo album — an open letter from Karachi that earned two Lux Style Award nominations and made Urdu rap's most-streamed voice impossible to ignore across the border.");
put("Talha Anjum", "My Terrible Mind",
  "The 2024 follow-up to Open Letter — Anjum turning the pen inward, anxiety and ambition trading verses.");

/* ── Emiway ── */
put("Emiway Bantai", "Malum Hai Na",
  "Emiway's 2021 debut album — fully independent, zero label, like everything he's built since 2013. The title is a shrug at every doubter: 'you already know.'");

/* ── Prabh Deep ── */
put("Seedhe Maut, Prabh Deep", "Class-Sikh Maut, Vol. II",
  "Azadi Records' two flagships — Prabh Deep and Seedhe Maut — on one track, a sequel to the label's founding mythology and a snapshot of New Delhi rap's golden run.");
put("Prabh Deep", "Bhram (Deluxe)",
  "Prabh Deep's noir concept work on illusion ('bhram') — Punjabi rap as cinema, expanded in its deluxe cut.");
put("Prabh Deep", "Tabia",
  "The 2021 album where Azadi's first flagbearer went fully self-produced — meditative, spiritual, and a clean break from gangsta-rap expectations.");
put("Prabh Deep", "K I N G",
  "A crown claimed quietly — Prabh Deep's 2021 EP arguing that the most dangerous king is the one who doesn't shout.");

/* ── more canon ── */
put("Naezy", "Maghreb",
  "The original Gully Boy's comeback EP — recorded after the film based on his life ran the box office. Maghreb ('sunset prayer') is Naezy reclaiming his own story from the cinema version.");
put("Raftaar", "Mr. Nair",
  "Raftaar's 2020 album wearing his real surname — the Kerala-born, Delhi-raised technician dropping the persona to talk legacy, industry and mentorship.");
put("Raftaar", "HARD DRIVE, Vol. 1",
  "A 2022 data-dump of pure rap — no film songs, no radio bait, just Raftaar emptying the vault for the heads.");
put("Raftaar", "Zero to Infinity",
  "Raftaar mapping the distance from Kerala to the top of Delhi rap — the title is the trajectory.");
put("King", "Champagne Talk",
  "The 2022 album that made King unavoidable — 'Maan Meri Jaan' alone did hundreds of millions of streams, and the album crossed 50 million within weeks (Outlook India). MTV Hustle alum to national headliner.");
put("King", "The Gorilla Bounce",
  "Pre-fame King at his hungriest — the 2021 album where the melodic bounce that later conquered the charts was first assembled.");
put("Ahmer, Sez on the Beat", "Little Kid, Big Dreams",
  "Kashmir's story told from inside — Ahmer's 2019 Azadi Records debut with Sez on the Beat, one of the bravest records in Indian rap.");
put("Dino James", "D",
  "Bhopal-born Dino James' 2022 album — spoken-word honesty about depression, family and survival, from the scene's most confessional voice.");
put("Hanumankind & Kalmi", "Big Dawgs",
  "Recorded with producer Kalmi and shot inside a maut ka kuan (Well of Death), Big Dawgs debuted at #57 on the Billboard Hot 100, peaked at #23, and cracked the Global 200's top ten — the biggest global moment Indian hip-hop has ever had (Billboard, 2024).");
put("Hanumankind", "Run It Up",
  "The 2025 follow-up to Big Dawgs — chenda drums and percussion straight out of Kerala under a Billboard-sized flex, proving the moment wasn't a fluke.");
put("Yashraj", "Takiya Kalaam",
  "Mumbai's Yashraj turning catchphrases ('takiya kalaam') into thesis statements — wordplay-dense rap that put him on every 'next up' list in 2022.");
put("Faris Shafi & Meesha Shafi", "Muaziz Saarif",
  "Faris Shafi with sister Meesha — Lahore satire so sharp the establishment never knows whether to laugh or sue. 'Muaziz Saarif' means 'respected sir', and he means it as a threat.");
put("MC Altaf", "Gully Gang Cypher, Vol. 2",
  "DIVINE's Gully Gang passing the mic down the lane — MC Altaf leading the next generation of Mumbai 17 rappers.");
put("Naezy", "Aane De",
  "The track that opens Gully Boy's universe — Naezy demanding entry for a whole class of kids the industry kept outside.");

const KIND_WORD = { ALBUM: "album", EP: "EP", SINGLE: "single" };

export function storyFor(album) {
  const hit = S[norm(album.artist) + "|" + norm(album.title)]
    || S[norm(album.artist.split(/[,&]/)[0]) + "|" + norm(album.title)];
  if (hit) return hit;
  if (album.story) return album.story;
  const k = KIND_WORD[album.kind] || "release";
  const t = album.tracks > 1 ? `${album.tracks} tracks of ` : "";
  return `A ${album.year} ${k} from ${album.artist} — ${t}${album.genre.toLowerCase()} that earned its place in the Desi Hip Hop canon. Tap play to hear why.`;
}
