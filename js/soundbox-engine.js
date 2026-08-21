"use strict";

/* Soundbox page adapter for the local audio inventory. */
(function () {
    const AUDIO_PATH = "assets/audio/The Beatles - Come Together.mp3";
    const track = {
        id: "p5-track-18",
        num: 18,
        phaseNum: 5,
        phaseName: "Phase 5: Experimental & Classic Rock (1968–1969)",
        title: "Come Together",
        album: "Abbey Road",
        albumGroup: "Abbey Road (1969)",
        year: 1969,
        duration: "4:19",
        scale: "D minor",
        chords: ["Dm", "A", "G", "D"],
        vocalLead: "John Lennon",
        description: "The local audio recording in the WEBZONEBW Soundbox."
    };

    class LocalAudioEngine {
        constructor() {
            this.audio = new Audio();
            this.audio.preload = "metadata";
            this.audio.volume = 0.75;
            this.activeSong = null;
            this.isPlaying = false;
            this.isCustomFilePlaying = false;
            this.customFileName = "";
            this.playbackProgress = 0;
            this.playbackDuration = 0;
            this.ctx = null;
            this.soundLibraryFiles = [{
                id: "file-stem-p5",
                name: "The Beatles - Come Together.mp3",
                filePath: AUDIO_PATH,
                label: "Come Together — Abbey Road (1969)",
                phaseNum: 5,
                era: "Abbey Road",
                type: "MP3 Audio",
                duration: "4:19",
                preset: {}
            }];

            this.audio.addEventListener("loadedmetadata", () => {
                this.playbackDuration = this.audio.duration || 0;
            });
            this.audio.addEventListener("timeupdate", () => {
                this.playbackProgress = this.audio.currentTime || 0;
                this.playbackDuration = this.audio.duration || this.playbackDuration;
                if (this.onProgress) this.onProgress(this.playbackProgress, this.playbackDuration);
            });
            this.audio.addEventListener("play", () => { this.isPlaying = true; });
            this.audio.addEventListener("pause", () => { this.isPlaying = false; });
            this.audio.addEventListener("ended", () => {
                this.isPlaying = false;
                if (this.onEnded) this.onEnded();
            });
        }

        playAudioUrl(url, _name, onProgress, onEnded) {
            this.onProgress = onProgress;
            this.onEnded = onEnded;
            this.isCustomFilePlaying = false;
            if (this.audio.src !== new URL(url, document.baseURI).href) {
                this.audio.src = url;
                this.audio.load();
            }
            this.audio.play().catch(error => console.error("Soundbox audio could not play:", error));
        }

        playSong(song, onProgress, onEnded) {
            this.activeSong = song;
            this.playAudioUrl(AUDIO_PATH, track.title, onProgress, onEnded);
        }

        playCustomAudioFile(file, onProgress, onEnded) {
            this.stop();
            this.isCustomFilePlaying = true;
            this.customFileName = file.name;
            this.onProgress = onProgress;
            this.onEnded = onEnded;
            this.audio.src = URL.createObjectURL(file);
            this.audio.play().catch(error => console.error("Custom Soundbox audio could not play:", error));
        }

        pause() { this.audio.pause(); }
        resume(onProgress, onEnded) {
            this.onProgress = onProgress || this.onProgress;
            this.onEnded = onEnded || this.onEnded;
            this.audio.play().catch(error => console.error("Soundbox audio could not resume:", error));
        }
        stop() { this.audio.pause(); this.audio.currentTime = 0; this.isPlaying = false; }
        setVolume(value) { this.audio.volume = Math.max(0, Math.min(1, value)); }
        setTempoMultiplier(value) { this.audio.playbackRate = Number(value) || 1; }
        setPitchShift() {}
        setBassGain() {}
        setTrebleGain() {}
        setFilterCutoff() {}
        setReverbWet() {}
        setCrackleLevel() {}
        setStereoPan() {}
        setWaveform() {}
        applyPreset(preset) { if (preset && preset.tempo) this.setTempoMultiplier(preset.tempo); }
        exportChordsJSON() { this.download("come-together-chords.json", { track }); }
        exportSettingsJSON() { this.download("soundbox-settings.json", { volume: this.audio.volume, playbackRate: this.audio.playbackRate }); }
        download(name, data) {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
            link.download = name;
            link.click();
            URL.revokeObjectURL(link.href);
        }
    }

    const phase = {
        phaseNum: 5,
        id: "phase-5",
        name: track.phaseName,
        shortName: "Phase 5: Classic Rock",
        era: "1968–1969",
        albums: "Abbey Road (1969)",
        badge: "Local MP3",
        icon: "🎵",
        coverColor: "linear-gradient(135deg, #0284c7, #082f49)",
        desc: "The local Come Together MP3 is ready to play.",
        trackIds: [track.id]
    };
    const masterPlaylist = {
        id: "beatles-6-phases-complete", title: "Soundbox Local Audio", tagline: "Your local MP3 track.",
        era: "1969", category: "Local", badge: "★ Local Audio", coverColor: phase.coverColor, icon: "🎵", songs: [track]
    };
    const phasePlaylist = { ...masterPlaylist, id: "phase-5-playlist", title: "Abbey Road Local Track", songs: [track] };
    const favorites = new Set();

    // Kept as configuration only: the Soundbox page has its own visual player.
    // Do not expose this as BeatlesSoundBox, which would replace the existing
    // 23-track Soundbox interface with a one-track playlist.
    window.WebZoneSoundboxLocalConfig = {
        engine: new LocalAudioEngine(), masterTracks: [track], phases: [phase], playlists: [masterPlaylist, phasePlaylist],
        activeSongId: track.id, activePlaylistId: masterPlaylist.id, isShuffle: false, isRepeat: false,
        getSongById(id) { return this.masterTracks.find(song => song.id === id) || track; },
        getPlaylist(id) { return this.playlists.find(playlist => playlist.id === id) || masterPlaylist; },
        isFavorite(id) { return favorites.has(id); },
        toggleFavorite(id) { favorites.has(id) ? favorites.delete(id) : favorites.add(id); return favorites.has(id); }
    };

    document.addEventListener("DOMContentLoaded", () => {
        const audio = new Audio(AUDIO_PATH);
        audio.preload = "metadata";
        audio.volume = 0.75;

        const $ = id => document.getElementById(id);
        const title = $("nowPlayingTitle");
        const album = $("nowPlayingAlbum");
        const era = $("nowPlayingEra");
        const chords = $("nowPlayingChords");
        const vocals = $("nowPlayingPlaylistRef");
        const vinylTitle = $("vinylSongTitle");
        const playButton = $("btnPlayPause");
        const playIcon = $("playIcon");
        const progress = $("scrubProgress");
        const scrub = $("scrubBarTrack");
        const current = $("currentTimeLabel");
        const total = $("totalDurationLabel");
        const volume = $("volumeSlider");
        const record = $("vinylRecord");
        const visualizer = $("audioVisualizer");
        const status = $("audioSourceStatus");
        const formatTime = seconds => {
            seconds = Number.isFinite(seconds) ? Math.floor(seconds) : 0;
            return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
        };
        const setPlayVisual = playing => {
            if (playIcon) playIcon.innerHTML = playing
                ? '<path d="M7 5h4v14H7V5Zm6 0h4v14h-4V5Z"/>'
                : '<path d="M8 5v14l11-7L8 5Z"/>';
            if (playButton) playButton.setAttribute("aria-label", playing ? "Pause Come Together" : "Play Come Together");
            if (record) record.classList.toggle("spinning", playing);
            if (visualizer) visualizer.classList.toggle("active", playing);
        };

        // Make the large Sound Box console identify the local audio it controls.
        if (title) title.textContent = "Come Together";
        if (album) album.textContent = "Album: Abbey Road (1969)";
        if (era) era.textContent = "Phase 5: Experimental & Classic Rock (1968–1969)";
        if (chords) chords.textContent = "Chords: Dm • A • G • D";
        if (vocals) vocals.textContent = "Lead Vocals: John Lennon";
        if (vinylTitle) vinylTitle.textContent = "Come Together";
        if (status) status.textContent = "💽 Local MP3 • Come Together";

        playButton?.addEventListener("click", () => {
            if (audio.paused) audio.play().catch(error => console.error("Soundbox audio could not play:", error));
            else audio.pause();
        });
        $("btnPrev")?.addEventListener("click", () => { audio.currentTime = 0; audio.play(); });
        $("btnNext")?.addEventListener("click", () => { audio.currentTime = 0; audio.play(); });
        volume?.addEventListener("input", () => { audio.volume = Number(volume.value) / 100; });
        scrub?.addEventListener("click", event => {
            if (!audio.duration) return;
            const rect = scrub.getBoundingClientRect();
            audio.currentTime = ((event.clientX - rect.left) / rect.width) * audio.duration;
        });
        audio.addEventListener("loadedmetadata", () => { if (total) total.textContent = formatTime(audio.duration); });
        audio.addEventListener("timeupdate", () => {
            if (current) current.textContent = formatTime(audio.currentTime);
            if (progress && audio.duration) progress.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
        });
        audio.addEventListener("play", () => setPlayVisual(true));
        audio.addEventListener("pause", () => setPlayVisual(false));
        audio.addEventListener("ended", () => { audio.currentTime = 0; setPlayVisual(false); });
    });
})();
