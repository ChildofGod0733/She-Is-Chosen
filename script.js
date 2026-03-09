function showSection(section){

document.querySelectorAll(".section").forEach(sec=>{
sec.classList.add("hidden")
})

document.getElementById(section).classList.remove("hidden")

}


function highlightVerse(){

let verse = document.getElementById("verseText")

verse.style.background = "#fff3a6"

}


function favoriteVerse(){

let verse = document.getElementById("verseText").innerText

let saved = document.createElement("p")

saved.innerText = verse

document.getElementById("favoriteList").appendChild(saved)

}

function saveJournal(){

let text = document.getElementById("journalEntry").value

if(text === "") return

let entry = document.createElement("p")
entry.innerText = text

document.getElementById("savedPrayers").appendChild(entry)

document.getElementById("journalEntry").value = ""

}


function postDiscussion(){

let text = document.getElementById("discussionInput").value

if(text === "") return

let post = document.createElement("p")
post.innerText = text

document.getElementById("discussionPosts").appendChild(post)

document.getElementById("discussionInput").value=""

}
function loadSpotify(){

let link = document.getElementById("spotifyLink").value

if(link.includes("open.spotify.com")){

let embed = link.replace("open.spotify.com","open.spotify.com/embed")

document.getElementById("spotifyPlayer").innerHTML =
`<iframe style="border-radius:12px" src="${embed}" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`

}

}
const verses = [

"Trust in the Lord with all your heart – Proverbs 3:5",

"I can do all things through Christ – Philippians 4:13",

"Be still and know that I am God – Psalm 46:10",

"The Lord is my shepherd – Psalm 23:1",

"Let all that you do be done in love – 1 Corinthians 16:14"

]

function loadVerse(){

let random = Math.floor(Math.random()*verses.length)

document.getElementById("dailyVerse").innerText = verses[random]

}

loadVerse()
