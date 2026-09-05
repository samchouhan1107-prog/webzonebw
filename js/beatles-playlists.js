/* ==========================================================
   WEBZONEBW — SITE-WIDE SOUND BOX PLAYER
   ==========================================================
   File:
       js/webzonebw-player.js

   Purpose:
       • Persistent WEBZONEBW music player
       • Beatles playlist integration
       • Previous / Play / Next
       • Progress control
       • Volume control
       • Track information
       • Playlist drawer
       • Session playback memory
       • Automatic next-track playback
       • Missing-file protection
       • Mobile responsive player
       • Works with existing WEBZONEBW theme

   AUDIO LOCATION:
       assets/audio/

   IMPORTANT:
       Supports playlist properties:
       • audio
       • audioFile
       • audioPath
       • src
       • url
   ========================================================== */

"use strict";

(function () {

    /* ======================================================
       CONFIGURATION
       ====================================================== */

    const CONFIG = {

        version: "2.0.0",

        storageKey: "webzonebw_soundbox_state",

        playerId: "webzonebwGlobalPlayer",

        audioId: "webzonebwGlobalAudio",

        defaultVolume: 0.8,

        autoPlayNext: true,

        rememberPosition: true,

        rememberTrack: true,

        showOnAllPages: true,

        playlistSource: "beatles-playlists.js"

    };


    /* ======================================================
       PLAYER STATE
       ====================================================== */

    const state = {

        playlist: [],

        currentIndex: 0,

        isPlaying: false,

        duration: 0,

        currentTime: 0,

        volume: CONFIG.defaultVolume,

        muted: false,

        initialized: false,

        // Compact corner player is the default; visitors can expand it when needed.
        expanded: true,

        savedPosition: 0,

        // Retain whether the visitor was listening before navigating to a new page.
        resumeOnLoad: false

    };


    /* ======================================================
       DOM REFERENCES
       ====================================================== */

    let player = null;
    let audio = null;

    let titleElement = null;
    let artistElement = null;
    let albumElement = null;

    let playButton = null;
    let previousButton = null;
    let nextButton = null;
    let muteButton = null;

    let progressRange = null;
    let volumeRange = null;

    let currentTimeElement = null;
    let durationElement = null;

    let playlistPanel = null;
    let playlistButton = null;
    let playlistCloseButton = null;

    let minimizeButton = null;


    /* ======================================================
       UTILITY
       ====================================================== */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function formatTime(seconds) {

        if (!Number.isFinite(seconds) || seconds < 0) {
            return "0:00";
        }

        const minutes = Math.floor(seconds / 60);

        const remainingSeconds =
            Math.floor(seconds % 60)
                .toString()
                .padStart(2, "0");

        return `${minutes}:${remainingSeconds}`;

    }


    function getAudioPath(track) {

        if (!track || typeof track !== "object") {
            return "";
        }

        /*
         * Your Beatles playlist uses:
         *
         * audioFile
         * audioPath
         * fileName
         *
         * The player also supports older/common names.
         */

        return (
            track.audio ||
            track.audioFile ||
            track.audioPath ||
            track.src ||
            track.url ||
            ""
        );

    }


    function normalizeAudioPath(path) {

        if (!path) {
            return "";
        }

        let normalized =
            String(path).trim();

        /*
         * Root-relative resolution.
         *
         * Relative "assets/..." paths break on sub-page
         * routes such as /er/index.html, where the browser
         * resolves them to /er/assets/... and gets a 404.
         * Audio lives at the site root, so anchor these
         * paths to "/" regardless of the current page.
         */
        if (
            normalized.startsWith("assets/") &&
            !/^(https?:|\/|data:|blob:)/i.test(normalized)
        ) {

            normalized = "/" + normalized;

        }

        return normalized;

    }


    function getTrackId(track) {

        if (!track || typeof track !== "object") {
            return "";
        }

        return (
            track.id ||
            track.slug ||
            track.fileName ||
            track.title ||
            ""
        );

    }


    function normalizeTrack(track) {

        if (!track || typeof track !== "object") {
            return null;
        }

        const audioPath =
            normalizeAudioPath(
                getAudioPath(track)
            );

        const normalized = {

            id:
                getTrackId(track) ||
                `track-${Math.random()
                    .toString(36)
                    .slice(2)}`,

            num:
                track.num ||
                "",

            phaseNum:
                track.phaseNum ||
                "",

            phaseName:
                track.phaseName ||
                "",

            title:
                track.title ||
                track.name ||
                "Unknown Track",

            artist:
                track.artist ||
                track.artistName ||
                "The Beatles",

            album:
                track.album ||
                track.albumName ||
                "",

            albumGroup:
                track.albumGroup ||
                "",

            year:
                track.year ||
                "",

            releaseDate:
                track.releaseDate ||
                "",

            duration:
                track.duration ||
                "",

            audio:
                audioPath,

            audioFile:
                track.audioFile ||
                "",

            audioPath:
                track.audioPath ||
                "",

            fileName:
                track.fileName ||
                "",

            audioType:
                track.audioType ||
                "mp3",

            hasAudioFile:
                track.hasAudioFile !== false,

            audioAvailable:
                track.audioAvailable !== false,

            cover:
                track.cover ||
                track.coverArt ||
                track.image ||
                "",

            description:
                track.description ||
                "",

            vocalLead:
                track.vocalLead ||
                "",

            tempo:
                track.tempo ||
                "",

            keyNote:
                track.keyNote ||
                "",

            scale:
                track.scale ||
                "",

            chords:
                Array.isArray(track.chords)
                    ? track.chords
                    : [],

            motifType:
                track.motifType ||
                "",

            melody:
                Array.isArray(track.melody)
                    ? track.melody
                    : []

        };

        return normalized;

    }


    /* ======================================================
       PLAYLIST DISCOVERY
       ====================================================== */

    function discoverPlaylist() {

        /*
         * Check the global names used by different
         * versions of beatles-playlists.js.
         */

        const candidates = [

            window.beatlesPlaylist,

            window.beatlesPlaylists,

            window.BEATLES_PLAYLIST,

            window.BEATLES_PLAYLISTS,

            window.BeatlesPlaylist,

            window.BeatlesPlaylists,

            window.beatlesTracks,

            window.BEATLES_TRACKS,

            window.beatlesSongs,

            window.BEATLES_SONGS

        ];


        /* --------------------------------------------------
           Direct arrays
           -------------------------------------------------- */

        for (const candidate of candidates) {

            if (
                Array.isArray(candidate) &&
                candidate.length
            ) {

                const tracks =
                    candidate
                        .map(normalizeTrack)
                        .filter(
                            track =>
                                track &&
                                track.audio
                        );

                if (tracks.length) {

                    state.playlist = tracks;

                    console.info(
                        "[WEBZONEBW Sound Box]",
                        `Loaded ${tracks.length} tracks.`
                    );

                    return true;

                }

            }

        }


        /* --------------------------------------------------
           Nested playlist objects
           -------------------------------------------------- */

        for (const candidate of candidates) {

            if (
                candidate &&
                typeof candidate === "object" &&
                !Array.isArray(candidate)
            ) {

                const possibleArrays = [

                    candidate.tracks,

                    candidate.playlist,

                    candidate.songs,

                    candidate.items,

                    candidate.beatles,

                    candidate.albums,

                    candidate.entries,

                    candidate.data

                ];


                for (const list of possibleArrays) {

                    if (
                        Array.isArray(list) &&
                        list.length
                    ) {

                        const tracks =
                            list
                                .map(normalizeTrack)
                                .filter(
                                    track =>
                                        track &&
                                        track.audio
                                );

                        if (tracks.length) {

                            state.playlist =
                                tracks;

                            console.info(
                                "[WEBZONEBW Sound Box]",
                                `Loaded ${tracks.length} tracks.`
                            );

                            return true;

                        }

                    }

                }

            }

        }


        return false;

    }


    /* ======================================================
       FALLBACK TRACK
       ====================================================== */

    function createFallbackPlaylist() {

        /*
         * IMPORTANT:
         * Your audio files are directly inside:
         *
         * assets/audio/
         */

        state.playlist = [

            {

                id:
                    "p5-track-20",

                num:
                    20,

                phaseNum:
                    5,

                phaseName:
                    "Phase 5: Experimental & Classic Rock (1968–1969)",

                title:
                    "Come Together",

                artist:
                    "The Beatles",

                album:
                    "Abbey Road",

                albumGroup:
                    "Abbey Road (Sept 1969)",

                year:
                    1969,

                releaseDate:
                    "Sept 1969",

                duration:
                    "4:19",

                audioFile:
                    "/assets/audio/The Beatles - Come Together.mp3",

                audioPath:
                    "/assets/audio/The Beatles - Come Together.mp3",

                fileName:
                    "The Beatles - Come Together.mp3",

                audio:
                    "/assets/audio/The Beatles - Come Together.mp3",

                audioType:
                    "mp3",

                hasAudioFile:
                    true,

                audioAvailable:
                    true,

                keyNote:
                    293.66,

                scale:
                    "D Minor / Blues",

                chords: [
                    "Dm",
                    "A",
                    "G",
                    "Bm",
                    "A7"
                ],

                tempo:
                    82,

                motifType:
                    "swampRockBass",

                melody: [
                    293.66,
                    349.23,
                    440,
                    523.25,
                    440,
                    349.23,
                    293.66,
                    220
                ],

                vocalLead:
                    "John Lennon",

                description:
                    "Opening track of Abbey Road with McCartney's sliding bass riff, John's whispered 'Shoot me', and swamp-rock swagger."

            }

        ];

    }


    /* ======================================================
       STORAGE
       ====================================================== */

    function loadSavedState() {

        try {

            const raw =
                sessionStorage.getItem(
                    CONFIG.storageKey
                );

            if (!raw) {
                return;
            }

            const saved =
                JSON.parse(raw);


            if (
                CONFIG.rememberTrack &&
                Number.isInteger(
                    saved.currentIndex
                ) &&
                saved.currentIndex >= 0 &&
                saved.currentIndex <
                    state.playlist.length
            ) {

                state.currentIndex =
                    saved.currentIndex;

            }


            if (
                CONFIG.rememberPosition &&
                Number.isFinite(
                    saved.currentTime
                ) &&
                saved.currentTime >= 0
            ) {

                state.savedPosition =
                    saved.currentTime;

                state.currentTime =
                    saved.currentTime;

            }


            if (
                Number.isFinite(
                    saved.volume
                ) &&
                saved.volume >= 0 &&
                saved.volume <= 1
            ) {

                state.volume =
                    saved.volume;

            }

            state.resumeOnLoad = saved.isPlaying === true;

        } catch (error) {

            console.warn(
                "[WEBZONEBW Sound Box] Unable to restore session state.",
                error
            );

        }

    }


    function saveState() {

        try {

            sessionStorage.setItem(

                CONFIG.storageKey,

                JSON.stringify({

                    currentIndex:
                        CONFIG.rememberTrack
                            ? state.currentIndex
                            : 0,

                    currentTime:
                        CONFIG.rememberPosition
                            ? state.currentTime
                            : 0,

                    volume:
                        state.volume,

                    isPlaying:
                        state.isPlaying

                })

            );

        } catch (error) {

            console.warn(
                "[WEBZONEBW Sound Box] Unable to save state.",
                error
            );

        }

    }


    /* ======================================================
       PLAYER MARKUP
       ====================================================== */

    function createPlayer() {

        const existingPlayer =
            document.getElementById(
                CONFIG.playerId
            );


        if (existingPlayer) {

            player =
                existingPlayer;

            audio =
                document.getElementById(
                    CONFIG.audioId
                );

            cacheElements();

            injectStyles();

            return;

        }


        player =
            document.createElement(
                "section"
            );

        player.id =
            CONFIG.playerId;

        player.className =
            "webzonebw-global-player";

        player.setAttribute(
            "aria-label",
            "WEBZONEBW Sound Box"
        );


        player.innerHTML = `

            <audio
                id="${CONFIG.audioId}"
                preload="metadata">
            </audio>


            <div class="webzonebw-player-inner">


                <!-- TRACK INFORMATION -->

                <div class="webzonebw-track-info">

                    <div
                        class="webzonebw-track-icon"
                        aria-hidden="true">

                        ♪

                    </div>


                    <div class="webzonebw-track-text">

                        <strong
                            id="webzonebwTrackTitle">

                            WEBZONEBW Sound Box

                        </strong>


                        <span
                            id="webzonebwTrackArtist">

                            Select a track

                        </span>


                        <small
                            id="webzonebwTrackAlbum">

                            Beatles Collection

                        </small>

                    </div>

                </div>


                <!-- MAIN CONTROLS -->

                <div class="webzonebw-main-controls">


                    <button
                        type="button"
                        id="webzonebwPrevious"
                        class="webzonebw-player-btn"
                        aria-label="Previous track"
                        title="Previous Track">

                        ◀

                    </button>


                    <button
                        type="button"
                        id="webzonebwPlay"
                        class="webzonebw-player-btn webzonebw-play-btn"
                        aria-label="Play"
                        title="Play">

                        ▶

                    </button>


                    <button
                        type="button"
                        id="webzonebwNext"
                        class="webzonebw-player-btn"
                        aria-label="Next track"
                        title="Next Track">

                        ▶

                    </button>


                </div>


                <!-- PROGRESS -->

                <div
                    class="webzonebw-progress-area">


                    <span
                        id="webzonebwCurrentTime">

                        0:00

                    </span>


                    <input
                        id="webzonebwProgress"
                        class="webzonebw-progress"
                        type="range"
                        min="0"
                        max="100"
                        value="0"
                        step="0.1"
                        aria-label="Track progress">


                    <span
                        id="webzonebwDuration">

                        0:00

                    </span>


                </div>


                <!-- VOLUME / PLAYLIST -->

                <div
                    class="webzonebw-volume-area">


                    <button
                        type="button"
                        id="webzonebwMute"
                        class="webzonebw-player-btn"
                        aria-label="Mute"
                        title="Mute">

                        🔊

                    </button>


                    <input
                        id="webzonebwVolume"
                        class="webzonebw-volume"
                        type="range"
                        min="0"
                        max="1"
                        value="${state.volume}"
                        step="0.01"
                        aria-label="Volume">


                    <button
                        type="button"
                        id="webzonebwPlaylist"
                        class="webzonebw-player-btn"
                        aria-label="Open playlist"
                        title="Open Playlist">

                        ☰

                    </button>


                    <button
                        type="button"
                        id="webzonebwMinimize"
                        class="webzonebw-player-btn"
                        aria-label="Minimize player"
                        title="Minimize Player">

                        ↓

                    </button>


                </div>

            </div>


            <!-- PLAYLIST DRAWER -->

            <div
                id="webzonebwPlaylistPanel"
                class="webzonebw-playlist-panel"
                hidden>


                <div
                    class="webzonebw-playlist-header">


                    <strong>
                        ♪ WEBZONEBW SOUND BOX
                    </strong>


                    <button
                        type="button"
                        id="webzonebwPlaylistClose"
                        class="webzonebw-player-btn"
                        aria-label="Close playlist"
                        title="Close Playlist">

                        ✕

                    </button>


                </div>


                <div
                    id="webzonebwPlaylistItems"
                    class="webzonebw-playlist-items">
                </div>


            </div>

        `;


        document.body.appendChild(
            player
        );


        audio =
            document.getElementById(
                CONFIG.audioId
            );


        cacheElements();

        injectStyles();

    }


    /* ======================================================
       CACHE ELEMENTS
       ====================================================== */

    function cacheElements() {

        titleElement =
            document.getElementById(
                "webzonebwTrackTitle"
            );

        artistElement =
            document.getElementById(
                "webzonebwTrackArtist"
            );

        albumElement =
            document.getElementById(
                "webzonebwTrackAlbum"
            );

        playButton =
            document.getElementById(
                "webzonebwPlay"
            );

        previousButton =
            document.getElementById(
                "webzonebwPrevious"
            );

        nextButton =
            document.getElementById(
                "webzonebwNext"
            );

        progressRange =
            document.getElementById(
                "webzonebwProgress"
            );

        volumeRange =
            document.getElementById(
                "webzonebwVolume"
            );

        currentTimeElement =
            document.getElementById(
                "webzonebwCurrentTime"
            );

        durationElement =
            document.getElementById(
                "webzonebwDuration"
            );

        playlistPanel =
            document.getElementById(
                "webzonebwPlaylistPanel"
            );

        playlistButton =
            document.getElementById(
                "webzonebwPlaylist"
            );

        playlistCloseButton =
            document.getElementById(
                "webzonebwPlaylistClose"
            );

        minimizeButton =
            document.getElementById(
                "webzonebwMinimize"
            );

        muteButton =
            document.getElementById(
                "webzonebwMute"
            );

    }


    /* ======================================================
       LOAD TRACK
       ====================================================== */

    function loadTrack(
        index,
        options = {}
    ) {

        if (!state.playlist.length) {

            console.warn(
                "[WEBZONEBW Sound Box] Playlist is empty."
            );

            return;

        }


        const normalizedIndex =
            (
                index +
                state.playlist.length
            ) %
            state.playlist.length;


        state.currentIndex =
            normalizedIndex;


        const track =
            state.playlist[
                state.currentIndex
            ];


        if (
            !track ||
            !track.audio
        ) {

            showTrackError(
                "This track does not have an audio source."
            );

            return;

        }


        /*
         * Stop the current track.
         */

        audio.pause();


        /*
         * Reset playback state.
         */

        state.currentTime = 0;

        state.duration = 0;

        if (!options.restorePosition) {
            state.savedPosition = 0;
        }


        /*
         * Set real MP3 source.
         */

        audio.src =
            track.audio;


        audio.load();


        /*
         * Update track information.
         */

        titleElement.textContent =
            track.title;


        artistElement.textContent =
            track.artist ||
            "The Beatles";


        if (track.album) {

            albumElement.textContent =
                `${track.album}${
                    track.year
                        ? " • " + track.year
                        : ""
                }`;

        } else {

            albumElement.textContent =
                "WEBZONEBW Sound Box";

        }


        /*
         * Reset controls.
         */

        progressRange.value =
            0;

        progressRange.max =
            100;


        currentTimeElement.textContent =
            "0:00";


        durationElement.textContent =
            track.duration ||
            "0:00";


        /*
         * Save current track.
         */

        saveState();


        /*
         * Refresh playlist.

         */

        renderPlaylist();


        /*
         * Optional autoplay.
         */

        if (options.autoplay) {

            playTrack();

        }

    }


    /* ======================================================
       PLAY
       ====================================================== */

    async function playTrack() {

        if (!audio) {
            return;
        }


        if (!audio.src) {

            loadTrack(
                state.currentIndex,
                {
                    autoplay: false
                }
            );

        }


        try {

            await audio.play();

            state.isPlaying =
                true;

            updatePlayButton();

        } catch (error) {

            state.isPlaying =
                false;

            updatePlayButton();

            console.warn(
                "[WEBZONEBW Sound Box] Playback was blocked or unavailable.",
                error
            );

            showTrackError(
                "Press Play to start the music."
            );

        }

    }


    /* ======================================================
       PAUSE
       ====================================================== */

    function pauseTrack() {

        if (!audio) {
            return;
        }


        audio.pause();


        state.isPlaying =
            false;


        state.currentTime =
            audio.currentTime || 0;


        saveState();


        updatePlayButton();

    }


    /* ======================================================
       TOGGLE PLAY
       ====================================================== */

    function togglePlay() {

        if (!audio) {
            return;
        }


        if (audio.paused) {

            playTrack();

        } else {

            pauseTrack();

        }

    }


    /* ======================================================
       PREVIOUS TRACK
       ====================================================== */

    function previousTrack() {

        if (!state.playlist.length) {
            return;
        }


        /*
         * If more than 3 seconds into the current track,
         * previous button first restarts the current track.
         */

        if (
            audio &&
            audio.currentTime > 3
        ) {

            audio.currentTime =
                0;

            return;

        }


        loadTrack(
            state.currentIndex - 1,
            {
                autoplay: true
            }
        );

    }


    /* ======================================================
       NEXT TRACK
       ====================================================== */

    function nextTrack() {

        if (!state.playlist.length) {
            return;
        }


        loadTrack(
            state.currentIndex + 1,
            {
                autoplay: true
            }
        );

    }


    /* ======================================================
       PLAY BUTTON
       ====================================================== */

    function updatePlayButton() {

        if (!playButton) {
            return;
        }


        if (state.isPlaying) {

            playButton.textContent =
                "❚❚";


            playButton.setAttribute(
                "aria-label",
                "Pause"
            );


            playButton.setAttribute(
                "title",
                "Pause"
            );

        } else {

            playButton.textContent =
                "▶";


            playButton.setAttribute(
                "aria-label",
                "Play"
            );


            playButton.setAttribute(
                "title",
                "Play"
            );

        }

    }


    /* ======================================================
       PROGRESS
       ====================================================== */

    function updateProgress() {

        if (!audio) {
            return;
        }


        state.currentTime =
            audio.currentTime || 0;


        state.duration =
            audio.duration || 0;


        if (
            Number.isFinite(
                state.duration
            ) &&
            state.duration > 0
        ) {

            progressRange.max =
                state.duration;


            progressRange.value =
                state.currentTime;

        }


        currentTimeElement.textContent =
            formatTime(
                state.currentTime
            );


        durationElement.textContent =
            formatTime(
                state.duration
            );

        // Keep navigation recovery accurate even when the visitor changes page
        // before the normal pause event is dispatched.
        saveState();

    }


    function seekTrack() {

        if (!audio) {
            return;
        }


        const newTime =
            Number(
                progressRange.value
            );


        if (
            Number.isFinite(newTime) &&
            audio.duration
        ) {

            audio.currentTime =
                Math.max(
                    0,
                    Math.min(
                        newTime,
                        audio.duration
                    )
                );

        }


        state.currentTime =
            audio.currentTime || 0;


        saveState();

    }


    /* ======================================================
       VOLUME
       ====================================================== */

    function setVolume(value) {

        if (!audio) {
            return;
        }


        const volume =
            Math.max(
                0,
                Math.min(
                    1,
                    Number(value)
                )
            );


        state.volume =
            volume;


        audio.volume =
            volume;


        audio.muted =
            false;


        state.muted =
            volume === 0;


        volumeRange.value =
            volume;


        updateMuteButton();

        saveState();

    }


    function toggleMute() {

        if (!audio) {
            return;
        }


        if (
            audio.muted ||
            audio.volume === 0
        ) {

            audio.muted =
                false;


            const restoredVolume =
                state.volume > 0
                    ? state.volume
                    : CONFIG.defaultVolume;


            audio.volume =
                restoredVolume;


            volumeRange.value =
                restoredVolume;


            state.volume =
                restoredVolume;


            state.muted =
                false;

        } else {

            audio.muted =
                true;


            state.muted =
                true;

        }


        updateMuteButton();

        saveState();

    }


    function updateMuteButton() {

        if (!muteButton) {
            return;
        }


        if (
            state.muted ||
            audio.muted ||
            audio.volume === 0
        ) {

            muteButton.textContent =
                "🔇";


            muteButton.setAttribute(
                "aria-label",
                "Unmute"
            );


            muteButton.setAttribute(
                "title",
                "Unmute"
            );

        } else if (
            audio.volume < 0.5
        ) {

            muteButton.textContent =
                "🔉";


            muteButton.setAttribute(
                "aria-label",
                "Mute"
            );


            muteButton.setAttribute(
                "title",
                "Mute"
            );

        } else {

            muteButton.textContent =
                "🔊";


            muteButton.setAttribute(
                "aria-label",
                "Mute"
            );


            muteButton.setAttribute(
                "title",
                "Mute"
            );

        }

    }


    /* ======================================================
       PLAYLIST
       ====================================================== */

    function renderPlaylist() {

        const container =
            document.getElementById(
                "webzonebwPlaylistItems"
            );


        if (!container) {
            return;
        }


        container.innerHTML =
            "";


        state.playlist.forEach(
            (track, index) => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "webzonebw-playlist-item";


                if (
                    index ===
                    state.currentIndex
                ) {

                    button.classList.add(
                        "active"
                    );

                }


                const number =
                    track.num ||
                    index + 1;


                button.innerHTML = `

                    <span
                        class="webzonebw-playlist-number">

                        ${String(number)
                            .padStart(2, "0")}

                    </span>


                    <span
                        class="webzonebw-playlist-track">


                        <strong>

                            ${escapeHTML(
                                track.title
                            )}

                        </strong>


                        <small>

                            ${escapeHTML(
                                track.artist ||
                                "The Beatles"
                            )}

                            ${
                                track.album
                                    ? " • " +
                                      escapeHTML(
                                          track.album
                                      )
                                    : ""
                            }

                        </small>


                    </span>

                `;


                button.addEventListener(
                    "click",
                    function () {

                        loadTrack(
                            index,
                            {
                                autoplay: true
                            }
                        );

                    }
                );


                container.appendChild(
                    button
                );

            }
        );

    }


    function togglePlaylist() {

        if (!playlistPanel) {
            return;
        }


        playlistPanel.hidden =
            !playlistPanel.hidden;

    }


    /* ======================================================
       MINIMIZE
       ====================================================== */

    function toggleMinimize() {

        if (!player) {
            return;
        }


        state.expanded =
            !state.expanded;


        player.classList.toggle(
            "webzonebw-player-minimized",
            state.expanded
        );


        if (minimizeButton) {

            minimizeButton.textContent =
                state.expanded
                    ? "↑"
                    : "↓";

        }

    }


    /* ======================================================
       WEBZONEBW-ER NAVIGATION HANDOFF
       ====================================================== */

    function bindERNavigationPause() {

        document.addEventListener(
            "click",
            function (event) {

                if (!(event.target instanceof Element)) {
                    return;
                }

                const link = event.target.closest(
                    'a[href*="er/index.html"], a[href*="/er/"]'
                );

                if (!link || !audio) {
                    return;
                }

                // ER is an immersive workspace. Pause rather than discard the
                // stream, so the regular site can resume from this exact point.
                state.currentTime = audio.currentTime || 0;
                state.isPlaying = false;
                state.volume = audio.volume;
                saveState();
                audio.pause();
            }
        );

    }


    /* ======================================================
       ERROR HANDLING
       ====================================================== */

    function showTrackError(message) {

        if (
            !titleElement ||
            !artistElement
        ) {
            return;
        }


        const track =
            state.playlist[
                state.currentIndex
            ];


        titleElement.textContent =
            "Sound Box";


        artistElement.textContent =
            message;


        window.setTimeout(
            function () {

                if (!track) {
                    return;
                }


                titleElement.textContent =
                    track.title;


                artistElement.textContent =
                    track.artist ||
                    "The Beatles";

            },
            3500
        );

    }


    /* ======================================================
       AUDIO EVENTS
       ====================================================== */

    function bindAudioEvents() {

        if (!audio) {
            return;
        }


        audio.addEventListener(
            "loadedmetadata",
            function () {

                state.duration =
                    audio.duration || 0;


                durationElement.textContent =
                    formatTime(
                        state.duration
                    );


                /*
                 * Restore saved position only
                 * for the remembered track.
                 */

                if (
                    CONFIG.rememberPosition &&
                    state.savedPosition > 0 &&
                    state.savedPosition <
                        state.duration
                ) {

                    try {

                        audio.currentTime =
                            state.savedPosition;

                    } catch (_) {

                        // Browser may reject setting
                        // currentTime before ready.

                    }

                }

            }
        );


        audio.addEventListener(
            "timeupdate",
            updateProgress
        );


        audio.addEventListener(
            "play",
            function () {

                state.isPlaying =
                    true;

                updatePlayButton();

            }
        );


        audio.addEventListener(
            "pause",
            function () {

                state.isPlaying =
                    false;


                state.currentTime =
                    audio.currentTime || 0;


                updatePlayButton();

                saveState();

            }
        );


        audio.addEventListener(
            "volumechange",
            function () {

                if (!audio.muted) {

                    state.volume =
                        audio.volume;

                    state.muted =
                        audio.volume === 0;

                }


                updateMuteButton();

            }
        );


        audio.addEventListener(
            "ended",
            function () {

                state.isPlaying =
                    false;


                state.currentTime =
                    0;


                if (
                    CONFIG.autoPlayNext &&
                    state.playlist.length > 1
                ) {

                    nextTrack();

                } else {

                    updatePlayButton();

                }

            }
        );


        audio.addEventListener(
            "error",
            function () {

                console.error(
                    "[WEBZONEBW Sound Box] Unable to load audio:",
                    audio.src
                );


                showTrackError(
                    "Audio file could not be loaded."
                );


                state.isPlaying =
                    false;


                updatePlayButton();

            }
        );

    }


    /* ======================================================
       PLAYER EVENTS
       ====================================================== */

    function bindPlayerEvents() {

        if (
            !playButton ||
            !previousButton ||
            !nextButton
        ) {
            return;
        }


        playButton.addEventListener(
            "click",
            togglePlay
        );


        previousButton.addEventListener(
            "click",
            previousTrack
        );


        nextButton.addEventListener(
            "click",
            nextTrack
        );


        /* --------------------------------------------------
           Progress
           -------------------------------------------------- */

        if (progressRange) {

            progressRange.addEventListener(
                "input",
                function () {

                    if (audio.duration) {

                        currentTimeElement
                            .textContent =
                                formatTime(
                                    Number(
                                        progressRange.value
                                    )
                                );

                    }

                }
            );


            progressRange.addEventListener(
                "change",
                seekTrack
            );

        }


        /* --------------------------------------------------
           Volume
           -------------------------------------------------- */

        if (volumeRange) {

            volumeRange.addEventListener(
                "input",
                function () {

                    setVolume(
                        volumeRange.value
                    );

                }
            );

        }


        /* --------------------------------------------------
           Mute
           -------------------------------------------------- */

        if (muteButton) {

            muteButton.addEventListener(
                "click",
                toggleMute
            );

        }


        /* --------------------------------------------------
           Playlist
           -------------------------------------------------- */

        if (playlistButton) {

            playlistButton.addEventListener(
                "click",
                togglePlaylist
            );

        }


        if (playlistCloseButton) {

            playlistCloseButton.addEventListener(
                "click",
                togglePlaylist
            );

        }


        /* --------------------------------------------------
           Minimize
           -------------------------------------------------- */

        if (minimizeButton) {

            minimizeButton.addEventListener(
                "click",
                toggleMinimize
            );

        }


        /* --------------------------------------------------
           Keyboard Controls
           -------------------------------------------------- */

        document.addEventListener(
            "keydown",
            function (event) {

                const target =
                    event.target;


                /*
                 * Do not hijack keyboard controls
                 * while typing.
                 */

                if (
                    target &&
                    (
                        target.tagName ===
                            "INPUT" ||

                        target.tagName ===
                            "TEXTAREA" ||

                        target.isContentEditable
                    )
                ) {

                    return;

                }


                /*
                 * Space = Play / Pause
                 */

                if (
                    event.code ===
                    "Space"
                ) {

                    event.preventDefault();

                    togglePlay();

                }


                /*
                 * Shift + Right Arrow = Next
                 */

                if (
                    event.code ===
                    "ArrowRight" &&
                    event.shiftKey
                ) {

                    event.preventDefault();

                    nextTrack();

                }


                /*
                 * Shift + Left Arrow = Previous
                 */

                if (
                    event.code ===
                    "ArrowLeft" &&
                    event.shiftKey
                ) {

                    event.preventDefault();

                    previousTrack();

                }

            }
        );

    }


    /* ======================================================
       CSS
       ====================================================== */

    function injectStyles() {

        if (
            document.getElementById(
                "webzonebw-player-styles"
            )
        ) {

            return;

        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "webzonebw-player-styles";


        style.textContent = `

            /* =============================================
               WEBZONEBW GLOBAL SOUND BOX
               ============================================= */

            .webzonebw-global-player {

                position: fixed;

                left: 0;
                right: 0;
                bottom: 0;

                z-index: 900;

                background:
                    rgba(8, 10, 18, .97);

                border-top:
                    1px solid
                    rgba(80, 140, 255, .28);

                box-shadow:
                    0 -8px 30px
                    rgba(0,0,0,.35);

                backdrop-filter:
                    blur(18px);

                -webkit-backdrop-filter:
                    blur(18px);

                color:
                    #ffffff;

                font-family:
                    inherit;

            }


            .webzonebw-player-inner {

                width:
                    min(1500px, 100%);

                min-height:
                    76px;

                margin:
                    0 auto;

                padding:
                    10px 18px;

                display:
                    grid;

                grid-template-columns:
                    minmax(220px, 1.2fr)
                    auto
                    minmax(280px, 2fr)
                    minmax(180px, .8fr);

                align-items:
                    center;

                gap:
                    18px;

                box-sizing:
                    border-box;

            }


            /* =============================================
               TRACK INFO
               ============================================= */

            .webzonebw-track-info {

                display:
                    flex;

                align-items:
                    center;

                gap:
                    12px;

                min-width:
                    0;

            }


            .webzonebw-track-icon {

                width:
                    42px;

                height:
                    42px;

                flex:
                    0 0 42px;

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    center;

                border-radius:
                    12px;

                background:
                    rgba(55, 110, 255, .16);

                border:
                    1px solid
                    rgba(90, 145, 255, .3);

                font-size:
                    1.2rem;

            }


            .webzonebw-track-text {

                min-width:
                    0;

                display:
                    flex;

                flex-direction:
                    column;

                gap:
                    2px;

            }


            .webzonebw-track-text strong {

                overflow:
                    hidden;

                text-overflow:
                    ellipsis;

                white-space:
                    nowrap;

                font-size:
                    .92rem;

            }


            .webzonebw-track-text span {

                overflow:
                    hidden;

                text-overflow:
                    ellipsis;

                white-space:
                    nowrap;

                font-size:
                    .75rem;

                opacity:
                    .78;

            }


            .webzonebw-track-text small {

                overflow:
                    hidden;

                text-overflow:
                    ellipsis;

                white-space:
                    nowrap;

                font-size:
                    .66rem;

                opacity:
                    .5;

            }


            /* =============================================
               CONTROLS
               ============================================= */

            .webzonebw-main-controls {

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    center;

                gap:
                    6px;

            }


            .webzonebw-player-btn {

                width:
                    38px;

                height:
                    38px;

                border:
                    1px solid
                    rgba(110, 160, 255, .25);

                border-radius:
                    10px;

                background:
                    rgba(35, 65, 125, .32);

                color:
                    #ffffff;

                cursor:
                    pointer;

                display:
                    inline-flex;

                align-items:
                    center;

                justify-content:
                    center;

                font:
                    inherit;

                transition:
                    transform .16s ease,
                    background .16s ease,
                    border-color .16s ease;

            }


            .webzonebw-player-btn:hover {

                background:
                    rgba(55, 100, 190, .55);

                border-color:
                    rgba(120, 170, 255, .55);

                transform:
                    translateY(-1px);

            }


            .webzonebw-player-btn:active {

                transform:
                    translateY(0)
                    scale(.96);

            }


            .webzonebw-player-btn:focus-visible {

                outline:
                    2px solid
                    #4d8cff;

                outline-offset:
                    2px;

            }


            .webzonebw-play-btn {

                width:
                    46px;

                height:
                    46px;

                border-radius:
                    50%;

                background:
                    linear-gradient(
                        135deg,
                        #246bff,
                        #1746c7
                    );

                border-color:
                    rgba(125, 170, 255, .7);

            }


            .webzonebw-play-btn:hover {

                background:
                    linear-gradient(
                        135deg,
                        #3478ff,
                        #1d51d6
                    );

            }


            /* =============================================
               PROGRESS
               ============================================= */

            .webzonebw-progress-area {

                display:
                    flex;

                align-items:
                    center;

                gap:
                    8px;

                min-width:
                    0;

            }


            .webzonebw-progress-area span {

                min-width:
                    34px;

                font-size:
                    .66rem;

                opacity:
                    .65;

                text-align:
                    center;

            }


            .webzonebw-progress,
            .webzonebw-volume {

                appearance:
                    none;

                -webkit-appearance:
                    none;

                height:
                    4px;

                border-radius:
                    10px;

                background:
                    rgba(255,255,255,.16);

                cursor:
                    pointer;

            }


            .webzonebw-progress {

                flex:
                    1;

                min-width:
                    80px;

            }


            .webzonebw-volume {

                width:
                    90px;

            }


            .webzonebw-progress::-webkit-slider-thumb,
            .webzonebw-volume::-webkit-slider-thumb {

                appearance:
                    none;

                width:
                    13px;

                height:
                    13px;

                border-radius:
                    50%;

                background:
                    #4d8cff;

                border:
                    2px solid
                    #ffffff;

                cursor:
                    pointer;

            }


            .webzonebw-progress::-moz-range-thumb,
            .webzonebw-volume::-moz-range-thumb {

                width:
                    13px;

                height:
                    13px;

                border-radius:
                    50%;

                background:
                    #4d8cff;

                border:
                    2px solid
                    #ffffff;

                cursor:
                    pointer;

            }


            /* =============================================
               VOLUME
               ============================================= */

            .webzonebw-volume-area {

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    flex-end;

                gap:
                    7px;

            }


            /* =============================================
               PLAYLIST
               ============================================= */

            .webzonebw-playlist-panel {

                position:
                    absolute;

                right:
                    18px;

                bottom:
                    calc(100% + 10px);

                width:
                    min(420px, calc(100vw - 30px));

                max-height:
                    520px;

                overflow:
                    hidden;

                border:
                    1px solid
                    rgba(90, 140, 255, .3);

                border-radius:
                    16px;

                background:
                    rgba(9, 12, 22, .98);

                box-shadow:
                    0 15px 50px
                    rgba(0,0,0,.55);

            }


            .webzonebw-playlist-header {

                display:
                    flex;

                align-items:
                    center;

                justify-content:
                    space-between;

                padding:
                    13px 15px;

                border-bottom:
                    1px solid
                    rgba(255,255,255,.08);

            }


            .webzonebw-playlist-items {

                max-height:
                    430px;

                overflow-y:
                    auto;

                padding:
                    6px;

            }


            .webzonebw-playlist-item {

                width:
                    100%;

                display:
                    flex;

                align-items:
                    center;

                gap:
                    12px;

                padding:
                    10px;

                border:
                    1px solid
                    transparent;

                border-radius:
                    10px;

                background:
                    transparent;

                color:
                    #ffffff;

                text-align:
                    left;

                cursor:
                    pointer;

                font:
                    inherit;

            }


            .webzonebw-playlist-item:hover {

                background:
                    rgba(60,100,180,.18);

            }


            .webzonebw-playlist-item.active {

                background:
                    rgba(40,90,190,.25);

                border-color:
                    rgba(90,150,255,.3);

            }


            .webzonebw-playlist-number {

                width:
                    28px;

                opacity:
                    .5;

                font-size:
                    .7rem;

                text-align:
                    center;

            }


            .webzonebw-playlist-track {

                min-width:
                    0;

                display:
                    flex;

                flex-direction:
                    column;

                gap:
                    2px;

            }


            .webzonebw-playlist-track strong {

                overflow:
                    hidden;

                text-overflow:
                    ellipsis;

                white-space:
                    nowrap;

                font-size:
                    .82rem;

            }


            .webzonebw-playlist-track small {

                overflow:
                    hidden;

                text-overflow:
                    ellipsis;

                white-space:
                    nowrap;

                font-size:
                    .68rem;

                opacity:
                    .55;

            }


            /* =============================================
               MINIMIZED PLAYER
               ============================================= */

            .webzonebw-player-minimized
            .webzonebw-player-inner {

                min-height:
                    52px;

                padding:
                    6px 12px;

                grid-template-columns:
                    minmax(0, 1fr)
                    auto;

            }


            .webzonebw-player-minimized
            .webzonebw-progress-area,

            .webzonebw-player-minimized
            .webzonebw-volume-area {

                display:
                    none;

            }


            /* Compact cloud player: keep only artwork, play/pause and expand. */
            .webzonebw-global-player.webzonebw-player-minimized {

                left: auto;
                right: max(18px, env(safe-area-inset-right));
                bottom: max(18px, env(safe-area-inset-bottom));
                width: auto;
                border: 1px solid rgba(80, 140, 255, .34);
                border-radius: 999px;
                box-shadow: 0 12px 32px rgba(0,0,0,.42), 0 0 22px rgba(79, 70, 229, .16);
            }

            .webzonebw-player-minimized .webzonebw-player-inner {

                width: auto;
                min-height: 58px;
                margin: 0;
                padding: 7px;
                display: flex;
                gap: 7px;
            }

            .webzonebw-player-minimized .webzonebw-track-text,
            .webzonebw-player-minimized #webzonebwPrevious,
            .webzonebw-player-minimized #webzonebwNext,
            .webzonebw-player-minimized #webzonebwMute,
            .webzonebw-player-minimized #webzonebwVolume,
            .webzonebw-player-minimized #webzonebwPlaylist {

                display: none;
            }

            .webzonebw-player-minimized .webzonebw-track-icon {

                width: 42px;
                height: 42px;
                flex-basis: 42px;
                border-radius: 50%;
            }

            .webzonebw-player-minimized .webzonebw-main-controls,
            .webzonebw-player-minimized .webzonebw-volume-area {

                display: flex;
                gap: 7px;
            }

            .webzonebw-player-minimized .webzonebw-play-btn {

                width: 44px;
                height: 44px;
            }

            .webzonebw-player-minimized #webzonebwMinimize {

                width: 36px;
                height: 36px;
                border-radius: 50%;
            }


            /* =============================================
               TABLET
               ============================================= */

            @media (max-width: 900px) {

                .webzonebw-player-inner {

                    grid-template-columns:
                        1fr auto;

                    gap:
                        10px;

                }


                .webzonebw-progress-area {

                    grid-column:
                        1 / -1;

                    grid-row:
                        2;

                }


                .webzonebw-volume-area {

                    display:
                        none;

                }


                .webzonebw-main-controls {

                    justify-content:
                        flex-end;

                }

            }


            /* =============================================
               MOBILE
               ============================================= */

            @media (max-width: 600px) {

                .webzonebw-player-inner {

                    padding:
                        8px 10px;

                }


                .webzonebw-track-icon {

                    width:
                        36px;

                    height:
                        36px;

                    flex-basis:
                        36px;

                }


                .webzonebw-track-text strong {

                    font-size:
                        .78rem;

                }


                .webzonebw-track-text span {

                    font-size:
                        .68rem;

                }


                .webzonebw-track-text small {

                    display:
                        none;

                }


                .webzonebw-player-btn {

                    width:
                        34px;

                    height:
                        34px;

                }


                .webzonebw-play-btn {

                    width:
                        42px;

                    height:
                        42px;

                }


                .webzonebw-playlist-panel {

                    right:
                        8px;

                    width:
                        calc(100vw - 16px);

                }

            }


            /* =============================================
               REDUCED MOTION
               ============================================= */

            @media (prefers-reduced-motion: reduce) {

                .webzonebw-player-btn {

                    transition:
                        none;

                }

            }

        `;


        document.head.appendChild(
            style
        );

    }


    /* ======================================================
       INITIALIZATION
       ====================================================== */

    function initialize() {

        if (state.initialized) {
            return;
        }


        /*
         * If a player already exists in the page,
         * do not create another one.
         */

        const existingPlayer =
            document.getElementById(
                CONFIG.playerId
            );


        /*
         * Discover the Beatles playlist first.
         */

        const playlistFound =
            discoverPlaylist();


        /*
         * If the playlist is unavailable,
         * use the real Come Together file as
         * a safe fallback.
         */

        if (!playlistFound) {

            console.warn(
                "[WEBZONEBW Sound Box] Beatles playlist not detected. Using Come Together fallback."
            );

            createFallbackPlaylist();

        }


        /*
         * Create or connect the player.
         */

        if (!existingPlayer) {

            createPlayer();

        } else {

            player =
                existingPlayer;

            audio =
                document.getElementById(
                    CONFIG.audioId
                );

            cacheElements();

            injectStyles();

        }

        // Start compact on every page so the player never consumes page width.
        player.classList.toggle(
            "webzonebw-player-minimized",
            state.expanded
        );

        if (minimizeButton) {
            minimizeButton.textContent = state.expanded ? "↑" : "↓";
            minimizeButton.setAttribute(
                "aria-label",
                state.expanded ? "Expand player" : "Minimize player"
            );
        }


        /*
         * Restore previous session.
         */

        loadSavedState();


        /*
         * Apply saved volume.
         */

        audio.volume =
            state.volume;


        /*
         * Bind events.
         */

        bindAudioEvents();

        bindPlayerEvents();

        bindERNavigationPause();

        // A page navigation destroys the current document and its <audio>
        // element. Capture the live position before that happens so the next
        // page can rebuild the player at the same point.
        window.addEventListener(
            "pagehide",
            function () {
                if (!audio) {
                    return;
                }

                state.currentTime = audio.currentTime || 0;
                state.isPlaying = !audio.paused && !audio.ended;
                state.volume = audio.volume;
                saveState();
            }
        );


        /*
         * Load remembered track.
         */

        loadTrack(
            state.currentIndex,
            {
                autoplay: state.resumeOnLoad,
                restorePosition: true
            }
        );


        /*
         * Restore controls.
         */

        updateMuteButton();

        updatePlayButton();

        renderPlaylist();


        state.initialized =
            true;


        console.info(
            `[WEBZONEBW Sound Box] v${CONFIG.version} initialized.`
        );


        console.info(
            "[WEBZONEBW Sound Box] Audio folder:",
            "assets/audio/"
        );


        if (state.playlist.length) {

            console.info(
                "[WEBZONEBW Sound Box] Playlist tracks:",
                state.playlist.length
            );

        }

    }


    /* ======================================================
       PUBLIC API
       ====================================================== */

    window.WEBZONEBWSoundBox = {

        play:
            playTrack,

        pause:
            pauseTrack,

        toggle:
            togglePlay,

        next:
            nextTrack,

        previous:
            previousTrack,

        load:
            loadTrack,

        setVolume:
            setVolume,

        getPlaylist:
            function () {

                return [
                    ...state.playlist
                ];

            },

        getCurrentTrack:
            function () {

                return (
                    state.playlist[
                        state.currentIndex
                    ] || null
                );

            },

        getState:
            function () {

                return {

                    ...state,

                    currentTrack:
                        state.playlist[
                            state.currentIndex
                        ] || null

                };

            }

    };


    /* ======================================================
       START
       ====================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            {
                once: true
            }
        );

    } else {

        initialize();

    }

})();
