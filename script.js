```javascript
let highlightColor="yellow"

function openTab(name){

let tabs=document.getElementsByClassName("tab")

for(let t of tabs){

 t.style.display="none"

}


document.getElementById(name).style.display="block"

}

openTab("bible")

function setColor(color){

highlightColor=color

}

let bibleBooks=[]

fetch("https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/en-kjv/books.json")

.then(res=>res.json())

.then(data=>{

bibleBooks=data

let select=document.getElementById("bookSelect")

for(let book of data){

let option=document.createElement("option")

option.value=book.id

option.textContent=book.name

select.appendChild(option)

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

html+=`<div class="verse" onclick="highlightVerse(this)">${v.verse}. ${v.text}</div>`

}

document.getElementById("bibleText").innerHTML=html

})

}

function highlightVerse(el){

el.classList.toggle(`highlight-${highlightColor}`)

let text=el.innerText

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

function saveFavorite(text){

let saved=JSON.parse(localStorage.getItem("favorites")||"[]")

saved.push(text)

localStorage.setItem("favorites",JSON.stringify(saved))

showFavorites()

}

function showFavorites(){

let saved=JSON.parse(localStorage.getItem("favorites")||"[]")

let html=""

for(let v of saved){

html+=v+"<br><br>"

}


document.getElementById("favoriteList").innerHTML=html

}

showFavorites()

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

function savePrayer(){

let prayer=document.getElementById("prayerInput").value

let saved=JSON.parse(localStorage.getItem("prayers")||"[]")

saved.push(prayer)

localStorage.setItem("prayers",JSON.stringify(saved))

showPrayers()

}

function showPrayers(){

let saved=JSON.parse(localStorage.getItem("prayers")||"[]")

let html=""

for(let p of saved){

html+=p+"<br><br>"

}


document.getElementById("prayerList").innerHTML=html

}

showPrayers()

function postDiscussion(){

let text=document.getElementById("discussionInput").value

let saved=JSON.parse(localStorage.getItem("discussion")||"[]")

saved.push(text)

localStorage.setItem("discussion",JSON.stringify(saved))

showDiscussion()

}

function showDiscussion(){

let saved=JSON.parse(localStorage.getItem("discussion")||"[]")

let html=""

for(let d of saved){

html+=d+"<br><br>"

}


document.getElementById("discussionList").innerHTML=html

}

showDiscussion()

const verses=[

"Psalm 46:1 God is our refuge and strength.",
"Proverbs 3:5 Trust in the Lord with all your heart.",
"Jeremiah 29:11 For I know the plans I have for you.",
"Joshua 1:9 Be strong and courageous."

]

let verse=verses[Math.floor(Math.random()*verses.length)]

document.getElementById("dailyVerse").innerText="Verse of the Day: "+verse

function searchBible(){

let q=document.getElementById("searchBox").value.toLowerCase()

fetch(`https://bible-api.com/${q}`)

.then(res=>res.json())

.then(data=>{

let html=""

for(let v of data.verses){

html+=v.book_name+" "+v.chapter+":"+v.verse+" "+v.text+"<br><br>"

}


document.getElementById("searchResults").innerHTML=html

})

}
```

