let bibleData = []

let highlightStyle = localStorage.getItem("highlightStyle")

if(!highlightStyle){

highlightStyle = prompt(
"Choose highlight style:\n1 Pastel\n2 Neon\n3 Bold"
)

localStorage.setItem("highlightStyle",highlightStyle)

}

/* LOGIN */

function login(){

let pass = document.getElementById("password").value

if(pass.length < 4){

alert("Password should be your first name and three numbers.")

return

}

document.getElementById("loginScreen").style.display="none"

}

/* TABS */

function showSection(section){

let sections = document.querySelectorAll(".section")

sections.forEach(s => s.style.display="none")

document.getElementById(section).style.display="block"

}

/* BIBLE LOADING */

fetch("bible.json")

.then(res=>res.json())

.then(data=>{

bibleData=data

loadBooks()

})

function loadBooks(){

let bookDiv = document.getElementById("bookList")

bookDiv.innerHTML=""

bibleData.forEach(book => {

let btn=document.createElement("button")

btn.innerText=book.name

btn.onclick=()=>loadChapters(book)

bookDiv.appendChild(btn)

})

}

function loadChapters(book){

let chapterDiv=document.getElementById("chapterList")

chapterDiv.innerHTML=""

book.chapters.forEach((chapter,index)=>{

let btn=document.createElement("button")

btn.innerText="Chapter "+(index+1)

btn.onclick=()=>loadVerses(chapter)

chapterDiv.appendChild(btn)

})

}

function loadVerses(chapter){

let verseDiv=document.getElementById("verseList")

verseDiv.innerHTML=""

chapter.forEach((verse,i)=>{

let p=document.createElement("p")

p.innerText=(i+1)+". "+verse

p.onclick=()=>highlightVerse(p)

verseDiv.appendChild(p)

})

}

function highlightVerse(v){

if(highlightStyle=="1") v.style.background="#ffd6f2"

if(highlightStyle=="2") v.style.background="#39ff14"

if(highlightStyle=="3") v.style.background="#ff69b4"

}

/* JOURNAL */

function saveJournal(){

let text=document.getElementById("journalText").value

let div=document.createElement("p")

div.innerText=text

document.getElementById("journalEntries").appendChild(div)

}

/* MUSIC */

function addMusic(){

let link=document.getElementById("musicLink").value

let iframe=document.createElement("iframe")

iframe.src=link

iframe.width="300"

iframe.height="170"

document.getElementById("musicList").appendChild(iframe)

}

/* DISCUSSION */

function postDiscussion(){

let text=document.getElementById("discussionInput").value

let div=document.createElement("p")

div.innerText=text

document.getElementById("discussionPosts").appendChild(div)

}
