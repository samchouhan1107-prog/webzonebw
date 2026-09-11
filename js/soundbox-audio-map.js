"use strict";

/**
 * WEBZONEBW Sound Box — Audio Path Map
 *
 * Machine-readable audio path references for JavaScript integrations.
 * This file maps track IDs to local file paths.
 *
 * Usage:
 *   import { audioMap, getAudioPath } from './soundbox-audio-map.js';
 *   const path = getAudioPath('p5-track-18');
 */

const audioMap = {
    "p5-track-18": {
        title: "Come Together",
        artist: "The Beatles",
        album: "Abbey Road",
        year: 1969,
        duration: "4:19",
        scale: "D minor",
        chords: ["Dm", "A", "G", "D"],
        vocalLead: "John Lennon",
        phaseNum: 5,
        filePath: "/assets/audio/The Beatles - Come Together.mp3",
        type: "MP3"
    }
};

const phaseAudioMap = {
    "phase-5": [audioMap["p5-track-18"]]
};

function getAudioPath(trackId) {
    const track = audioMap[trackId];
    return track ? track.filePath : null;
}

function getTrackInfo(trackId) {
    return audioMap[trackId] || null;
}

function getPhaseTracks(phaseNum) {
    const key = `phase-${phaseNum}`;
    return phaseAudioMap[key] || [];
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = { audioMap, phaseAudioMap, getAudioPath, getTrackInfo, getPhaseTracks };
}
