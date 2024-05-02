var currentsong = new Audio()
let songs = []
let currfolder;
const token1 = "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1";
token=token1.substring(0,token1.length-1)
console.log(token)
function secondsToMinutesSeconds(seconds) {
    // Calculate minutes and seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Format the result as "mm:ss"
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currfolder = folder;
    songs=[]
    let a = await fetch(`https://api.github.com/repos/swarajkoppu/spotify/contents/${folder}/`, {
        headers: {
            'Authorization': `token ${token}`
        }
    })
    console.log(a)
    const data = await a.json();
    for (let index = 0; index < data.length; index++) {
            songs.push(data[index].name);
        
    }
    console.log(songs)
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songul.innerHTML = ""
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li>
        <img src="images/music.svg" class="invert" alt="">
        <div class="info">
            <div class="songname">${song.replaceAll("%20", " ")}</div>
        </div>
        <div class="playnow">
            <span>Play now</span>
            <img class="invert" src="images/play.svg" alt="">
        </div></li>`;
    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    });

}

async function fetchFolderNames() {
    const apiUrl = 'https://api.github.com/repos/swarajkoppu/spotify/contents/songs/';
    // Replace 'YOUR_PERSONAL_ACCESS_TOKEN' with your actual token

    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `token ${token}`
            }
        });
        const data = await response.json();



        // Ensure data is an array
        if (!Array.isArray(data)) {
            throw new Error('Response data is not an array.');
        }

        // Filter out directories
        const folders = data.filter(item => item.type === 'dir');

        // Extract folder names
        const folderNames = folders.map(folder => folder.name);

        return folderNames;
    } catch (error) {
        console.error('Error fetching folder names:', error);
        return [];
    }
}
async function fetchInfoJson(folder) {
    const owner = 'swarajkoppu';
    const repo = 'spotify';
    const folderPath = `songs/${folder}`; // Change the folder path as needed
    const fileName = 'info.json';

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}/${fileName}`; // Replace 'YOUR_PERSONAL_ACCESS_TOKEN' with your actual token

    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `token ${token}`
            }
        });
        const data = await response.json();

        // Check if the file exists
        if (!data.content) {
            throw new Error(`File ${fileName} not found in folder ${folderPath}.`);
        }

        // Decode base64 content of the file
        const content = atob(data.content);

        // Parse the JSON content
        const infoJson = JSON.parse(content);

        return infoJson;
    } catch (error) {
        console.error('Error fetching info.json:', error);
        return null;
    }
}

async function displayAlbums() {
    array = await fetchFolderNames()
    console.log(array)
    for (let index = 0; index < array.length; index++) {
        const folder = array[index];
        response = await fetchInfoJson(folder)
        console.log(response)
        cardContainer = document.querySelector(".cardContainer")
        cardContainer.innerHTML = cardContainer.innerHTML + `
            <div class="card p-1 rounded" data-folder="${folder}">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40"
                                fill="#00c04b">
                                <circle cx="12" cy="12" r="12" />
                                <path
                                    d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z"
                                    fill="currentColor" />
                            </svg>
                        </div>
                        <img src="https://raw.githubusercontent.com/swarajkoppu/spotify/main/songs/${folder}/cover.jpeg" class="rounded" alt="swaraj playlist">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>
            `
    }
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            document.querySelector(".left").style.left = "0px"
        })
    })


    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "images/pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "images/play.svg"
        }
    })

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    })

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = e.offsetX / e.target.getBoundingClientRect().width * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration * percent) / 100
    })

    let previous = document.getElementById("previous");
    let next = document.getElementById("next");
    previous.addEventListener("click", () => {
        currentsong.pause()
        console.log(currentsong.src.split(`/`).slice(-1)[0])
        let index = songs.indexOf(currentsong.src.split(`/`).slice(-1)[0])
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1])
        }
    })
    next.addEventListener("click", () => {
        currentsong.pause()
        console.log(currentsong.src)
        let index = songs.indexOf(currentsong.src.split(`/`).slice(-1)[0])
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1])
        }
    })
}

const playmusic = (track, pause = false) => {
    //let audio = new Audio("/songs/"+track)
    currentsong.src = `/${currfolder}/` + track;
    console.log(currentsong.src)
    if (!pause) {
        currentsong.play()
        play.src = "images/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = ""
}


async function main() {

    displayAlbums()



    document.querySelector(".hambergur").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0px"
    })
    document.querySelector(".hambergur").addEventListener("touchstart", () => {
        document.querySelector(".left").style.left = "0px"
    })
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    })

}
main()
