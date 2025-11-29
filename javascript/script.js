console.log("hello")

let currentsong = new Audio();
let songsList = [];
let currFolder;
// -----------------------------
// Fetch MP3 list from folder
// -----------------------------
async function getsongs(folder) {
    currFolder = folder;

    const res = await fetch(`./songs/${folder}/`);
    const html = await res.text();

    const div = document.createElement("div");
    div.innerHTML = html;

    const anchors = div.getElementsByTagName("a");
    const songs = [];

    for (let a of anchors) {
        if (a.href.endsWith(".mp3")) {
            songs.push(a.href.split(`/${folder}/`)[1]);
        }
    }

    songsList = songs;

    // Render list in UI

    const ul = document.querySelector(".songlist ul");
    if (ul) {
        ul.innerHTML = "";
       
        songsList.forEach(song => {
            const display = decodeURI(song);
            ul.insertAdjacentHTML(
                "beforeend",
                `
                <li data-track="${song}">
                    <img src="images/music.svg" class="invert" height="24">
                    <div class="info">
                        <div>${display}</div>
                        <div>${song.slice(0, 6)}</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <img src="images/play.svg" class="invert" height="24">
                    </div>
                </li>
                `
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

    currentsong.src = `/${currFolder}/` + song;

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
    // fetch root listing (adjust if you want a different path)
    const res = await fetch(`./songs`);
    const html = await res.text();
    // console.log(Response);

    let div = document.createElement("div");
    div.innerHTML = html;
    let anchors = div.getElementsByTagName("a");
    console.log(anchors);


    // adjust selector to your container element
    let cardcontainer = document.querySelector(".cardcontainer");
    console.log("cardcontainer=",cardcontainer);

    let array=Array.from(anchors);
    console.log("total links",cardcontainer);
    // for (let index = 0; index < array.length; index++) {
    //     const e = array[index];
    // for (let e of array) {
    //     console.log("link Href",e.href);
        
        array.forEach(async e => {
            console.log("found links",e.href);

        if (e.href.includes("songs/")){
console.log("skiiped",e.href);
            
        }
            
        {
            // const url=new URL(e.href);
            let folder = e.href.split("/").filter(Boolean).pop();
            // let folder=e.href.split("songs/")[1].split("/")[0];
            // if(!folder)
            // folder=folder.split("/")[0];
            
            if (!folder || folder.includes(".")) {
                console.log("wtf", e.href);
                return;
            }
            console.log("folder detected",folder);

            // console.log("anchors href=", e.getAttribute("href"))
            // console.log("FULL HREF=", e.href);
            // meta data fetch
            try {
                console.log("try block ruunun?",folder)
                const res2 = await fetch(`./songs/${folder}/info.json`);
                const data = await res2.json();
console.log("data",data);
                console.log(res2);
                if (cardcontainer) {
                    cardcontainer.innerHTML = cardcontainer.innerHTML + ` <div class="card border" data-folder="${folder}">
            <div class="album-wrapper">
              <img src="./songs/${folder}/cover.jpg" class="albumcover">
              <div class="play-overlay">
                <svg viewBox="0 0 48 48" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="24" fill="#1ED760" />
                  <polygon points="19,15 35,24 19,33" fill="#fff" />
                </svg>
              </div>
            </div>
            <div class="card-info">
              <h2 class="title">${data.title}</h2>
              <p class="artist">${data.description}</p>
            </div>
          </div>`;
                }
            } catch (err) {
                console.warn("Failed to load info for", folder, err);
            }
        }
    
    //   Array.from(document.querySelectorAll(".card")).forEach(card => {
    //     card.addEventListener("click", async () => {
    //         let folder = card.dataset.folder; // "gunna" or "folder"

    //         console.log("Opening:", `${folder}`);
    //         currentsong.pause();
    //         currentsong.currentTime = 0;
    //         songsList = await getsongs(`songs/${folder}`);
    //         if (songsList.length) {
    //             playMusic(songsList[0], true);
    //         }
    //     }
    //   )}
    Array.from(document.querySelectorAll(".card")).forEach(card => {
        card.addEventListener("click", async () => {
            let folder = card.dataset.folder; // "gunna" or "folder"

            console.log("Opening:", `${folder}`);

            currentsong.pause();
            currentsong.currentTime = 0;

            songsList = await getsongs(`songs/${folder}`);

            if (songsList.length) {
                playMusic(songsList[0], true);
                const playBtn = document.querySelector(".play");
                if (playBtn) playBtn.src = "images/pause.svg";
            }
        });
    });
    
    // Next button
    document.querySelector(".next")?.addEventListener("click", () => {
        if (!songsList.length) return;

        const i = songsList.findIndex(s => currentsong.src.endsWith(s));
        const next = (i + 1) % songsList.length;
        playMusic(songsList[next], true);
    });

    // Previous button
    document.querySelector(".previous")?.addEventListener("click", () => {
        if (!songsList.length) return;

        const i = songsList.findIndex(s => currentsong.src.endsWith(s));
        const prev = (i - 1 + songsList.length) % songsList.length;
        playMusic(songsList[prev], true);
    });

    // Seekbar
    document.querySelector(".seekbar")?.addEventListener("click", (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;

        if (!isNaN(currentsong.duration)) {
            currentsong.currentTime = currentsong.duration * ratio;
        }

        document.querySelector(".circle").style.left = `${ratio * 100}%`;
    });

    // Volume
    document.querySelector(".volume-slider")?.addEventListener("input", e => {
        currentsong.volume = e.target.value / 110;
    });
//play pause
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
    //mute button
document.querySelector(".volume>img")?.addEventListener("click", (e) => {    
    console.log("mute clicked");
    if (currentsong.muted) {
        currentsong.muted = false;
        e.currentTarget.src = "images/volume.svg";
        document.querySelector(".volume-slider").value = currentsong.volume * 110;
     
    } else {
        currentsong.muted = true;
        e.currentTarget.src = "images/mute.svg";
       document.querySelector(".volume-slider").value = 0;
    }
})
//event listerner for hamburger menu
document.querySelector(".hamburger-container")?.addEventListener("click", () => {
 document.querySelector(".left").style.left = "0px";
});
//event listener for close button
document.querySelector(".close")?.addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
});
// AUTO PLAY NEXT SONG WHEN CURRENT ENDS
currentsong.addEventListener("ended", () => {
    if (!songsList.length) return;

    const currentIndex = songsList.findIndex(s => currentsong.src.endsWith(s));
    const nextIndex = (currentIndex + 1) % songsList.length; // loops to start

    playMusic(songsList[nextIndex], true);
});


});

}
    

        



// console.log("div");


//main
async function main() {
    await getsongs("folder");

    if (songsList.length) {
        playMusic(songsList[0], false);
    }
    //display album
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

    // Folder switch (cards)
  
}

document.addEventListener("DOMContentLoaded", main);
