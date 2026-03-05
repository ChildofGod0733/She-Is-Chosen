import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
apiKey: "AIzaSyDKF0gf1cR1C4qto9iNnoKRKE7T4WO-KhI",
authDomain: "she-is-chosen.firebaseapp.com",
projectId: "she-is-chosen",
storageBucket: "she-is-chosen.firebasestorage.app",
messagingSenderId: "836410295991",
appId: "1:836410295991:web:d7831a2187d1e9b5602f32"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.showSection=function(id){
document.querySelectorAll("section").forEach(s=>s.classList.remove("active"))
document.getElementById(id).classList.add("active")
}

window.getVerse=async function(){
let ref=document.getElementById("reference").value
let res=await fetch(`https://bible-api.com/${ref}`)
let data=await res.json()
document.getElementById("verseResult").innerText=data.text
}

window.saveUsername=function(){
let name=document.getElementById("username").value
localStorage.setItem("username",name)
document.getElementById("welcome").innerText="Welcome "+name+" 🩷"
}

window.postDevotional=async function(){
let text=document.getElementById("devotionalText").value
await addDoc(collection(db,"devotionals"),{text})
}

window.postDiscussion=async function(){
let text=document.getElementById("discussionText").value
await addDoc(collection(db,"discussion"),{text})
}

window.addSong=async function(){
let link=document.getElementById("songLink").value
await addDoc(collection(db,"songs"),{link})
}

window.postTip=async function(){
let tip=document.getElementById("tipText").value
await addDoc(collection(db,"tips"),{tip})
}

window.saveNotes=async function(){
let text=document.getElementById("notesText").value
await addDoc(collection(db,"notes"),{text})
}

window.savePrayer=async function(){
let text=document.getElementById("prayerText").value
await addDoc(collection(db,"prayers"),{text})
}

async function getDailyVerse(){
let verses=["Jeremiah 29:11","Psalm 46:5","Isaiah 41:10","Romans 8:28"]
let random=verses[Math.floor(Math.random()*verses.length)]
let res=await fetch(`https://bible-api.com/${random}`)
let data=await res.json()
document.getElementById("dailyVerse").innerText=data.text
}

getDailyVerse()
