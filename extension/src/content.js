// This script is injected into the YouTube page and is responsible for adding the
// chat component to the page and setting up the event listeners

import React from 'react';
import { createRoot } from 'react-dom/client';
import Chat from './Chat.jsx'
import './chat.css'

// Regex to parse the player response from the page (when transcript is not available on the window)
const YT_INITIAL_PLAYER_RESPONSE_RE = /ytInitialPlayerResponse\s*=\s*({.+?})\s*;\s*(?:var\s+(?:meta|head)|<\/script|\n)/
const CHAT_WITH_YOUTUBE_APP_ID = 'cwy-app-container';

/**
 * Comparison function used to sort tracks by priority
 */
function compareTracks(track1, track2) {
    const langCode1 = track1.languageCode;
    const langCode2 = track2.languageCode;

    if (langCode1 === 'en' && langCode2 !== 'en') {
        return -1; // English comes first
    } else if (langCode1 !== 'en' && langCode2 === 'en') {
        return 1; // English comes first
    } else if (track1.kind !== 'asr' && track2.kind === 'asr') {
        return -1; // Non-ASR comes first
    } else if (track1.kind === 'asr' && track2.kind !== 'asr') {
        return 1; // Non-ASR comes first
    }

    return 0; // Preserve order if both have same priority
}

/**
 * Injects the chat component into the page
 * @returns {Promise<boolean>} true if chat was injected, false otherwise
 */
async function injectChat() {
    const videoID = new URLSearchParams(window.location.search).get('v')
    if (!videoID) {
        // Not on the video page, so we ignore this call
        return;
    }

    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) {
        // Can't find the chat container, so we ignore this call
        return;
    }

    // Possibly remove any existing chat components
    const appContainer = document.getElementById(CHAT_WITH_YOUTUBE_APP_ID);
    if (appContainer) {
        // App container already exists, so we check if it's for the same video
        const currentVideoID = appContainer.getAttribute('video-id');
        if (currentVideoID === videoID) {
            // Already injected chat for this video
            return true;
        } else {
            // Remove the existing chat component
            appContainer.remove();
        }
    }

    // Create the app container
    const app = document.createElement('div');
    app.id = CHAT_WITH_YOUTUBE_APP_ID;

    // Get the player response from the window (if available)
    let player = window.ytInitialPlayerResponse;

    // Either no player, or the player is for a different video
    if (!player || videoID !== player.videoDetails.videoId) {
        // In some cases, like when navigating, the player is not available on the window.
        // So, we just get the page info and parse it separately

        const pageData = fetch(`https://www.youtube.com/watch?v=${videoID}`);
        const body = await (await pageData).text();
        const playerResponse = body.match(YT_INITIAL_PLAYER_RESPONSE_RE);
        if (!playerResponse) {
            console.warn('Unable to parse playerResponse')
            return;
        }
        player = JSON.parse(playerResponse[1]);
    }

    // Get the metadata
    const metadata = {
        title: player.videoDetails.title,
        duration: player.videoDetails.lengthSeconds,
        author: player.videoDetails.author,
        views: player.videoDetails.viewCount,
    }

    // Get the tracks and sort them by priority
    const tracks = player.captions.playerCaptionsTracklistRenderer.captionTracks;
    tracks.sort(compareTracks);

    // Get the transcript
    const transcript = await (await fetch(tracks[0].baseUrl + '&fmt=json3')).json();
    const result = { transcript, metadata };

    // Create and render the react component
    const root = createRoot(app);
    root.render(<Chat info={result} />)

    // Just in case, remove any existing chat components
    const existingApp = document.getElementById(CHAT_WITH_YOUTUBE_APP_ID);
    if (existingApp) {
        existingApp.remove();
    }

    // Add the app to the page
    chatContainer.prepend(app)

    return true;
}

/**
 * Polls the page until the chat container is ready, then injects the chat component
 */
const startCheckingForReady = () => {
    const videoID = new URLSearchParams(window.location.search).get('v')
    if (!videoID) return;

    async function check() {
        const injected = await injectChat();
        if (!injected) {
            // The chat was not injected this time, so we try again in a bit
            setTimeout(checkForReadyInterval, 111);
        }
    };
    check();
}
startCheckingForReady();

// If this even is called, immediately inject chat
document.addEventListener('yt-navigate-finish', injectChat);
document.addEventListener('yt-navigate-start', startCheckingForReady);
