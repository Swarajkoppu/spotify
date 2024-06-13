var currentsong = new Audio()
let songs = []
let likedsongs = []
let currfolder;
const token1 = "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1";
token = token1.substring(0, token1.length - 1)
function secondsToMinutesSeconds(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
function addLikedSong(albumName, songName) {
    if (typeof (Storage) !== "undefined") {
        var likedSongs = JSON.parse(localStorage.getItem("likedSongs")) || [];
        likedSongs.push({ album: albumName, song: songName });
        localStorage.setItem("likedSongs", JSON.stringify(likedSongs));
    } else {
        console.log("Sorry, your browser does not support Web Storage...");
    }
}
function getLikedSongs() {
    if (typeof (Storage) !== "undefined") {
        var likedSongs = JSON.parse(localStorage.getItem("likedSongs")) || [];
        return likedSongs;
    } else {
        console.log("Sorry, your browser does not support Web Storage...");
        return [];
    }
}
function deleteLikedSong(albumName, songName) {
    if (typeof(Storage) !== "undefined") {
        var likedSongs = JSON.parse(localStorage.getItem("likedSongs")) || [];
        likedSongs = likedSongs.filter(function(song) {
            return song.album !== albumName || song.song !== songName;
        });
        localStorage.setItem("likedSongs", JSON.stringify(likedSongs));
    } else {
        console.log("Sorry, your browser does not support Web Storage...");
    }
}
function getMp3Name(filePath) {
    const parts = filePath.split('/');
    const mp3Name = parts[parts.length - 1];
    return mp3Name;
}
function getAlbum(filePath) {
    const parts = filePath.split('/');
    const mp3Name = parts[parts.length - 2];
    return mp3Name;
}
function likedsongsrender() {
    let likes = getLikedSongs()
    for (let index = 0; index < likes.length; index++) {
        songs.push(likes[index].album.replaceAll("_"," ")+"/"+likes[index].song)
        likedsongs.push(likes[index].album.replaceAll("_"," ")+"/"+likes[index].song)   
    }
    console.log(likedsongs)
    let queuelist = document.querySelector(".queuelist").getElementsByTagName("ul")[0]
    queuelist.innerHTML = ""
    console.log(likes)
    for (index = 0; index < likes.length; index++) {
        queuelist.innerHTML = queuelist.innerHTML + `<li>
                    <img src="images/music.svg" class="invert" alt="">
                    <div class="info">
                        <div class="songname" data-album=${likes[index].album}>${likes[index].song}</div>
                    </div>
                    <div class="playnow">
                        <img class="invert" src="images/play.svg" alt="">
                    </div></li>`;
        const playButtons = document.querySelectorAll('.playnow');
        playButtons.forEach(button => {
            button.addEventListener('click', function () {
                const songName = this.parentElement.querySelector('.songname').textContent;
                const dataAlbumValue = this.parentElement.querySelector('.songname').getAttribute('data-album').replaceAll("_", " ");
                console.log(dataAlbumValue, songName)
                playmusic(dataAlbumValue, songName)
                console.log(songs)
            });
        });
    }
}
function likedornot(album,song)
{
    liked= false
    for(index=0;index<likedsongs.length;index++)
        {
            if(likedsongs[index]==("songs/"+album+"/"+song))
                {
                    liked=true
                    break
                }
        }
    if(liked)
        return "<div class='alreadyliked'><img src='images/alreadyliked.svg' alt='alreadyliked'></div> "
    else
        return "<div class='notliked'><img src='images/heart.svg' alt='notliked'></div> "
}
async function getSongs(folder) {
    currfolder = folder;
    songs = []
    let a = await fetch(`https://api.github.com/repos/swarajkoppu/spotify/contents/${folder}/`, {
        headers: {
            'Authorization': `token ${token}`
        }
    })
    console.log(a)

    const data = await a.json();
    console.log(data)
    for (let index = 0; index < data.length; index++) {
        if (data[index].name.match(".mp3") != null) {
            songs.push(data[index].path);
        }
    }

    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songul.innerHTML = ""
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li>
        <img src="images/music.svg" class="invert" alt="">
        <div class="info">
            <div class="songname" data-album=${"songs/" + getAlbum(song).replaceAll(" ", "_")}>${getMp3Name(song)}</div>
        </div>
        <div class="queue">
            ${likedornot(getAlbum(song),getMp3Name(song))}
        </div>
        <div class="playnow">
            <img class="invert" src="images/play.svg" alt="">
        </div></li>`;
        const playButtons = document.querySelectorAll('.playnow');
        playButtons.forEach(button => {
            button.addEventListener('click', function () {
                const songName = this.parentElement.querySelector('.songname').textContent;
                const dataAlbumValue = this.parentElement.querySelector('.songname').getAttribute('data-album').replaceAll("_", " ");
                playmusic(dataAlbumValue, songName)
            });
        });
    }

    const queueButtons = document.querySelectorAll('.queue');
    queueButtons.forEach(button => {
        button.addEventListener('click', function () {
            const songName = this.parentElement.querySelector('.songname').textContent;
            if(this.firstElementChild.className=="notliked")
                {
                    this.innerHTML="<div class='alreadyliked'><img src='images/alreadyliked.svg' alt='alreadyliked'></div>"
                    addLikedSong(currfolder.replaceAll(" ", "_"), songName.replaceAll("%20", " "))
                    likedsongsrender()
                }
                else
                {
                    this.innerHTML="<div class='notliked'><img src='images/heart.svg' alt='notliked'></div> "
                    deleteLikedSong(currfolder.replaceAll(" ", "_"), songName.replaceAll("%20", " "))
                    likedsongsrender()
                }
        });
    });

}

async function fetchFolderNames() {
    const apiUrl = 'https://api.github.com/repos/swarajkoppu/spotify/contents/songs/';
    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `token ${token}`
            }
        });
        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error('Response data is not an array.');
        }
        const folders = data.filter(item => item.type === 'dir');
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
    const folderPath = `songs/${folder}`;
    const fileName = 'info.json';

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}/${fileName}`;

    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `token ${token}`
            }
        });
        const data = await response.json();
        if (!data.content) {
            throw new Error(`File ${fileName} not found in folder ${folderPath}.`);
        }
        const content = atob(data.content);
        const infoJson = JSON.parse(content);

        return infoJson;
    } catch (error) {
        console.error('Error fetching info.json:', error);
        return null;
    }
}
function getPathFromURL(url) {
    const parts = url.split('/');
    const songsIndex = parts.indexOf('songs');
    const path = parts.slice(songsIndex).join('/');
    return path;
}
function nextSong() {
    let index = songs.indexOf(getPathFromURL(currentsong.src.replaceAll("%20", " ")))
    console.log(index)
    if ((index + 1) < songs.length) {
        playmusic('songs/' + getAlbum(songs[index + 1]), getMp3Name(songs[index + 1]))
    }
    else if ((index + 1) == songs.length) {
        playmusic('songs/' + getAlbum(songs[0]), getMp3Name(songs[0]))
    }
}
function previousSong() {
    currentsong.pause()
    let index = songs.indexOf(getPathFromURL(currentsong.src.replaceAll("%20", " ")))
    if ((index - 1) >= 1) {
        playmusic('songs/' + getAlbum(songs[index - 1]), getMp3Name(songs[index - 1]))
    }
    else if ((index - 1) == 0) {
        playmusic('songs/' + getAlbum(songs[0]), getMp3Name(songs[0]))
    }
}
async function displayAlbums() {
    array = await fetchFolderNames()

    for (let index = 0; index < array.length; index++) {
        const folder = array[index];
        response = await fetchInfoJson(folder)

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
                        <h3>${response.title}</h3>
                        <p>${response.description}</p>
                    </div>
            `
            Array.from(document.getElementsByClassName("card")).forEach(e => {
                e.addEventListener("click", async item => {
                    await getSongs(`songs/${item.currentTarget.dataset.folder}`)
                    document.querySelector(".left").style.left = "0px"
                })
            })
    }
    


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
        if ((currentsong.currentTime / currentsong.duration) == 1) {
            nextSong()
        }
    })

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = e.offsetX / e.target.getBoundingClientRect().width * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration * percent) / 100
    })

    let previous = document.getElementById("previous");
    let next = document.getElementById("next");
    previous.addEventListener("click", () => {
        previousSong()
    })
    next.addEventListener("click", () => {
        nextSong()
    })
}

const playmusic = (album, track, pause = false) => {
    console.log(currfolder)
    currentsong.src = `https://raw.githubusercontent.com/swarajkoppu/spotify/main/${album}/${track}`;
    console.log(currentsong.src)
    if (!pause) {
        playPromise = currentsong.play()
        if (playPromise !== undefined) {
            playPromise.then(_ => {
            })
                .catch(error => {
                    playPromise = currentsong.play()
                });
            play.src = "images/pause.svg"
        }
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = ""
}


async function main() {
    likedsongsrender()
    
    displayAlbums()
    
    document.querySelector(".hambergur").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0px"
    })
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    })
    document.getElementById("queuebarbutton").addEventListener("click", () => {
        songs=[]
        likedsongsrender()
        document.querySelector(".queuebar").style.left = "0px"
    })
    document.getElementById("closequeue").addEventListener("click", () => {
        document.querySelector(".queuebar").style.left = "-100%"
    })
}
main()

