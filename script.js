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

alert("Verse added to favorites ⭐")

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
