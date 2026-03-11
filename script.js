import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"

/* FIREBASE CONFIG */

const firebaseConfig = {
  apiKey: "AIzaSyDKF0gf1cR1C4qto9iNnoKRKE7T4WO-KhI",
  authDomain: "she-is-chosen.firebaseapp.com",
  projectId: "she-is-chosen",
  storageBucket: "she-is-chosen.firebasestorage.app",
  messagingSenderId: "836410295991",
  appId: "1:836410295991:web:d7831a2187d1e9b5602f32"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"></script>
  
let bibleData=[]

let highlightStyle=localStorage.getItem("highlightStyle")

if(!highlightStyle){

highlightStyle=prompt("Highlight style: 1 Pastel 2 Neon 3 Bold")

localStorage.setItem("highlightStyle",highlightStyle)

}

/* LOGIN */

function login(){

let pass=document.getElementById("password").value

if(pass.length<4){

alert("Password should be your first name and three numbers.")

return

}

document.getElementById("loginScreen").style.display="none"

}

/* TABS */

function showSection(section){

document.querySelectorAll(".section").forEach(s=>{

s.style.display="none"

})

document.getElementById(section).style.display="block"

}

/* LOAD BIBLE */

fetch("bible.json")

.then(res=>res.json())

.then(data=>{

bibleData=data

loadBooks()

})

function loadBooks(){

let div=document.getElementById("bookList")

div.innerHTML=""

bibleData.forEach(book=>{

let btn=document.createElement("button")

btn.innerText=book.name

btn.onclick=()=>loadChapters(book)

div.appendChild(btn)

})

}

function loadChapters(book){

let div=document.getElementById("chapterList")

div.innerHTML=""

book.chapters.forEach((chap,i)=>{

let btn=document.createElement("button")

btn.innerText="Chapter "+(i+1)

btn.onclick=()=>loadVerses(chap)

div.appendChild(btn)

})

}

function loadVerses(chap){

let div=document.getElementById("verseList")

div.innerHTML=""

chap.forEach((verse,i)=>{

let p=document.createElement("p")

p.innerText=(i+1)+". "+verse

p.onclick=()=>highlightVerse(p)

div.appendChild(p)

})

}

/* HIGHLIGHT */

function highlightVerse(v){

if(highlightStyle=="1") v.style.background="#ffd6f2"

else if(highlightStyle=="2") v.style.background="#39ff14"

else v.style.background="#ff69b4"

}

/* FAVORITES */

function addFavorite(text){

let div=document.createElement("p")

div.innerText=text

document.getElementById("favoriteList").appendChild(div)

}

/* JOURNAL */

function saveJournal(){

let text=document.getElementById("journalText").value

let p=document.createElement("p")

p.innerText=text

document.getElementById("journalEntries").appendChild(p)

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

let p=document.createElement("p")

p.innerText=text

document.getElementById("discussionPosts").appendChild(p)

}

/* SEARCH */

function searchBible(){

let term=document.getElementById("searchInput").value.toLowerCase()

let results=[]

bibleData.forEach(book=>{

book.chapters.forEach((chap,i)=>{

chap.forEach((verse,j)=>{

if(verse.toLowerCase().includes(term)){

results.push(book.name+" "+(i+1)+":"+ (j+1)+" "+verse)

}

})

})

})

let div=document.getElementById("verseList")

div.innerHTML=""

results.slice(0,50).forEach(v=>{

let p=document.createElement("p")

p.innerText=v

div.appendChild(p)

})

}
