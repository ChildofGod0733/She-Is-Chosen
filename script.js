```javascript
let bibleData={}

function openTab(name){

let tabs=document.getElementsByClassName("tab")

for(let t of tabs){
 t.style.display="none"
}

document.getElementById(name).style.display="block"
}

openTab("bible")

// LOAD FULL BIBLE

fetch("https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/en-kjv/books.json")
.then(res=>res.json())
.then(data=>{

bibleData=data

let bookSelect=document.getElementById("bookSelect")

for(let book of data){

let option=document.createElement("option")

option.value=book.id
option.textContent=book.name

bookSelect.appendChild(option)

}

loadChapters()

})

function loadChapters(){

let chapterSelect=document.getElementById("chapterSelect")

chapterSelect.innerHTML=""

for(let i=1;i<=50;i++){

let opt=document.createElement("option")
opt.value=i
opt.textContent="Chapter "+i

chapterSelect.appendChild(opt)

}

}

function loadChapter(){

let book=document.getElementById("bookSelect").value
let chapter=document.getElementById("chapterSelect").value

fetch(`https://bible-api.com/${book}+${chapter}`)
.then(res=>res.json())
.then(data=>{

let html=""

for(let v of data.verses){

html+=`<div class="verse" onclick="highlightVerse(this,'${v.text}')">${v.verse}. ${v.text}</div>`

}

document.getElementById("bibleText").innerHTML=html

})

}

function highlightVerse(el,text){

el.classList.toggle("highlight")

let saved=JSON.parse(localStorage.getItem("highlights")||"[]")

if(!saved.includes(text)){
saved.push(text)
}

localStorage.setItem("highlights",JSON.stringify(saved))

showHighlights()

}

function showHighlights(){

let saved=JSON.parse(localStorage.getItem("highlights")||"[]")

let html=""

for(let v of saved){
html+=v+"<br><br>"
}

document.getElementById("highlightList").innerHTML=html

}

showHighlights()

function saveNote(){

let note=document.getElementById("noteInput").value

let saved=JSON.parse(localStorage.getItem("notes")||"[]")

saved.push(note)

localStorage.setItem("notes",JSON.stringify(saved))

showNotes()

}

function showNotes(){

let saved=JSON.parse(localStorage.getItem("notes")||"[]")

let html=""

for(let n of saved){
html+=n+"<br><br>"
}

document.getElementById("notesList").innerHTML=html

}

showNotes()
```
