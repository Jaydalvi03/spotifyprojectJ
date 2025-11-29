console.log("hello");

const BASE = "/spotifyprojectJ";  // <<<<<< ADDED FOR GITHUB PAGES

let currentsong = new Audio();
let songsList = [];
let currFolder;

// -----------------------------
// Fetch MP3 list from folder
// -----------------------------
async function getsongs(folder) {
    currFolder = folder;

    // FETCH the info.json inside the folder
    const res = await fetch(`${folder}/info.json`);
    const data = await res.json();
    const songs = data.songs || [];

    songsList = songs;

    const ul = document.querySelector(".songlist ul");
    if (ul) {
        ul.innerHTML = "";

        songsList.forEach(song => {
            const display = decodeURI(song);
            ul.insertAdjacentHTML(
                "beforeend",
                `<li data-track="${song}">
                    <img src="images/music.svg" class="invert" height="24">
                    <div class="info">
                        <div>${display}</div>
                        <div>${song.slice(0, 6)}</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <img src="images/play.svg" class="invert" height="24">
                    </div>
                </li>`
            );
        });

        ul.querySelectorAll("li").forEach(li => {
            li.addEventListener("click", () => {
                playMusic(li.dataset.track, true);
            });
        });
    }
    return songsList;
}

// -----------------------------
// Play a specific song
// -----------------------------
function playMusic(track, autoplay = true) {
    const song = track || songsList[0];
    if (!song) return;

    currentsong.src = `${currFolder}/` + song;   // Updated path 
    document.querySelector(".songinfo").innerHTML = decodeURI(song);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

    if (autoplay) {
        currentsong.play()
            .then(() => document.querySelector(".play").src = "images/pause.svg")
            .catch(e => console.log(e));
    }
}

// -----------------------------
// Main Init
// -----------------------------
async function displayalbums() {
    // FETCH only the root songs info.json
    const res = await fetch(`${BASE}/songs/info.json`);
    const data = await res.json();
    const folders = data.folders || [];

    let cardcontainer = document.querySelector(".cardcontainer");

    for (let folder of folders) {
        try {
            const res2 = await fetch(`${BASE}/songs/${folder}/info.json`);
            const albumData = await res2.json();

            if (cardcontainer) {
                cardcontainer.innerHTML += 
                `<div class="card border" data-folder="${folder}">
                    <div class="album-wrapper">
                        <img src="${BASE}/songs/${folder}/cover.jpg" class="albumcover">
                        <div class="play-overlay">
                            <svg viewBox="0 0 48 48" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="24" cy="24" r="24" fill="#1ED760" />
                                <polygon points="19,15 35,24 19,33" fill="#fff" />
                            </svg>
                        </div>
                    </div>
                    <div class="card-info">
                        <h2 class="title">${albumData.title}</h2>
                        <p class="artist">${albumData.description}</p>
                    </div>
                </div>`;
            }

        } catch (err) {
            console.warn("Failed to load info for", folder, err);
        }
    }

    Array.from(document.querySelectorAll(".card")).forEach(card => {
        card.addEventListener("click", async () => {
            let folder = card.dataset.folder;
            console.log("Opening:", folder);

            currentsong.pause();
            currentsong.currentTime = 0;

            songsList = await getsongs(`${BASE}/songs/${folder}`);

            if (songsList.length) {
                playMusic(songsList[0], true);
                const playBtn = document.querySelector(".play");
                if (playBtn) playBtn.src = "images/pause.svg";
            }
        });
    });

    document.querySelector(".next")?.addEventListener("click", () => {
        if (!songsList.length) return;

        const i = songsList.findIndex(s => currentsong.src.endsWith(s));
        const next = (i + 1) % songsList.length;
        playMusic(songsList[next], true);
    });

    document.querySelector(".previous")?.addEventListener("click", () => {
        if (!songsList.length) return;

        const i = songsList.findIndex(s => currentsong.src.endsWith(s));
        const prev = (i - 1 + songsList.length) % songsList.length;
        playMusic(songsList[prev], true);
    });

    document.querySelector(".seekbar")?.addEventListener("click", (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;

        if (!isNaN(currentsong.duration)) {
            currentsong.currentTime = currentsong.duration * ratio;
        }

        document.querySelector(".circle").style.left = `${ratio * 100}%`;
    });

    document.querySelector(".volume-slider")?.addEventListener("input", e => {
        currentsong.volume = e.target.value / 110;
    });

    const playBtn = document.querySelector(".play");
    if (playBtn) {
        playBtn.addEventListener("click", () => {
            if (currentsong.paused) {
                currentsong.play();
                playBtn.src = "images/pause.svg";
            } else {
                currentsong.pause();
                playBtn.src = "images/play.svg";
            }
        });
    }

    document.querySelector(".volume>img")?.addEventListener("click", (e) => {
        if (currentsong.muted) {
            currentsong.muted = false;
            e.currentTarget.src = "images/volume.svg";
            document.querySelector(".volume-slider").value = currentsong.volume * 110;
        } else {
            currentsong.muted = true;
            e.currentTarget.src = "images/mute.svg";
            document.querySelector(".volume-slider").value = 0;
        }
    });

    document.querySelector(".hamburger-container")?.addEventListener("click", () => {
        document.querySelector(".left").style.left = "0px";
    });

    document.querySelector(".close")?.addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    currentsong.addEventListener("ended", () => {
        if (!songsList.length) return;

        const currentIndex = songsList.findIndex(s => currentsong.src.endsWith(s));
        const nextIndex = (currentIndex + 1) % songsList.length;

        playMusic(songsList[nextIndex], true);
    });
}

//MAIN
async function main() {
    // Replace 'gunna' with your actual first album folder
    await getsongs(`${BASE}/songs/gunna`);

    if (songsList.length) {
        playMusic(songsList[0], false);
    }

    displayalbums();

    currentsong.addEventListener("timeupdate", () => {
        if (isNaN(currentsong.duration)) return;

        let cur = currentsong.currentTime;
        let dur = currentsong.duration;

        const pad = n => n.toString().padStart(2, "0");

        document.querySelector(".songtime").innerHTML =
            `${pad(Math.floor(cur / 60))}:${pad(Math.floor(cur % 60))} / ${pad(Math.floor(dur / 60))}:${pad(Math.floor(dur % 60))}`;

        const circle = document.querySelector(".circle");
        if (circle) {
            circle.style.left = `${(cur / dur) * 100}%`;
        }
    });
}

document.addEventListener("DOMContentLoaded", main);

