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

    window.BeatlesSoundBox = {
        engine: new LocalAudioEngine(), masterTracks: [track], phases: [phase], playlists: [masterPlaylist, phasePlaylist],
        activeSongId: track.id, activePlaylistId: masterPlaylist.id, isShuffle: false, isRepeat: false,
        getSongById(id) { return this.masterTracks.find(song => song.id === id) || track; },
        getPlaylist(id) { return this.playlists.find(playlist => playlist.id === id) || masterPlaylist; },
        isFavorite(id) { return favorites.has(id); },
        toggleFavorite(id) { favorites.has(id) ? favorites.delete(id) : favorites.add(id); return favorites.has(id); }
    };
})();
