/* ==========================================================
   WEBZONEBW � SITE-WIDE SOUND BOX PLAYER
   ==========================================================
   File:
       js/webzonebw-player.js

   Purpose:
       � Persistent WEBZONEBW music player
       � Beatles playlist integration
       � Previous / Play / Next
       � Progress control
       � Volume control
       � Track information
       � Playlist drawer
       � Session playback memory
       � Automatic next-track playback
       � Missing-file protection
       � Mobile responsive player
       � Existing WEBZONEBW theme integration
       � Supports:
           assets/audio/file.mp3
       � Supports Beatles track fields:
           audioFile
           audioPath
           fileName
           audio
           src
           url
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

        audioBasePath: "assets/audio/",

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

        expanded: false

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

    let progressRange = null;
    let volumeRange = null;

    let currentTimeElement = null;
    let durationElement = null;

    let playlistPanel = null;
    let playlistButton = null;

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


    /* ======================================================
       AUDIO PATH NORMALIZATION
       ====================================================== */

    function normalizeAudioPath(track) {

        if (!track || typeof track !== "object") {
            return "";
        }


        /*
         * Priority:
         *
         * 1. audioFile
         * 2. audioPath
         * 3. fileName
         * 4. audio
         * 5. src
         * 6. url
         */

        let audioPath =
            track.audioFile ||
            track.audioPath ||
            track.fileName ||
            track.audio ||
            track.src ||
            track.url ||
            "";


        if (!audioPath) {
            return "";
        }


        audioPath = String(audioPath).trim();


        /*
         * Already a complete URL.
         */

        if (
            /^https?:\/\//i.test(audioPath) ||
            /^blob:/i.test(audioPath) ||
            /^data:/i.test(audioPath)
        ) {

            return audioPath;

        }


        /*
         * Remove leading ./ so paths remain clean.
         */

        audioPath =
            audioPath.replace(/^\.\/+/, "");


        /*
         * Normalize Windows-style separators.
         */

        audioPath =
            audioPath.replace(/\\/g, "/");


        /*
         * If the playlist already provides:
         *
         * assets/audio/file.mp3
         *
         * anchor it to the site root. A page-relative
         * path breaks on sub-page routes such as
         * /er/index.html, where the browser resolves
         * it to /er/assets/audio/... and gets a 404.
         */

        if (
            audioPath.startsWith("assets/audio/")
        ) {

            return "/" + audioPath;

        }


        /*
         * If the playlist provides:
         *
         * /assets/audio/file.mp3
         *
         * it is already root-relative � keep it.
         */

        if (
            audioPath.startsWith("/assets/audio/")
        ) {

            return audioPath;

        }


        /*
         * If the playlist provides only:
         *
         * The Beatles - Come Together.mp3
         *
         * automatically connect it to:
         *
         * assets/audio/
         */

        return (
            "/" +
            CONFIG.audioBasePath +
            audioPath.replace(/^\/+/, "")
        );

    }


    /* ======================================================
       TRACK NORMALIZATION
       ====================================================== */

    function normalizeTrack(track) {

        if (!track || typeof track !== "object") {
            return null;
        }


        const normalizedAudio =
            normalizeAudioPath(track);


        const normalized = {

            id:
                track.id ||
                track.slug ||
                track.fileName ||
                track.title ||
                `track-${Math.random()
                    .toString(36)
                    .slice(2)}`,


            num:
                track.num ??
                track.trackNumber ??
                "",


            phaseNum:
                track.phaseNum ??
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
                track.vocalLead ||
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
                normalizedAudio,


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
                track.hasAudioFile !== false &&
                Boolean(normalizedAudio),


            audioAvailable:
                track.audioAvailable !== false &&
                Boolean(normalizedAudio),


            cover:
                track.cover ||
                track.coverArt ||
                track.image ||
                "",


            description:
                track.description ||
                "",


            keyNote:
                track.keyNote ??
                "",


            scale:
                track.scale ||
                "",


            tempo:
                track.tempo ??
                "",


            motifType:
                track.motifType ||
                "",


            vocalLead:
                track.vocalLead ||
                ""

        };


        return normalized;

    }


    /* ======================================================
       PLAYLIST DISCOVERY
       ====================================================== */

    function discoverPlaylist() {

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


        /*
         * Direct arrays.
         */

        for (const candidate of candidates) {

            if (
                Array.isArray(candidate) &&
                candidate.length
            ) {

                const normalized =
                    candidate
                        .map(normalizeTrack)
                        .filter(
                            track =>
                                track &&
                                track.audio
                        );


                if (normalized.length) {

                    state.playlist =
                        normalized;


                    console.info(
                        "[WEBZONEBW Sound Box]",
                        `Loaded ${normalized.length} Beatles tracks.`
                    );


                    return true;

                }

            }

        }


        /*
         * Nested playlist objects.
         */

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

                    candidate.trackList,

                    candidate.songList

                ];


                for (const list of possibleArrays) {

                    if (
                        Array.isArray(list) &&
                        list.length
                    ) {

                        const normalized =
                            list
                                .map(normalizeTrack)
                                .filter(
                                    track =>
                                        track &&
                                        track.audio
                                );


                        if (normalized.length) {

                            state.playlist =
                                normalized;


                            console.info(
                                "[WEBZONEBW Sound Box]",
                                `Loaded ${normalized.length} Beatles tracks.`
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
         *
         * Your real file structure is:
         *
         * assets/audio/file
         *
         * Therefore Come Together uses:
         *
         * assets/audio/The Beatles - Come Together.mp3
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
                    "Phase 5: Experimental & Classic Rock (1968�1969)",

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
                    "assets/audio/The Beatles - Come Together.mp3",

                audioPath:
                    "assets/audio/The Beatles - Come Together.mp3",

                fileName:
                    "The Beatles - Come Together.mp3",

                audioType:
                    "mp3",

                hasAudioFile:
                    true,

                audioAvailable:
                    true,

                audio:
                    "assets/audio/The Beatles - Come Together.mp3",

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
                        state.currentIndex,

                    currentTime:
                        CONFIG.rememberPosition
                            ? state.currentTime
                            : 0,

                    volume:
                        state.volume

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


                <div class="webzonebw-track-info">

                    <div
                        class="webzonebw-track-icon"
                        aria-hidden="true">

                        ??

                    </div>


                    <div
                        class="webzonebw-track-text">

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


                <div class="webzonebw-main-controls">


                    <button
                        type="button"
                        id="webzonebwPrevious"
                        class="webzonebw-player-btn"
                        aria-label="Previous track"
                        title="Previous Track">

                        ?

                    </button>


                    <button
                        type="button"
                        id="webzonebwPlay"
                        class="webzonebw-player-btn webzonebw-play-btn"
                        aria-label="Play"
                        title="Play">

                        ?

                    </button>


                    <button
                        type="button"
                        id="webzonebwNext"
                        class="webzonebw-player-btn"
                        aria-label="Next track"
                        title="Next Track">

                        ?

                    </button>

                </div>


                <div class="webzonebw-progress-area">

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


                <div class="webzonebw-volume-area">


                    <button
                        type="button"
                        id="webzonebwMute"
                        class="webzonebw-player-btn"
                        aria-label="Mute"
                        title="Mute">

                        ??

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

                        ?

                    </button>


                    <button
                        type="button"
                        id="webzonebwMinimize"
                        class="webzonebw-player-btn"
                        aria-label="Minimize player"
                        title="Minimize Player">

                        ?

                    </button>

                </div>

            </div>


            <div
                id="webzonebwPlaylistPanel"
                class="webzonebw-playlist-panel"
                hidden>


                <div
                    class="webzonebw-playlist-header">

                    <strong>
                        ?? WEBZONEBW SOUND BOX
                    </strong>


                    <button
                        type="button"
                        id="webzonebwPlaylistClose"
                        class="webzonebw-player-btn"
                        aria-label="Close playlist">

                        ?

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


        minimizeButton =
            document.getElementById(
                "webzonebwMinimize"
            );

    }


    /* ======================================================
       LOAD TRACK
       ====================================================== */

    function loadTrack(index, options = {}) {

        if (!state.playlist.length) {
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


        audio.pause();


        /*
         * IMPORTANT:
         *
         * The actual source is now taken from
         * the normalized audio path.
         *
         * Example:
         *
         * assets/audio/The Beatles - Come Together.mp3
         */

        audio.src =
            track.audio;


        audio.load();


        titleElement.textContent =
            track.title;


        artistElement.textContent =
            track.artist;


        albumElement.textContent =
            track.album
                ? `${track.album}${
                    track.year
                        ? " � " + track.year
                        : ""
                }`
                : "WEBZONEBW Sound Box";


        progressRange.value =
            0;


        currentTimeElement.textContent =
            "0:00";


        durationElement.textContent =
            "0:00";


        state.currentTime =
            0;


        state.duration =
            0;


        saveState();


        renderPlaylist();


        console.info(
            "[WEBZONEBW Sound Box] Loading:",
            track.audio
        );


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
       PREVIOUS
       ====================================================== */

    function previousTrack() {

        if (!state.playlist.length) {
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
       NEXT
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
                "??";


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
                "?";


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


        if (state.duration > 0) {

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

    }


    function seekTrack() {

        if (!audio) {
            return;
        }


        audio.currentTime =
            Number(
                progressRange.value
            );


        state.currentTime =
            audio.currentTime;


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


            audio.volume =
                state.volume > 0
                    ? state.volume
                    : CONFIG.defaultVolume;


            volumeRange.value =
                audio.volume;


            state.muted =
                false;

        } else {

            audio.muted =
                true;


            state.muted =
                true;

        }


        updateMuteButton();

    }


    function updateMuteButton() {

        const muteButton =
            document.getElementById(
                "webzonebwMute"
            );


        if (!muteButton || !audio) {
            return;
        }


        if (
            state.muted ||
            audio.muted ||
            audio.volume === 0
        ) {

            muteButton.textContent =
                "??";


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
                "??";


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
                "??";


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


                button.innerHTML = `

                    <span
                        class="webzonebw-playlist-number">

                        ${
                            String(
                                track.num ||
                                index + 1
                            ).padStart(
                                2,
                                "0"
                            )
                        }

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
                                track.artist
                            )}

                            ${
                                track.album
                                    ? " � " +
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
                    ? "?"
                    : "?";

        }

    }


    /* ======================================================
       ERROR HANDLING
       ====================================================== */

    function showTrackError(message) {

        if (!titleElement) {
            return;
        }


        titleElement.textContent =
            "Sound Box";


        artistElement.textContent =
            message;


        window.setTimeout(
            function () {

                const track =
                    state.playlist[
                        state.currentIndex
                    ];


                if (!track) {
                    return;
                }


                titleElement.textContent =
                    track.title;


                artistElement.textContent =
                    track.artist;

            },
            3500
        );

    }


    /* ======================================================
       AUDIO EVENTS
       ====================================================== */

    function bindAudioEvents() {

        audio.addEventListener(
            "loadedmetadata",
            function () {

                state.duration =
                    audio.duration || 0;


                durationElement.textContent =
                    formatTime(
                        state.duration
                    );


                if (
                    state.currentTime > 0 &&
                    state.currentTime <
                        state.duration
                ) {

                    try {

                        audio.currentTime =
                            state.currentTime;

                    } catch (_) {}

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


                updatePlayButton();


                saveState();

            }
        );


        audio.addEventListener(
            "ended",
            function () {

                state.isPlaying =
                    false;


                if (
                    CONFIG.autoPlayNext
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

                const track =
                    state.playlist[
                        state.currentIndex
                    ];


                console.error(
                    "[WEBZONEBW Sound Box] Unable to load audio:",
                    track
                        ? track.audio
                        : audio.src
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


        progressRange.addEventListener(
            "input",
            function () {

                if (audio.duration) {

                    currentTimeElement.textContent =
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


        volumeRange.addEventListener(
            "input",
            function () {

                setVolume(
                    volumeRange.value
                );

            }
        );


        const muteButton =
            document.getElementById(
                "webzonebwMute"
            );


        if (muteButton) {

            muteButton.addEventListener(
                "click",
                toggleMute
            );

        }


        if (playlistButton) {

            playlistButton.addEventListener(
                "click",
                togglePlaylist
            );

        }


        const playlistClose =
            document.getElementById(
                "webzonebwPlaylistClose"
            );


        if (playlistClose) {

            playlistClose.addEventListener(
                "click",
                togglePlaylist
            );

        }


        if (minimizeButton) {

            minimizeButton.addEventListener(
                "click",
                toggleMinimize
            );

        }


        document.addEventListener(
            "keydown",
            function (event) {

                const target =
                    event.target;


                if (
                    target &&
                    (
                        target.tagName === "INPUT" ||
                        target.tagName === "TEXTAREA" ||
                        target.isContentEditable
                    )
                ) {

                    return;

                }


                if (
                    event.code ===
                    "Space"
                ) {

                    event.preventDefault();

                    togglePlay();

                }


                if (
                    event.code ===
                    "ArrowRight" &&
                    event.shiftKey
                ) {

                    nextTrack();

                }


                if (
                    event.code ===
                    "ArrowLeft" &&
                    event.shiftKey
                ) {

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

            .webzonebw-global-player {

                position: fixed;

                left: 0;
                right: 0;
                bottom: 0;

                z-index: 900;

                background:
                    rgba(8, 10, 18, .96);

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
                    rgba(55,110,255,.16);

                border:
                    1px solid
                    rgba(90,145,255,.3);

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


            .webzonebw-track-text strong,
            .webzonebw-track-text span,
            .webzonebw-track-text small {

                overflow:
                    hidden;

                text-overflow:
                    ellipsis;

                white-space:
                    nowrap;

            }


            .webzonebw-track-text strong {

                font-size:
                    .92rem;

            }


            .webzonebw-track-text span {

                font-size:
                    .75rem;

                opacity:
                    .78;

            }


            .webzonebw-track-text small {

                font-size:
                    .66rem;

                opacity:
                    .5;

            }


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
                    rgba(110,160,255,.25);

                border-radius:
                    10px;

                background:
                    rgba(35,65,125,.32);

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
                    rgba(55,100,190,.55);

                border-color:
                    rgba(120,170,255,.55);

                transform:
                    translateY(-1px);

            }


            .webzonebw-player-btn:focus-visible {

                outline:
                    2px solid
                    currentColor;

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
                    rgba(125,170,255,.7);

            }


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
                    rgba(90,140,255,.3);

                border-radius:
                    16px;

                background:
                    rgba(9,12,22,.98);

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
                    1px solid transparent;

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


            .webzonebw-playlist-track strong,
            .webzonebw-playlist-track small {

                overflow:
                    hidden;

                text-overflow:
                    ellipsis;

                white-space:
                    nowrap;

            }


            .webzonebw-playlist-track strong {

                font-size:
                    .82rem;

            }


            .webzonebw-playlist-track small {

                font-size:
                    .68rem;

                opacity:
                    .55;

            }


            .webzonebw-player-minimized
            .webzonebw-player-inner {

                min-height:
                    52px;

                padding:
                    6px 12px;

                grid-template-columns:
                    minmax(0,1fr)
                    auto;

            }


            .webzonebw-player-minimized
            .webzonebw-progress-area,
            .webzonebw-player-minimized
            .webzonebw-volume-area {

                display:
                    none;

            }


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

            }


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
         * Discover the Beatles playlist first.
         */

        const playlistFound =
            discoverPlaylist();


        /*
         * If playlist data is not available yet,
         * use the verified Come Together path.
         */

        if (!playlistFound) {

            console.warn(
                "[WEBZONEBW Sound Box] Beatles playlist not detected. Using fallback track."
            );


            createFallbackPlaylist();

        }


        createPlayer();


        loadSavedState();


        audio.volume =
            state.volume;


        bindAudioEvents();

        bindPlayerEvents();


        loadTrack(
            state.currentIndex,
            {
                autoplay: false
            }
        );


        updateMuteButton();

        updatePlayButton();

        renderPlaylist();


        state.initialized =
            true;


        console.info(
            `[WEBZONEBW Sound Box] v${CONFIG.version} initialized.`
        );


        /*
         * Helpful diagnostic.
         */

        const currentTrack =
            state.playlist[
                state.currentIndex
            ];


        if (currentTrack) {

            console.info(
                "[WEBZONEBW Sound Box] Active audio path:",
                currentTrack.audio
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