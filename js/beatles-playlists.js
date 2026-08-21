/* ==========================================================
   WEBZONEBW — BEATLES PLAYLISTS & SOUND BOX AUDIO ENGINE
   6-Phase Master Journey (1964–1970) • 23 Key Tracks • Interactive Soundscape
   ========================================================== */

"use strict";

// The 23 Essential Tracks across the 6 Historical Phases
const BEATLES_23_MASTER_TRACKS = [
    // --- PHASE 1: Beatlemania Begins & Rise to Fame (1964) ---
    // Album: A Hard Day's Night (July 1964)
    {
        id: "p1-track-1",
        num: 1,
        phaseNum: 1,
        phaseName: "Phase 1: Beatlemania Begins & Rise to Fame (1964)",
        title: "I Want to Hold Your Hand",
        album: "A Hard Day's Night Era / Single",
        albumGroup: "A Hard Day's Night (July 1964)",
        year: 1964,
        releaseDate: "Dec 1963 / Feb 1964 US Break",
        duration: "2:26",
        keyNote: 392.00, // G
        scale: "G Major",
        chords: ["G", "D", "Em", "B7", "C"],
        tempo: 150,
        motifType: "rockBeat",
        melody: [392, 392, 440, 493.88, 523.25, 493.88, 392, 440],
        vocalLead: "John Lennon & Paul McCartney",
        description: "The global breakthrough anthem that launched Beatlemania in America and around the world."
    },
    {
        id: "p1-track-2",
        num: 2,
        phaseNum: 1,
        phaseName: "Phase 1: Beatlemania Begins & Rise to Fame (1964)",
        title: "She Loves You",
        album: "A Hard Day's Night Era / Past Masters",
        albumGroup: "A Hard Day's Night (July 1964)",
        year: 1964,
        releaseDate: "Aug 1963 / 1964",
        duration: "2:21",
        keyNote: 392.00, // G
        scale: "G Major 6th",
        chords: ["G", "Em7", "C", "D", "G6"],
        tempo: 152,
        motifType: "rockBeat",
        melody: [392, 440, 493.88, 587.33, 523.25, 493.88, 440, 392],
        vocalLead: "John Lennon & Paul McCartney",
        description: "Iconic 'Yeah, Yeah, Yeah!' hook with dynamic sixth-chord vocal harmony that changed pop music history."
    },
    {
        id: "p1-track-3",
        num: 3,
        phaseNum: 1,
        phaseName: "Phase 1: Beatlemania Begins & Rise to Fame (1964)",
        title: "Can't Buy Me Love",
        album: "A Hard Day's Night",
        albumGroup: "A Hard Day's Night (July 1964)",
        year: 1964,
        releaseDate: "July 1964",
        duration: "2:12",
        keyNote: 261.63, // C
        scale: "C Blues / Rock",
        chords: ["Em", "Am", "Em", "Am", "Dm7", "G7", "C7"],
        tempo: 172,
        motifType: "drivingRock",
        melody: [329.63, 440, 329.63, 440, 293.66, 392, 261.63, 329.63],
        vocalLead: "Paul McCartney",
        description: "Recorded in Paris at Pathé Marconi studios; features McCartney's explosive lead vocal and driving 12-bar rhythm."
    },
    {
        id: "p1-track-4",
        num: 4,
        phaseNum: 1,
        phaseName: "Phase 1: Beatlemania Begins & Rise to Fame (1964)",
        title: "A Hard Day's Night",
        album: "A Hard Day's Night",
        albumGroup: "A Hard Day's Night (July 1964)",
        year: 1964,
        releaseDate: "July 1964",
        duration: "2:34",
        keyNote: 293.66, // D/G
        scale: "G Mixolydian",
        chords: ["Fadd9/G", "G", "C", "D7", "Em"],
        tempo: 139,
        motifType: "openingChordRock",
        melody: [293.66, 392, 440, 523.25, 493.88, 392, 293.66, 392],
        vocalLead: "John Lennon & Paul McCartney",
        description: "Opened by the most famous and debated introductory chord in rock music played on Harrison's Rickenbacker 360/12."
    },
    {
        id: "p1-track-5",
        num: 5,
        phaseNum: 1,
        phaseName: "Phase 1: Beatlemania Begins & Rise to Fame (1964)",
        title: "And I Love Her",
        album: "A Hard Day's Night",
        albumGroup: "A Hard Day's Night (July 1964)",
        year: 1964,
        releaseDate: "July 1964",
        duration: "2:30",
        keyNote: 329.63, // E / F#m
        scale: "E Major / C#m",
        chords: ["F#m", "C#m", "B", "A", "G#m", "F#"],
        tempo: 112,
        motifType: "acousticBallad",
        melody: [370, 440, 554.37, 493.88, 440, 370, 329.63, 370],
        vocalLead: "Paul McCartney",
        description: "Delicate nylon-string acoustic ballad anchored by Ringo Starr's wooden claves and George's classical Spanish riffs."
    },

    // --- PHASE 2: Expanding Horizons (1964–1965) ---
    // Albums: Beatles for Sale (Dec 1964) & Help! (Aug 1965)
    {
        id: "p2-track-6",
        num: 6,
        phaseNum: 2,
        phaseName: "Phase 2: Expanding Horizons (1964–1965)",
        title: "Eight Days a Week",
        album: "Beatles for Sale",
        albumGroup: "Beatles for Sale (Dec 1964)",
        year: 1964,
        releaseDate: "Dec 1964",
        duration: "2:44",
        keyNote: 293.66, // D
        scale: "D Major",
        chords: ["D", "E", "G", "Bm", "A"],
        tempo: 138,
        motifType: "fadeinPop",
        melody: [293.66, 369.99, 440, 587.33, 440, 369.99, 293.66, 329.63],
        vocalLead: "John Lennon & Paul McCartney",
        description: "Notable for being the first pop song to use a studio fade-in intro; joyous harmonies over acoustic strums."
    },
    {
        id: "p2-track-7",
        num: 7,
        phaseNum: 2,
        phaseName: "Phase 2: Expanding Horizons (1964–1965)",
        title: "Ticket to Ride",
        album: "Help!",
        albumGroup: "Help! (Aug 1965)",
        year: 1965,
        releaseDate: "Aug 1965",
        duration: "3:10",
        keyNote: 440.00, // A
        scale: "A Major",
        chords: ["A", "Bm", "D", "E", "F#m"],
        tempo: 124,
        motifType: "heavyBeat",
        melody: [440, 554.37, 659.25, 554.37, 440, 493.88, 440, 369.99],
        vocalLead: "John Lennon",
        description: "Heavy chiming Rickenbacker guitar riff and stuttering drum pattern that Lennon described as 'one of the earliest heavy-metal records'."
    },
    {
        id: "p2-track-8",
        num: 8,
        phaseNum: 2,
        phaseName: "Phase 2: Expanding Horizons (1964–1965)",
        title: "Help!",
        album: "Help!",
        albumGroup: "Help! (Aug 1965)",
        year: 1965,
        releaseDate: "Aug 1965",
        duration: "2:19",
        keyNote: 440.00, // A
        scale: "A Major",
        chords: ["Bm", "G", "E7", "A", "C#m", "F#m", "D"],
        tempo: 190,
        motifType: "counterpointVocals",
        melody: [440, 493.88, 554.37, 659.25, 554.37, 493.88, 440, 415.30],
        vocalLead: "John Lennon",
        description: "An authentic cry for help from Lennon amidst fame pressures, wrapped in intricate descending vocal counter-melodies."
    },
    {
        id: "p2-track-9",
        num: 9,
        phaseNum: 2,
        phaseName: "Phase 2: Expanding Horizons (1964–1965)",
        title: "Yesterday",
        album: "Help!",
        albumGroup: "Help! (Aug 1965)",
        year: 1965,
        releaseDate: "Aug 1965",
        duration: "2:05",
        keyNote: 349.23, // F
        scale: "F Major (Tuned Down)",
        chords: ["F", "Em7", "A7", "Dm", "Bb", "C7"],
        tempo: 98,
        motifType: "stringQuartet",
        melody: [349.23, 329.63, 293.66, 261.63, 293.66, 329.63, 349.23, 293.66],
        vocalLead: "Paul McCartney",
        description: "The most covered song in recorded music history; pioneered classical string quartet arrangements in pop music."
    },

    // --- PHASE 3: Studio Innovation & Folk Transition (1965–1966) ---
    // Albums: Rubber Soul (Dec 1965) & Revolver (Aug 1966)
    {
        id: "p3-track-10",
        num: 10,
        phaseNum: 3,
        phaseName: "Phase 3: Studio Innovation & Folk Transition (1965–1966)",
        title: "Norwegian Wood (This Bird Has Flown)",
        album: "Rubber Soul",
        albumGroup: "Rubber Soul (Dec 1965)",
        year: 1965,
        releaseDate: "Dec 1965",
        duration: "2:05",
        keyNote: 293.66, // D
        scale: "D Mixolydian / Sitar",
        chords: ["D", "Dm", "G", "Em", "A7"],
        tempo: 176,
        motifType: "sitarAcoustic",
        melody: [293.66, 369.99, 440, 523.25, 493.88, 440, 369.99, 293.66],
        vocalLead: "John Lennon",
        description: "The first Western pop song to incorporate the Indian sitar, played by George Harrison; Dylan-influenced waltz storytelling."
    },
    {
        id: "p3-track-11",
        num: 11,
        phaseNum: 3,
        phaseName: "Phase 3: Studio Innovation & Folk Transition (1965–1966)",
        title: "In My Life",
        album: "Rubber Soul",
        albumGroup: "Rubber Soul (Dec 1965)",
        year: 1965,
        releaseDate: "Dec 1965",
        duration: "2:27",
        keyNote: 440.00, // A
        scale: "A Major",
        chords: ["A", "E", "F#m7", "A7", "D", "Dm"],
        tempo: 104,
        motifType: "baroqueHarpsichord",
        melody: [440, 554.37, 659.25, 554.37, 440, 369.99, 440, 493.88],
        vocalLead: "John Lennon",
        description: "Poignant lyrical reflection on memories and friends, featuring George Martin's sped-up Bach-style piano solo."
    },
    {
        id: "p3-track-12",
        num: 12,
        phaseNum: 3,
        phaseName: "Phase 3: Studio Innovation & Folk Transition (1965–1966)",
        title: "Eleanor Rigby",
        album: "Revolver",
        albumGroup: "Revolver (Aug 1966)",
        year: 1966,
        releaseDate: "Aug 1966",
        duration: "2:06",
        keyNote: 329.63, // E
        scale: "E Dorian",
        chords: ["Em", "C", "Em6", "Cmaj7"],
        tempo: 138,
        motifType: "baroqueStrings",
        melody: [329.63, 493.88, 523.25, 493.88, 392, 329.63, 293.66, 329.63],
        vocalLead: "Paul McCartney",
        description: "Double string octet scored by George Martin; a stark and poetic narrative about loneliness and forgotten lives."
    },
    {
        id: "p3-track-13",
        num: 13,
        phaseNum: 3,
        phaseName: "Phase 3: Studio Innovation & Folk Transition (1965–1966)",
        title: "Yellow Submarine",
        album: "Revolver",
        albumGroup: "Revolver (Aug 1966)",
        year: 1966,
        releaseDate: "Aug 1966",
        duration: "2:38",
        keyNote: 392.00, // G
        scale: "G Major",
        chords: ["G", "D", "C", "Em", "Am"],
        tempo: 110,
        motifType: "marchingFolk",
        melody: [392, 440, 493.88, 392, 440, 493.88, 587.33, 493.88],
        vocalLead: "Ringo Starr",
        description: "Whimsical singalong loaded with nautical sound effects, chains in bathtubs, foghorns, and Abbey Road brass bands."
    },

    // --- PHASE 4: The Psychedelic Era (1967) ---
    // Albums: Sgt. Pepper's Lonely Hearts Club Band (June 1967) & Magical Mystery Tour (Nov 1967)
    {
        id: "p4-track-14",
        num: 14,
        phaseNum: 4,
        phaseName: "Phase 4: The Psychedelic Era (1967)",
        title: "Strawberry Fields Forever",
        album: "Magical Mystery Tour",
        albumGroup: "Magical Mystery Tour (Nov 1967)",
        year: 1967,
        releaseDate: "Feb 1967 / Nov 1967",
        duration: "4:10",
        keyNote: 370.00, // Bb
        scale: "Bb / A (Variable Speed)",
        chords: ["Bb", "Fm7", "Eb", "F", "Gm", "C7"],
        tempo: 92,
        motifType: "mellotronPsychedelic",
        melody: [370, 466.16, 554.37, 466.16, 370, 311.13, 370, 415.30],
        vocalLead: "John Lennon",
        description: "Mellotron flute intro, reverse tape loops, Indian swarmandal, and two different takes merged at differing speeds."
    },
    {
        id: "p4-track-15",
        num: 15,
        phaseNum: 4,
        phaseName: "Phase 4: The Psychedelic Era (1967)",
        title: "Lucy in the Sky with Diamonds",
        album: "Sgt. Pepper's Lonely Hearts Club Band",
        albumGroup: "Sgt. Pepper's (June 1967)",
        year: 1967,
        releaseDate: "June 1967",
        duration: "3:28",
        keyNote: 440.00, // A
        scale: "A Major (Verse 3/4) / G (Chorus 4/4)",
        chords: ["A", "A/G", "F#m", "F", "C", "G", "D"],
        tempo: 125,
        motifType: "lowreyOrganFantasy",
        melody: [440, 554.37, 659.25, 554.37, 440, 349.23, 392, 440],
        vocalLead: "John Lennon",
        description: "Celeste-like Lowrey organ arpeggio, kaleidoscopic imagery inspired by Julian Lennon's nursery drawing and Alice in Wonderland."
    },
    {
        id: "p4-track-16",
        num: 16,
        phaseNum: 4,
        phaseName: "Phase 4: The Psychedelic Era (1967)",
        title: "All You Need Is Love",
        album: "Magical Mystery Tour",
        albumGroup: "Magical Mystery Tour (Nov 1967)",
        year: 1967,
        releaseDate: "July 1967 / Nov 1967",
        duration: "3:48",
        keyNote: 392.00, // G
        scale: "G Major (7/4 & 4/4 Time Signature)",
        chords: ["G", "D/F#", "Em", "C", "D7", "B7"],
        tempo: 104,
        motifType: "anthemBrass",
        melody: [392, 392, 440, 392, 523.25, 493.88, 392, 440],
        vocalLead: "John Lennon",
        description: "Composed for 'Our World'—the first live global satellite television broadcast reaching 400 million people worldwide."
    },
    {
        id: "p4-track-17",
        num: 17,
        phaseNum: 4,
        phaseName: "Phase 4: The Psychedelic Era (1967)",
        title: "Hello, Goodbye",
        album: "Magical Mystery Tour",
        albumGroup: "Magical Mystery Tour (Nov 1967)",
        year: 1967,
        releaseDate: "Nov 1967",
        duration: "3:28",
        keyNote: 261.63, // C
        scale: "C Major",
        chords: ["C", "G", "Am", "F", "Fm", "Ab", "Bb"],
        tempo: 102,
        motifType: "popChamberMaori",
        melody: [261.63, 329.63, 392, 523.25, 392, 329.63, 261.63, 293.66],
        vocalLead: "Paul McCartney",
        description: "Dual lyrical themes of duality and harmony, culminating in the joyous Hawaiian/Maori-style 'Hela Heba Hello-a' coda."
    },

    // --- PHASE 5: Experimental & Classic Rock (1968–1969) ---
    // Albums: The Beatles (White Album) (Nov 1968) & Abbey Road (Sept 1969)
    {
        id: "p5-track-18",
        num: 18,
        phaseNum: 5,
        phaseName: "Phase 5: Experimental & Classic Rock (1968–1969)",
        title: "Hey Jude",
        album: "The Beatles Era / Single",
        albumGroup: "The Beatles (White Album Era, 1968)",
        year: 1968,
        releaseDate: "Aug 1968",
        duration: "7:11",
        keyNote: 349.23, // F
        scale: "F Major / Eb",
        chords: ["F", "C", "C7", "Bb", "Eb", "F7"],
        tempo: 74,
        motifType: "pianoAnthem",
        melody: [349.23, 261.63, 293.66, 329.63, 349.23, 392, 440, 349.23],
        vocalLead: "Paul McCartney",
        description: "Written to console Julian Lennon; at over 7 minutes with a 36-piece orchestra singalong, it became their biggest worldwide hit."
    },
    {
        id: "p5-track-19",
        num: 19,
        phaseNum: 5,
        phaseName: "Phase 5: Experimental & Classic Rock (1968–1969)",
        title: "Get Back",
        album: "Let It Be Era / Single",
        albumGroup: "Abbey Road & Get Back Sessions (1969)",
        year: 1969,
        releaseDate: "April 1969",
        duration: "3:11",
        keyNote: 440.00, // A
        scale: "A Mixolydian",
        chords: ["A", "D", "G", "A7"],
        tempo: 123,
        motifType: "electricBluesRhodes",
        melody: [440, 440, 523.25, 440, 587.33, 440, 523.25, 392],
        vocalLead: "Paul McCartney",
        description: "Features Billy Preston on Fender Rhodes electric piano; performed live during the legendary Apple Rooftop concert."
    },
    {
        id: "p5-track-20",
        num: 20,
        phaseNum: 5,
        phaseName: "Phase 5: Experimental & Classic Rock (1968–1969)",
        title: "Come Together",
        album: "Abbey Road",
        albumGroup: "Abbey Road (Sept 1969)",
        year: 1969,
        releaseDate: "Sept 1969",
        duration: "4:19",
        keyNote: 293.66, // D
        scale: "D Minor / Blues",
        chords: ["Dm", "A", "G", "Bm", "A7"],
        tempo: 82,
        motifType: "swampRockBass",
        melody: [293.66, 349.23, 440, 523.25, 440, 349.23, 293.66, 220],
        vocalLead: "John Lennon",
        description: "Opening track of Abbey Road with McCartney's sliding bass riff, John's whispered 'Shoot me', and swamp-rock swagger."
    },
    {
        id: "p5-track-21",
        num: 21,
        phaseNum: 5,
        phaseName: "Phase 5: Experimental & Classic Rock (1968–1969)",
        title: "Here Comes The Sun",
        album: "Abbey Road",
        albumGroup: "Abbey Road (Sept 1969)",
        year: 1969,
        releaseDate: "Sept 1969",
        duration: "3:05",
        keyNote: 440.00, // A
        scale: "A Major (Capo 7th)",
        chords: ["A", "D", "E7", "G", "C", "B7"],
        tempo: 129,
        motifType: "acousticArpeggioMoog",
        melody: [440, 493.88, 554.37, 659.25, 554.37, 493.88, 440, 369.99],
        vocalLead: "George Harrison",
        description: "Written in Eric Clapton's sunlit garden; features intricate 11/8 and 15/8 time signatures and early Moog synthesizer sweeps."
    },

    // --- PHASE 6: The Final Chapter (1970) ---
    // Album: Let It Be (May 1970)
    {
        id: "p6-track-22",
        num: 22,
        phaseNum: 6,
        phaseName: "Phase 6: The Final Chapter (1970)",
        title: "Let It Be",
        album: "Let It Be",
        albumGroup: "Let It Be (May 1970)",
        year: 1970,
        releaseDate: "March 1970 / May 1970",
        duration: "4:03",
        keyNote: 261.63, // C
        scale: "C Major Gospel",
        chords: ["C", "G", "Am", "F", "Em", "Dm7"],
        tempo: 72,
        motifType: "gospelPiano",
        melody: [261.63, 329.63, 392, 440, 392, 329.63, 261.63, 293.66],
        vocalLead: "Paul McCartney",
        description: "Inspired by a dream of McCartney's late mother Mary; a transcendent secular gospel hymn of acceptance and peace."
    },
    {
        id: "p6-track-23",
        num: 23,
        phaseNum: 6,
        phaseName: "Phase 6: The Final Chapter (1970)",
        title: "The Long and Winding Road",
        album: "Let It Be",
        albumGroup: "Let It Be (May 1970)",
        year: 1970,
        releaseDate: "May 1970",
        duration: "3:38",
        keyNote: 311.13, // Eb
        scale: "Eb Major / Cm",
        chords: ["Eb", "Cm7", "Ab", "Bb", "Gm", "Fm7"],
        tempo: 64,
        motifType: "cinematicBallad",
        melody: [311.13, 392, 466.16, 523.25, 466.16, 392, 311.13, 349.23],
        vocalLead: "Paul McCartney",
        description: "The Beatles' 20th and final US Number One single; an emotionally charged, melancholy elegy marking the end of the band."
    }
];

// The 6 Distinct Historical Phases definition
const BEATLES_PHASES_DATA = [
    {
        phaseNum: 1,
        id: "phase-1",
        name: "Phase 1: Beatlemania Begins & Rise to Fame (1964)",
        shortName: "Phase 1: Beatlemania",
        era: "1964",
        albums: "A Hard Day's Night (July 1964)",
        badge: "Global Phenomenon",
        icon: "🎸",
        coverColor: "linear-gradient(135deg, #e11d48, #be123c, #4c0519)",
        desc: "The sheer electric energy that conquered world airwaves, movie theatres, and Ed Sullivan.",
        trackIds: ["p1-track-1", "p1-track-2", "p1-track-3", "p1-track-4", "p1-track-5"]
    },
    {
        phaseNum: 2,
        id: "phase-2",
        name: "Phase 2: Expanding Horizons (1964–1965)",
        shortName: "Phase 2: Expanding Horizons",
        era: "1964–1965",
        albums: "Beatles for Sale (Dec 1964) & Help! (Aug 1965)",
        badge: "Harmonic Maturity",
        icon: "🌅",
        coverColor: "linear-gradient(135deg, #d97706, #b45309, #78350f)",
        desc: "Folk introspection, acoustic 12-strings, and the revolutionary integration of classical string quartets.",
        trackIds: ["p2-track-6", "p2-track-7", "p2-track-8", "p2-track-9"]
    },
    {
        phaseNum: 3,
        id: "phase-3",
        name: "Phase 3: Studio Innovation & Folk Transition (1965–1966)",
        shortName: "Phase 3: Studio Innovation",
        era: "1965–1966",
        albums: "Rubber Soul (Dec 1965) & Revolver (Aug 1966)",
        badge: "Studio Metamorphosis",
        icon: "🌿",
        coverColor: "linear-gradient(135deg, #059669, #047857, #064e3b)",
        desc: "Retiring from touring to make the studio an instrument: Eastern sitars, string octets, and avant-garde tape loops.",
        trackIds: ["p3-track-10", "p3-track-11", "p3-track-12", "p3-track-13"]
    },
    {
        phaseNum: 4,
        id: "phase-4",
        name: "Phase 4: The Psychedelic Era (1967)",
        shortName: "Phase 4: Psychedelic Era",
        era: "1967",
        albums: "Sgt. Pepper's Lonely Hearts Club Band (June 1967) & Magical Mystery Tour (Nov 1967)",
        badge: "Summer of Love",
        icon: "🔮",
        coverColor: "linear-gradient(135deg, #7c3aed, #6d28d9, #4c1d95)",
        desc: "Mellotrons, kaleidoscopic surrealism, orchestral glissandos, and the first worldwide satellite broadcast.",
        trackIds: ["p4-track-14", "p4-track-15", "p4-track-16", "p4-track-17"]
    },
    {
        phaseNum: 5,
        id: "phase-5",
        name: "Phase 5: Experimental & Classic Rock (1968–1969)",
        shortName: "Phase 5: Classic Rock",
        era: "1968–1969",
        albums: "The Beatles (White Album) (Nov 1968) & Abbey Road (Sept 1969)",
        badge: "Peak Virtuosity",
        icon: "🦓",
        coverColor: "linear-gradient(135deg, #0284c7, #0369a1, #082f49)",
        desc: "Back to raw roots, blistering guitar harmonies, Moog synths, and the crowning Abbey Road suite.",
        trackIds: ["p5-track-18", "p5-track-19", "p5-track-20", "p5-track-21"]
    },
    {
        phaseNum: 6,
        id: "phase-6",
        name: "Phase 6: The Final Chapter (1970)",
        shortName: "Phase 6: The Final Chapter",
        era: "1970",
        albums: "Let It Be (May 1970)",
        badge: "Timeless Farewell",
        icon: "🏢",
        coverColor: "linear-gradient(135deg, #475569, #334155, #0f172a)",
        desc: "The rooftop concert, intimate stripped-back gospel keys, and the poignant closing chapter.",
        trackIds: ["p6-track-22", "p6-track-23"]
    }
];

// Curated Playlists Collection featuring the requested 6 Phases Master Playlist
const BEATLES_PLAYLISTS_DATA = [
    {
        id: "beatles-6-phases-complete",
        title: "The 6-Phase Evolution of The Beatles (1964–1970)",
        tagline: "The complete 23 key tracks across all 6 definitive historical phases.",
        era: "1964–1970",
        category: "Master",
        badge: "★ Complete 6 Phases",
        coverColor: "linear-gradient(135deg, #d4af37, #b45309, #1e1b4b, #0f172a)",
        icon: "👑",
        songs: BEATLES_23_MASTER_TRACKS
    },
    {
        id: "phase-1-playlist",
        title: "Phase 1: Beatlemania Begins & Rise to Fame (1964)",
        tagline: "Album: A Hard Day's Night (July 1964) — Tracks 1–5",
        era: "1964",
        category: "Phases",
        badge: "Phase 1",
        coverColor: "linear-gradient(135deg, #e11d48, #be123c, #4c0519)",
        icon: "🎸",
        songs: BEATLES_23_MASTER_TRACKS.filter(t => t.phaseNum === 1)
    },
    {
        id: "phase-2-playlist",
        title: "Phase 2: Expanding Horizons (1964–1965)",
        tagline: "Albums: Beatles for Sale (Dec 1964) & Help! (Aug 1965) — Tracks 6–9",
        era: "1964–1965",
        category: "Phases",
        badge: "Phase 2",
        coverColor: "linear-gradient(135deg, #d97706, #b45309, #78350f)",
        icon: "🌅",
        songs: BEATLES_23_MASTER_TRACKS.filter(t => t.phaseNum === 2)
    },
    {
        id: "phase-3-playlist",
        title: "Phase 3: Studio Innovation & Folk Transition (1965–1966)",
        tagline: "Albums: Rubber Soul (Dec 1965) & Revolver (Aug 1966) — Tracks 10–13",
        era: "1965–1966",
        category: "Phases",
        badge: "Phase 3",
        coverColor: "linear-gradient(135deg, #059669, #047857, #064e3b)",
        icon: "🌿",
        songs: BEATLES_23_MASTER_TRACKS.filter(t => t.phaseNum === 3)
    },
    {
        id: "phase-4-playlist",
        title: "Phase 4: The Psychedelic Era (1967)",
        tagline: "Albums: Sgt. Pepper's (June 1967) & Magical Mystery Tour (Nov 1967) — Tracks 14–17",
        era: "1967",
        category: "Phases",
        badge: "Phase 4",
        coverColor: "linear-gradient(135deg, #7c3aed, #6d28d9, #4c1d95)",
        icon: "🔮",
        songs: BEATLES_23_MASTER_TRACKS.filter(t => t.phaseNum === 4)
    },
    {
        id: "phase-5-playlist",
        title: "Phase 5: Experimental & Classic Rock (1968–1969)",
        tagline: "Albums: The Beatles (White Album, 1968) & Abbey Road (1969) — Tracks 18–21",
        era: "1968–1969",
        category: "Phases",
        badge: "Phase 5",
        coverColor: "linear-gradient(135deg, #0284c7, #0369a1, #082f49)",
        icon: "🦓",
        songs: BEATLES_23_MASTER_TRACKS.filter(t => t.phaseNum === 5)
    },
    {
        id: "phase-6-playlist",
        title: "Phase 6: The Final Chapter (1970)",
        tagline: "Album: Let It Be (May 1970) — Tracks 22–23",
        era: "1970",
        category: "Phases",
        badge: "Phase 6",
        coverColor: "linear-gradient(135deg, #475569, #334155, #0f172a)",
        icon: "🏢",
        songs: BEATLES_23_MASTER_TRACKS.filter(t => t.phaseNum === 6)
    }
];

// Rich Web Audio Musical Engine for Authentically Synthesized Beatles Motifs & Studio Console
class BeatlesAudioEngine {
    constructor() {
        this.tabId = "tab_" + Math.random().toString(36).substring(2, 9);
        this.ctx = null;
        this.masterGain = null;
        this.bassFilter = null;
        this.trebleFilter = null;
        this.cutoffFilter = null;
        this.pannerNode = null;
        this.delayNode = null;
        this.delayGain = null;
        this.crackleGain = null;
        this.crackleSource = null;

        // Custom File Audio Player Source
        this.customAudioElement = null;
        this.isCustomFilePlaying = false;
        this.customFileName = "";

        this.isPlaying = false;
        this.isMuted = false;
        this.volume = 0.75;
        this.activeSong = null;
        this.playbackProgress = 0;
        this.playbackDuration = 180;
        this.intervalId = null;
        this.melodyStep = 0;
        this.melodyTimer = null;
        this.currentNodes = [];

        // Engine Configuration & Slider Settings
        this.tempoMultiplier = 1.0;
        this.pitchShiftSemitones = 0;
        this.bassGainValue = 3.0; // dB
        this.trebleGainValue = 2.0; // dB
        this.filterCutoffFreq = 12000; // Hz
        this.reverbWet = 0.25;
        this.stereoPanValue = 0.0; // center
        this.crackleLevel = 0.12; // vinyl warmth
        this.waveformOverride = "auto"; // "auto", "sine", "triangle", "sawtooth", "square"

        // Multi-tab coordination
        this.isMasterEmitter = true;
        this.lastHeartbeatTime = Date.now();
        this.STORAGE_KEY = "webzonebw_beatles_sync_state";
        this.channel = null;

        // Suitable Built-in Soundscape Stems & Sound Library Files
        this.soundLibraryFiles = [
            {
                id: "file-stem-p1",
                name: "phase1_merseybeat_1964.wav",
                filePath: "assets/audio/phase1_merseybeat_1964.wav",
                label: "Phase 1: 1964 Merseybeat Studio Session",
                phaseNum: 1,
                era: "A Hard Day's Night Era",
                type: "Studio Analog Audio",
                size: "2.4 MB",
                duration: "0:14",
                description: "Cavern Club rhythm punch with twin-track vocal harmony & Rick 360 chime (WAV Audio).",
                preset: { waveform: "triangle", bass: 4, treble: 3, reverb: 0.15, tempo: 1.05, crackle: 0.18, pitch: 0 }
            },
            {
                id: "file-stem-p2",
                name: "phase2_folkrock_1965.wav",
                filePath: "assets/audio/phase2_folkrock_1965.wav",
                label: "Phase 2: 1965 Folk-Rock & 12-String Acoustic",
                phaseNum: 2,
                era: "Beatles for Sale & Help!",
                type: "Acoustic Warmth Audio",
                size: "2.4 MB",
                duration: "0:14",
                description: "J-160E acoustic resonance, subtle tape echo, and strings quartet (WAV Audio).",
                preset: { waveform: "sine", bass: 2, treble: 4, reverb: 0.3, tempo: 1.0, crackle: 0.15, pitch: 0 }
            },
            {
                id: "file-stem-p3",
                name: "phase3_studio_maturation_1966.wav",
                filePath: "assets/audio/phase3_studio_maturation_1966.wav",
                label: "Phase 3: 1966 Studio Chamber & Sitar Drone",
                phaseNum: 3,
                era: "Rubber Soul & Revolver",
                type: "Chamber & Sitar Audio",
                size: "2.4 MB",
                duration: "0:14",
                description: "Indian classical sitar drone, double-tracked guitars, and Leslie rotating speaker (WAV Audio).",
                preset: { waveform: "sawtooth", bass: 5, treble: 1, reverb: 0.45, tempo: 0.95, crackle: 0.12, pitch: 0 }
            },
            {
                id: "file-stem-p4",
                name: "phase4_psychedelia_1967.wav",
                filePath: "assets/audio/phase4_psychedelia_1967.wav",
                label: "Phase 4: 1967 Sgt. Pepper Mellotron & Tape Loops",
                phaseNum: 4,
                era: "Sgt. Pepper & Magical Mystery Tour",
                type: "Psychedelic Mellotron Audio",
                size: "2.4 MB",
                duration: "0:14",
                description: "Flute Mellotron samples, 4-track varispeed bounces, and orchestral crescendo (WAV Audio).",
                preset: { waveform: "sawtooth", bass: 6, treble: 5, reverb: 0.65, tempo: 0.9, crackle: 0.22, pitch: 0 }
            },
            {
                id: "file-stem-p5",
                name: "phase5_abbeyroad_1969.wav",
                filePath: "assets/audio/phase5_abbeyroad_1969.wav",
                label: "Phase 5: 1968–69 Abbey Road Moog & Solid State",
                phaseNum: 5,
                era: "The White Album & Abbey Road",
                type: "Moog & Solid State Audio",
                size: "2.4 MB",
                duration: "0:14",
                description: "TG12345 solid-state desk warmth, Moog modular synth, and Les Paul overdrive (WAV Audio).",
                preset: { waveform: "square", bass: 7, treble: 6, reverb: 0.35, tempo: 1.0, crackle: 0.08, pitch: 0 }
            },
            {
                id: "file-stem-p6",
                name: "phase6_letitbe_1970.wav",
                filePath: "assets/audio/phase6_letitbe_1970.wav",
                label: "Phase 6: 1970 Rooftop Concert & Gospel Piano",
                phaseNum: 6,
                era: "Let It Be",
                type: "Live Rooftop Direct Audio",
                size: "2.4 MB",
                duration: "0:14",
                description: "Direct Fender Rhodes electric piano, open-air wind hiss, and Bluthner piano (WAV Audio).",
                preset: { waveform: "triangle", bass: 4, treble: 2, reverb: 0.2, tempo: 0.98, crackle: 0.14, pitch: 0 }
            }
        ];

        this.initCrossTabSync();
        this.restorePersistedState();
    }

    initCrossTabSync() {
        if ("BroadcastChannel" in window) {
            try {
                this.channel = new BroadcastChannel("webzonebw_audio_sync");
                this.channel.onmessage = (event) => this.handleChannelMessage(event.data);
            } catch (e) {
                console.warn("BroadcastChannel not available:", e);
            }
        }

        window.addEventListener("storage", (e) => {
            if (e.key === this.STORAGE_KEY && e.newValue) {
                try {
                    const data = JSON.parse(e.newValue);
                    if (data.emitterTabId !== this.tabId) {
                        this.syncFromExternalState(data);
                    }
                } catch (err) {}
            }
        });

        // Visibility & keep-alive: Prevent audio from suspending when switching tabs
        document.addEventListener("visibilitychange", () => {
            if (this.isPlaying && this.isMasterEmitter && this.ctx && this.ctx.state === "suspended") {
                this.ctx.resume().catch(() => {});
            }
        });

        // Save progress before page transition
        window.addEventListener("beforeunload", () => {
            this.persistState();
            if (this.channel && this.isMasterEmitter) {
                this.channel.postMessage({
                    type: "EMITTER_UNLOAD",
                    tabId: this.tabId,
                    state: this.getExportableState()
                });
            }
        });

        // Heartbeat listener: Detect if previous emitter is dead
        setInterval(() => {
            if (!this.isMasterEmitter && this.isPlaying) {
                if (Date.now() - this.lastHeartbeatTime > 3000) {
                    // Previous emitter tab was closed -> take over sound synthesis!
                    this.isMasterEmitter = true;
                    this.resume();
                }
            }
        }, 1500);
    }

    handleChannelMessage(msg) {
        if (!msg || msg.tabId === this.tabId) return;

        switch (msg.type) {
            case "PLAY":
                this.isMasterEmitter = false;
                this.isPlaying = true;
                this.activeSong = msg.song || this.activeSong;
                this.playbackProgress = msg.progress || 0;
                this.playbackDuration = msg.duration || this.playbackDuration;
                this.updateAllConnectedUI();
                break;

            case "PAUSE":
                this.isPlaying = false;
                this.stopAudioNodes();
                this.updateAllConnectedUI();
                break;

            case "HEARTBEAT":
                this.lastHeartbeatTime = Date.now();
                this.isPlaying = msg.isPlaying;
                this.playbackProgress = msg.progress;
                this.playbackDuration = msg.duration;
                if (msg.songId && (!this.activeSong || this.activeSong.id !== msg.songId)) {
                    this.activeSong = BEATLES_23_MASTER_TRACKS.find(t => t.id === msg.songId) || this.activeSong;
                }
                this.updateAllConnectedUI();
                break;

            case "EMITTER_UNLOAD":
                if (this.isPlaying) {
                    this.isMasterEmitter = true;
                    this.syncFromExternalState(msg.state);
                    this.resume();
                }
                break;

            case "SEEK":
                this.playbackProgress = msg.progress;
                if (this.isMasterEmitter && this.isPlaying) {
                    this.resume();
                }
                this.updateAllConnectedUI();
                break;

            case "VOLUME":
                this.volume = msg.volume;
                this.isMuted = msg.isMuted;
                this.updateAllConnectedUI();
                break;
        }
    }

    broadcast(type, payload = {}) {
        const fullPayload = {
            type,
            tabId: this.tabId,
            songId: this.activeSong ? this.activeSong.id : null,
            progress: this.playbackProgress,
            duration: this.playbackDuration,
            isPlaying: this.isPlaying,
            isMuted: this.isMuted,
            volume: this.volume,
            ...payload
        };

        if (this.channel) {
            try {
                this.channel.postMessage(fullPayload);
            } catch (e) {}
        }
        this.persistState();
    }

    persistState() {
        try {
            const data = this.getExportableState();
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (e) {}
    }

    getExportableState() {
        return {
            emitterTabId: this.tabId,
            songId: this.activeSong ? this.activeSong.id : "p1-track-1",
            isPlaying: this.isPlaying,
            progress: this.playbackProgress,
            duration: this.playbackDuration,
            volume: this.volume,
            isMuted: this.isMuted,
            isCustomFile: this.isCustomFilePlaying,
            customFileName: this.customFileName,
            tempo: this.tempoMultiplier,
            pitch: this.pitchShiftSemitones,
            bass: this.bassGainValue,
            treble: this.trebleGainValue,
            reverb: this.reverbWet,
            crackle: this.crackleLevel,
            waveform: this.waveformOverride,
            updatedAt: Date.now()
        };
    }

    restorePersistedState() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (raw) {
                const data = JSON.parse(raw);
                if (data.songId) {
                    this.activeSong = BEATLES_23_MASTER_TRACKS.find(t => t.id === data.songId) || BEATLES_23_MASTER_TRACKS[0];
                }
                if (data.volume !== undefined) this.volume = data.volume;
                if (data.isMuted !== undefined) this.isMuted = data.isMuted;
                if (data.progress !== undefined) this.playbackProgress = data.progress;
                if (data.duration !== undefined) this.playbackDuration = data.duration;
                if (data.tempo !== undefined) this.tempoMultiplier = data.tempo;
                if (data.pitch !== undefined) this.pitchShiftSemitones = data.pitch;
                if (data.bass !== undefined) this.bassGainValue = data.bass;
                if (data.treble !== undefined) this.trebleGainValue = data.treble;
                if (data.reverb !== undefined) this.reverbWet = data.reverb;
                if (data.crackle !== undefined) this.crackleLevel = data.crackle;
                if (data.waveform !== undefined) this.waveformOverride = data.waveform;

                // If music was actively playing less than 8 seconds ago (e.g. user navigated pages)
                const elapsedSinceUpdate = Date.now() - (data.updatedAt || 0);
                if (data.isPlaying && elapsedSinceUpdate < 15000) {
                    this.isPlaying = true;
                    // Resume on first user interaction or right away if context allowed
                    const tryAutoResume = () => {
                        this.init();
                        if (this.ctx && this.ctx.state === "running") {
                            this.resume();
                        }
                    };
                    tryAutoResume();
                    window.addEventListener("click", () => {
                        if (this.isPlaying && (!this.ctx || this.ctx.state === "suspended")) {
                            this.init();
                            this.resume();
                        }
                    }, { once: true });
                }
            }
        } catch (e) {}
    }

    syncFromExternalState(data) {
        if (!data) return;
        if (data.songId && (!this.activeSong || this.activeSong.id !== data.songId)) {
            this.activeSong = BEATLES_23_MASTER_TRACKS.find(t => t.id === data.songId) || this.activeSong;
        }
        if (data.progress !== undefined) this.playbackProgress = data.progress;
        if (data.duration !== undefined) this.playbackDuration = data.duration;
        this.isPlaying = !!data.isPlaying;
        if (data.volume !== undefined) this.volume = data.volume;
        if (data.isMuted !== undefined) this.isMuted = data.isMuted;
        this.updateAllConnectedUI();
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === "suspended") {
            this.ctx.resume().catch(() => {});
        }
        this.setupAudioChain();
    }

    setupAudioChain() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // Master Gain
        if (!this.masterGain) {
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.22, now);
        }

        // Bass Filter (Low Shelf at 150 Hz)
        if (!this.bassFilter) {
            this.bassFilter = this.ctx.createBiquadFilter();
            this.bassFilter.type = "lowshelf";
            this.bassFilter.frequency.setValueAtTime(150, now);
            this.bassFilter.gain.setValueAtTime(this.bassGainValue, now);
        }

        // Treble Filter (High Shelf at 3500 Hz)
        if (!this.trebleFilter) {
            this.trebleFilter = this.ctx.createBiquadFilter();
            this.trebleFilter.type = "highshelf";
            this.trebleFilter.frequency.setValueAtTime(3500, now);
            this.trebleFilter.gain.setValueAtTime(this.trebleGainValue, now);
        }

        // Cutoff Lowpass Filter
        if (!this.cutoffFilter) {
            this.cutoffFilter = this.ctx.createBiquadFilter();
            this.cutoffFilter.type = "lowpass";
            this.cutoffFilter.frequency.setValueAtTime(this.filterCutoffFreq, now);
        }

        // Stereo Panner (if supported)
        if (!this.pannerNode && this.ctx.createStereoPanner) {
            try {
                this.pannerNode = this.ctx.createStereoPanner();
                this.pannerNode.pan.setValueAtTime(this.stereoPanValue, now);
            } catch (e) {}
        }

        // Ambient Feedback Delay (Reverb Simulation)
        if (!this.delayNode) {
            this.delayNode = this.ctx.createDelay();
            this.delayNode.delayTime.setValueAtTime(0.28, now);
            this.delayGain = this.ctx.createGain();
            this.delayGain.gain.setValueAtTime(this.reverbWet * 0.4, now);

            this.delayNode.connect(this.delayGain);
            this.delayGain.connect(this.delayNode); // feedback loop
        }

        // Chain Connections: MasterGain -> Bass -> Treble -> Cutoff -> (Panner) -> Destination
        try {
            this.masterGain.disconnect();
            this.bassFilter.disconnect();
            this.trebleFilter.disconnect();
            this.cutoffFilter.disconnect();

            this.masterGain.connect(this.bassFilter);
            this.bassFilter.connect(this.trebleFilter);
            this.trebleFilter.connect(this.cutoffFilter);

            if (this.pannerNode) {
                this.pannerNode.disconnect();
                this.cutoffFilter.connect(this.pannerNode);
                this.pannerNode.connect(this.ctx.destination);
                if (this.delayNode && this.delayGain) {
                    this.pannerNode.connect(this.delayNode);
                    this.delayGain.connect(this.ctx.destination);
                }
            } else {
                this.cutoffFilter.connect(this.ctx.destination);
                if (this.delayNode && this.delayGain) {
                    this.cutoffFilter.connect(this.delayNode);
                    this.delayGain.connect(this.ctx.destination);
                }
            }
        } catch (e) {}

        this.startVinylCrackle();
    }

    startVinylCrackle() {
        if (!this.ctx || this.crackleSource) return;
        try {
            const bufferSize = this.ctx.sampleRate * 2;
            const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            let b0 = 0, b1 = 0, b2 = 0;

            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                let pink = b0 + b1 + b2 + white * 0.5362;
                if (Math.random() < 0.001) {
                    pink += (Math.random() - 0.5) * 3.5;
                }
                output[i] = pink * 0.04;
            }

            this.crackleSource = this.ctx.createBufferSource();
            this.crackleSource.buffer = noiseBuffer;
            this.crackleSource.loop = true;

            this.crackleGain = this.ctx.createGain();
            this.crackleGain.gain.setValueAtTime(this.isPlaying ? this.crackleLevel * 0.35 : 0, this.ctx.currentTime);

            this.crackleSource.connect(this.crackleGain);
            this.crackleGain.connect(this.ctx.destination);
            this.crackleSource.start();
        } catch (e) {}
    }

    playSong(song, onProgress, onEnded) {
        this.init();
        this.stopAudioNodes();
        clearInterval(this.intervalId);
        this.isMasterEmitter = true;
        this.isCustomFilePlaying = false;
        this.activeSong = song;
        this.isPlaying = true;
        this.playbackProgress = 0;
        this.melodyStep = 0;

        const parts = (song.duration || "3:00").split(":");
        this.playbackDuration = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);

        if (this.crackleGain && this.ctx) {
            this.crackleGain.gain.setValueAtTime(this.crackleLevel * 0.35, this.ctx.currentTime);
        }

        this.startPolyphonicMotif(song);
        this.broadcast("PLAY", { song, progress: 0, duration: this.playbackDuration });

        this.intervalId = setInterval(() => {
            if (!this.isPlaying) return;
            this.playbackProgress++;
            if (onProgress) {
                onProgress(this.playbackProgress, this.playbackDuration);
            }
            this.updateAllConnectedUI();

            // Emit heartbeat to other open tabs every 1 second
            this.broadcast("HEARTBEAT");

            if (this.playbackProgress >= this.playbackDuration) {
                this.stop();
                if (onEnded) onEnded();
            }
        }, 1000);
    }

    startPolyphonicMotif(song) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        this.setupAudioChain();

        const pitchRatio = Math.pow(2, this.pitchShiftSemitones / 12);
        const baseFreq = (song.keyNote || 392) * pitchRatio;
        const tempo = (song.tempo || 120) * this.tempoMultiplier;
        const stepInterval = Math.max(100, (60 / tempo) * 500);

        // 1. Warm Analog Chord Pad
        const intervals = [1, 1.25, 1.5, 2.0];
        intervals.forEach((ratio, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            if (this.waveformOverride !== "auto") {
                osc.type = this.waveformOverride;
            } else if (song.phaseNum === 4) {
                osc.type = "sawtooth";
            } else if (song.phaseNum === 3) {
                osc.type = idx === 1 ? "triangle" : "sine";
            } else if (song.phaseNum === 6) {
                osc.type = "triangle";
            } else {
                osc.type = idx % 2 === 0 ? "triangle" : "sine";
            }

            osc.frequency.setValueAtTime(baseFreq * ratio, now);

            const lfo = this.ctx.createOscillator();
            const lfoGain = this.ctx.createGain();
            lfo.frequency.setValueAtTime(3.2 + idx * 0.4, now);
            lfoGain.gain.setValueAtTime(1.4, now);
            lfo.connect(osc.frequency);
            lfo.start();

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.22 / (idx + 1), now + 0.35);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start();

            this.currentNodes.push(osc, lfo, gain);
        });

        // 2. Dynamic Arpeggio & Melodic Note Engine
        const melodyNotes = song.melody && song.melody.length > 0
            ? song.melody.map(f => f * pitchRatio)
            : [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2];

        this.melodyTimer = setInterval(() => {
            if (!this.isPlaying || !this.ctx) return;
            try {
                const noteTime = this.ctx.currentTime;
                const freq = melodyNotes[this.melodyStep % melodyNotes.length];
                this.melodyStep++;

                const leadOsc = this.ctx.createOscillator();
                const leadGain = this.ctx.createGain();

                if (this.waveformOverride !== "auto") {
                    leadOsc.type = this.waveformOverride;
                } else {
                    leadOsc.type = song.phaseNum === 4 ? "triangle" : "sine";
                }
                leadOsc.frequency.setValueAtTime(freq, noteTime);

                leadGain.gain.setValueAtTime(0.01, noteTime);
                leadGain.gain.exponentialRampToValueAtTime(0.2, noteTime + 0.05);
                leadGain.gain.exponentialRampToValueAtTime(0.001, noteTime + (stepInterval / 1000) * 0.9);

                leadOsc.connect(leadGain);
                leadGain.connect(this.masterGain);

                leadOsc.start(noteTime);
                leadOsc.stop(noteTime + (stepInterval / 1000));
            } catch (e) {}
        }, stepInterval);
    }

    playAudioUrl(url, fileName, onProgress, onEnded) {
        this.init();
        this.stop();
        this.isMasterEmitter = true;
        this.isCustomFilePlaying = true;
        this.customFileName = fileName || url.split("/").pop();

        if (!this.customAudioElement) {
            this.customAudioElement = new Audio();
        }

        this.customAudioElement.src = url;
        this.customAudioElement.volume = this.isMuted ? 0 : this.volume;
        this.isPlaying = true;

        this.customAudioElement.onloadedmetadata = () => {
            this.playbackDuration = Math.floor(this.customAudioElement.duration) || 180;
            this.broadcast("PLAY", { isCustomFile: true, customFileName: this.customFileName, duration: this.playbackDuration });
        };

        this.customAudioElement.ontimeupdate = () => {
            if (this.customAudioElement) {
                this.playbackProgress = Math.floor(this.customAudioElement.currentTime);
                if (onProgress) {
                    onProgress(this.playbackProgress, this.playbackDuration);
                }
                this.updateAllConnectedUI();
                this.broadcast("HEARTBEAT");
            }
        };

        this.customAudioElement.onended = () => {
            this.isPlaying = false;
            if (onEnded) onEnded();
            this.updateAllConnectedUI();
        };

        this.customAudioElement.play().catch(e => {
            console.warn("Autoplay prevented:", e);
        });
    }

    playCustomAudioFile(file, onProgress, onEnded) {
        this.init();
        this.stop();
        this.isMasterEmitter = true;
        this.isCustomFilePlaying = true;
        this.customFileName = file.name;

        if (!this.customAudioElement) {
            this.customAudioElement = new Audio();
        }

        const objectUrl = URL.createObjectURL(file);
        this.customAudioElement.src = objectUrl;
        this.customAudioElement.volume = this.isMuted ? 0 : this.volume;
        this.isPlaying = true;

        this.customAudioElement.onloadedmetadata = () => {
            this.playbackDuration = Math.floor(this.customAudioElement.duration) || 180;
            this.broadcast("PLAY", { isCustomFile: true, customFileName: file.name, duration: this.playbackDuration });
        };

        this.customAudioElement.ontimeupdate = () => {
            if (this.customAudioElement) {
                this.playbackProgress = Math.floor(this.customAudioElement.currentTime);
                if (onProgress) {
                    onProgress(this.playbackProgress, this.playbackDuration);
                }
                this.updateAllConnectedUI();
                this.broadcast("HEARTBEAT");
            }
        };

        this.customAudioElement.onended = () => {
            this.isPlaying = false;
            if (onEnded) onEnded();
            this.updateAllConnectedUI();
        };

        this.customAudioElement.play().catch(e => {
            console.warn("Autoplay prevented:", e);
        });
    }

    pause() {
        this.isPlaying = false;
        if (this.isCustomFilePlaying && this.customAudioElement) {
            this.customAudioElement.pause();
        }
        if (this.crackleGain && this.ctx) {
            this.crackleGain.gain.setValueAtTime(0, this.ctx.currentTime);
        }
        this.stopAudioNodes();
        clearInterval(this.intervalId);
        this.broadcast("PAUSE");
        this.updateAllConnectedUI();
    }

    resume(onProgress, onEnded) {
        this.init();
        this.isPlaying = true;
        this.isMasterEmitter = true;

        if (this.isCustomFilePlaying && this.customAudioElement) {
            this.customAudioElement.play();
            this.broadcast("PLAY", { isCustomFile: true, customFileName: this.customFileName });
            return;
        }

        if (!this.activeSong) {
            this.activeSong = BEATLES_23_MASTER_TRACKS[0];
        }

        if (this.crackleGain && this.ctx) {
            this.crackleGain.gain.setValueAtTime(this.crackleLevel * 0.35, this.ctx.currentTime);
        }
        this.startPolyphonicMotif(this.activeSong);
        this.broadcast("PLAY", { song: this.activeSong, progress: this.playbackProgress, duration: this.playbackDuration });

        clearInterval(this.intervalId);
        this.intervalId = setInterval(() => {
            if (!this.isPlaying) return;
            this.playbackProgress++;
            if (onProgress) {
                onProgress(this.playbackProgress, this.playbackDuration);
            }
            this.updateAllConnectedUI();
            this.broadcast("HEARTBEAT");

            if (this.playbackProgress >= this.playbackDuration) {
                this.stop();
                if (onEnded) onEnded();
            }
        }, 1000);
        this.updateAllConnectedUI();
    }

    stop() {
        this.isPlaying = false;
        clearInterval(this.intervalId);
        clearInterval(this.melodyTimer);
        if (this.customAudioElement) {
            this.customAudioElement.pause();
            this.customAudioElement.currentTime = 0;
        }
        if (this.crackleGain && this.ctx) {
            this.crackleGain.gain.setValueAtTime(0, this.ctx.currentTime);
        }
        this.stopAudioNodes();
        this.broadcast("PAUSE");
        this.updateAllConnectedUI();
    }

    stopAudioNodes() {
        clearInterval(this.melodyTimer);
        if (this.currentNodes && this.currentNodes.length > 0) {
            this.currentNodes.forEach(node => {
                try {
                    if (node.stop) node.stop();
                    if (node.disconnect) node.disconnect();
                } catch (e) {}
            });
            this.currentNodes = [];
        }
    }

    // Slider Controls & Real-time EQ updates
    setVolume(val) {
        this.volume = Math.max(0, Math.min(1, val));
        this.isMuted = this.volume === 0;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.22, this.ctx.currentTime);
        }
        if (this.customAudioElement) {
            this.customAudioElement.volume = this.isMuted ? 0 : this.volume;
        }
        this.broadcast("VOLUME", { volume: this.volume, isMuted: this.isMuted });
    }

    setBassGain(db) {
        this.bassGainValue = Number(db);
        if (this.bassFilter && this.ctx) {
            this.bassFilter.gain.setValueAtTime(this.bassGainValue, this.ctx.currentTime);
        }
        this.persistState();
    }

    setTrebleGain(db) {
        this.trebleGainValue = Number(db);
        if (this.trebleFilter && this.ctx) {
            this.trebleFilter.gain.setValueAtTime(this.trebleGainValue, this.ctx.currentTime);
        }
        this.persistState();
    }

    setFilterCutoff(freq) {
        this.filterCutoffFreq = Number(freq);
        if (this.cutoffFilter && this.ctx) {
            this.cutoffFilter.frequency.setValueAtTime(this.filterCutoffFreq, this.ctx.currentTime);
        }
        this.persistState();
    }

    setReverbWet(val) {
        this.reverbWet = Number(val);
        if (this.delayGain && this.ctx) {
            this.delayGain.gain.setValueAtTime(this.reverbWet * 0.45, this.ctx.currentTime);
        }
        this.persistState();
    }

    setStereoPan(val) {
        this.stereoPanValue = Number(val);
        if (this.pannerNode && this.ctx) {
            this.pannerNode.pan.setValueAtTime(this.stereoPanValue, this.ctx.currentTime);
        }
        this.persistState();
    }

    setCrackleLevel(val) {
        this.crackleLevel = Number(val);
        if (this.crackleGain && this.ctx) {
            this.crackleGain.gain.setValueAtTime(this.isPlaying ? this.crackleLevel * 0.35 : 0, this.ctx.currentTime);
        }
        this.persistState();
    }

    setTempoMultiplier(val) {
        this.tempoMultiplier = Number(val);
        if (this.isPlaying && this.activeSong && !this.isCustomFilePlaying && this.isMasterEmitter) {
            clearInterval(this.melodyTimer);
            this.stopAudioNodes();
            this.startPolyphonicMotif(this.activeSong);
        }
        this.persistState();
    }

    setPitchShift(semitones) {
        this.pitchShiftSemitones = Number(semitones);
        if (this.isPlaying && this.activeSong && !this.isCustomFilePlaying && this.isMasterEmitter) {
            this.stopAudioNodes();
            this.startPolyphonicMotif(this.activeSong);
        }
        this.persistState();
    }

    setWaveform(type) {
        this.waveformOverride = type;
        if (this.isPlaying && this.activeSong && !this.isCustomFilePlaying && this.isMasterEmitter) {
            this.stopAudioNodes();
            this.startPolyphonicMotif(this.activeSong);
        }
        this.persistState();
    }

    applyPreset(preset) {
        if (!preset) return;
        if (preset.waveform) this.waveformOverride = preset.waveform;
        if (preset.bass !== undefined) this.setBassGain(preset.bass);
        if (preset.treble !== undefined) this.setTrebleGain(preset.treble);
        if (preset.reverb !== undefined) this.setReverbWet(preset.reverb);
        if (preset.tempo !== undefined) this.setTempoMultiplier(preset.tempo);
        if (preset.crackle !== undefined) this.setCrackleLevel(preset.crackle);
        if (preset.pitch !== undefined) this.setPitchShift(preset.pitch);
    }

    exportSettingsJSON() {
        const config = {
            appName: "WEBZONEBW Beatles Sound Box",
            version: "2.5",
            exportedAt: new Date().toISOString(),
            settings: {
                volume: this.volume,
                tempoMultiplier: this.tempoMultiplier,
                pitchShiftSemitones: this.pitchShiftSemitones,
                bassGainValue: this.bassGainValue,
                trebleGainValue: this.trebleGainValue,
                filterCutoffFreq: this.filterCutoffFreq,
                reverbWet: this.reverbWet,
                stereoPanValue: this.stereoPanValue,
                crackleLevel: this.crackleLevel,
                waveformOverride: this.waveformOverride
            }
        };
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "beatles_soundbox_synth_preset.json";
        a.click();
        URL.revokeObjectURL(url);
    }

    exportChordsJSON() {
        const data = {
            title: "The 6-Phase Evolution of The Beatles (1964–1970) — Master Chord & Lead Sheets",
            totalTracks: BEATLES_23_MASTER_TRACKS.length,
            phases: BEATLES_PHASES_DATA,
            tracks: BEATLES_23_MASTER_TRACKS
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "beatles_23_key_tracks_chords.json";
        a.click();
        URL.revokeObjectURL(url);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.22, this.ctx.currentTime);
        }
        if (this.customAudioElement) {
            this.customAudioElement.volume = this.isMuted ? 0 : this.volume;
        }
        this.broadcast("VOLUME", { volume: this.volume, isMuted: this.isMuted });
        return this.isMuted;
    }

    updateAllConnectedUI() {
        // Sync Global Floating Mini Player Dock
        if (window.GlobalAudioDock) {
            window.GlobalAudioDock.update();
        }
        // If on soundbox page and global update function registered
        if (window.onSoundBoxAudioEngineUpdate) {
            window.onSoundBoxAudioEngineUpdate();
        }
    }
}

// Global Sound Box Controller Instance
window.BeatlesSoundBox = {
    masterTracks: BEATLES_23_MASTER_TRACKS,
    phases: BEATLES_PHASES_DATA,
    playlists: BEATLES_PLAYLISTS_DATA,
    engine: new BeatlesAudioEngine(),
    activePlaylistId: "beatles-6-phases-complete",
    activeSongId: "p1-track-1",
    activePhaseFilter: "all",
    isShuffle: false,
    isRepeat: false,
    favorites: JSON.parse(localStorage.getItem("webzonebw_beatles_favs") || "[]"),

    getPlaylist(id) {
        return this.playlists.find(p => p.id === id) || this.playlists[0];
    },

    getCurrentSong() {
        const pl = this.getPlaylist(this.activePlaylistId);
        return pl.songs.find(s => s.id === this.activeSongId) || pl.songs[0];
    },

    getSongById(id) {
        return this.masterTracks.find(s => s.id === id) || this.masterTracks[0];
    },

    toggleFavorite(songId) {
        const idx = this.favorites.indexOf(songId);
        if (idx > -1) {
            this.favorites.splice(idx, 1);
        } else {
            this.favorites.push(songId);
        }
        localStorage.setItem("webzonebw_beatles_favs", JSON.stringify(this.favorites));
        return this.isFavorite(songId);
    },

    isFavorite(songId) {
        return this.favorites.includes(songId);
    }
};

/* ==========================================================
   GLOBAL PERSISTENT FLOATING AUDIO DOCK COMPONENT
   Attaches to all pages across WEBZONEBW to provide continuous music
   ========================================================== */

window.GlobalAudioDock = {
    dockEl: null,
    minimized: false,

    init() {
        if (document.getElementById("globalAudioDock")) {
            this.dockEl = document.getElementById("globalAudioDock");
            this.bindEvents();
            return;
        }

        const dock = document.createElement("div");
        dock.id = "globalAudioDock";
        dock.className = "global-audio-dock";
        dock.setAttribute("role", "region");
        dock.setAttribute("aria-label", "Global Beatles Music Player");

        // Determine link path to soundbox.html depending on whether inside subfolder
        const isSubfolder = window.location.pathname.includes("/halloween/");
        const soundboxUrl = isSubfolder ? "../soundbox.html" : "soundbox.html";

        dock.innerHTML = `
            <div class="global-dock-vinyl" id="gDockVinyl" title="Toggle Play/Pause">
                <div class="global-dock-label">🍏</div>
            </div>
            <div class="global-dock-info">
                <span class="global-dock-title" id="gDockTitle">I Want to Hold Your Hand</span>
                <span class="global-dock-sub" id="gDockSub">Phase 1 • Beatlemania (1964)</span>
            </div>
            <div class="global-dock-controls">
                <button type="button" class="global-dock-btn" id="gDockPrev" title="Previous Track" aria-label="Previous Track">⏮</button>
                <button type="button" class="global-dock-btn main-play" id="gDockPlay" title="Play / Pause" aria-label="Play / Pause">▶</button>
                <button type="button" class="global-dock-btn" id="gDockNext" title="Next Track" aria-label="Next Track">⏭</button>
            </div>
            <div class="global-dock-scrub">
                <span id="gDockCurrent">0:00</span>
                <div class="global-dock-bar-wrap" id="gDockBarWrap" title="Seek Audio">
                    <div class="global-dock-bar-fill" id="gDockBarFill"></div>
                </div>
                <span id="gDockTotal">2:26</span>
            </div>
            <a href="${soundboxUrl}" class="global-dock-link" title="Open Full Sound Box Studio">
                <span>🎵 Studio</span>
            </a>
            <button type="button" class="global-dock-close" id="gDockClose" title="Hide/Close Mini Player" aria-label="Hide Mini Player">✕</button>
        `;

        document.body.appendChild(dock);
        this.dockEl = dock;
        this.bindEvents();
        this.update();
    },

    bindEvents() {
        if (!this.dockEl) return;
        const engine = window.BeatlesSoundBox.engine;

        const playBtn = document.getElementById("gDockPlay");
        const vinyl = document.getElementById("gDockVinyl");
        const prevBtn = document.getElementById("gDockPrev");
        const nextBtn = document.getElementById("gDockNext");
        const barWrap = document.getElementById("gDockBarWrap");
        const closeBtn = document.getElementById("gDockClose");

        const togglePlay = () => {
            if (engine.isPlaying) {
                engine.pause();
            } else {
                if (!engine.activeSong) {
                    engine.activeSong = window.BeatlesSoundBox.masterTracks[0];
                }
                engine.resume();
            }
            this.update();
        };

        if (playBtn) playBtn.addEventListener("click", togglePlay);
        if (vinyl) vinyl.addEventListener("click", togglePlay);

        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                const tracks = window.BeatlesSoundBox.masterTracks;
                const currId = engine.activeSong ? engine.activeSong.id : tracks[0].id;
                const idx = tracks.findIndex(t => t.id === currId);
                const prevIdx = (idx - 1 + tracks.length) % tracks.length;
                engine.playSong(tracks[prevIdx]);
                this.update();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                const tracks = window.BeatlesSoundBox.masterTracks;
                const currId = engine.activeSong ? engine.activeSong.id : tracks[0].id;
                const idx = tracks.findIndex(t => t.id === currId);
                const nextIdx = (idx + 1) % tracks.length;
                engine.playSong(tracks[nextIdx]);
                this.update();
            });
        }

        if (barWrap) {
            barWrap.addEventListener("click", (e) => {
                const rect = barWrap.getBoundingClientRect();
                const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                if (engine.playbackDuration) {
                    engine.playbackProgress = Math.floor(ratio * engine.playbackDuration);
                    engine.broadcast("SEEK", { progress: engine.playbackProgress });
                    this.update();
                }
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                if (engine.isPlaying) {
                    engine.pause();
                }
                this.dockEl.style.display = "none";
            });
        }
    },

    update() {
        if (!this.dockEl) return;
        const engine = window.BeatlesSoundBox.engine;
        const song = engine.activeSong || window.BeatlesSoundBox.masterTracks[0];

        const titleEl = document.getElementById("gDockTitle");
        const subEl = document.getElementById("gDockSub");
        const playBtn = document.getElementById("gDockPlay");
        const vinyl = document.getElementById("gDockVinyl");
        const currEl = document.getElementById("gDockCurrent");
        const totalEl = document.getElementById("gDockTotal");
        const fillEl = document.getElementById("gDockBarFill");

        if (titleEl) {
            titleEl.textContent = engine.isCustomFilePlaying
                ? (engine.customFileName || "Custom Audio File")
                : (song ? song.title : "The Beatles");
        }

        if (subEl) {
            subEl.textContent = engine.isCustomFilePlaying
                ? "Custom Studio Upload"
                : (song ? `${song.phaseName.split(":")[0]} • ${song.year}` : "6-Phase Journey");
        }

        if (playBtn) {
            playBtn.textContent = engine.isPlaying ? "⏸" : "▶";
            playBtn.setAttribute("aria-label", engine.isPlaying ? "Pause Music" : "Play Music");
        }

        if (vinyl) {
            vinyl.classList.toggle("spinning", engine.isPlaying);
        }

        const format = (s) => {
            const m = Math.floor(s / 60);
            const sec = s % 60;
            return `${m}:${sec < 10 ? "0" : ""}${sec}`;
        };

        if (currEl) currEl.textContent = format(engine.playbackProgress || 0);
        if (totalEl) totalEl.textContent = format(engine.playbackDuration || 180);

        if (fillEl && engine.playbackDuration) {
            const pct = Math.min(100, (engine.playbackProgress / engine.playbackDuration) * 100);
            fillEl.style.width = `${pct}%`;
        }

        // On soundbox.html, hide the global dock if the main player hero is in view
        if (window.location.pathname.endsWith("soundbox.html") || window.location.pathname === "/soundbox") {
            const hero = document.querySelector(".soundbox-player-hero");
            if (hero && window.scrollY < 400) {
                this.dockEl.style.display = "none";
                return;
            }
        }

        this.dockEl.style.display = "flex";
    }
};

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
    try {
        window.GlobalAudioDock.init();
        // Listen to scroll to show/hide dock conditionally on soundbox page
        window.addEventListener("scroll", () => {
            if (window.GlobalAudioDock) {
                window.GlobalAudioDock.update();
            }
        });
    } catch (e) {
        console.warn("GlobalAudioDock initialization:", e);
    }
});

