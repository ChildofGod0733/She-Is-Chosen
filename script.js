import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"

/* FIREBASE CONFIG */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "she-is-chosen.firebaseapp.com",
  projectId: "she-is-chosen",
  storageBucket: "she-is-chosen.firebasestorage.app",
  messagingSenderId: "836410295991",
  appId: "1:836410295991:web:d7831a2187d1e9b5602f32"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

let bibleData = []

let highlightStyle = localStorage.getItem("highlightStyle")

if (!highlightStyle) {
  highlightStyle = prompt("Highlight style: 1 Pastel 2 Neon 3 Bold")
  localStorage.setItem("highlightStyle", highlightStyle)
}

/* LOGIN */

window.login = function () {
  let name = document.getElementById("firstName").value
  let username = document.getElementById("username").value
  let password = document.getElementById("password").value

  if (password.length < 4) {
    alert("Password should be your first name and three numbers.")
    return
  }

  localStorage.setItem("name", name)
  localStorage.setItem("username", username)

  document.getElementById("loginScreen").style.display = "none"
}

/* TABS */

window.showSection = function (section) {
  document.querySelectorAll(".section").forEach(s => {
    s.style.display = "none"
  })

  document.getElementById(section).style.display = "block"
}

/* LOAD BIBLE */

fetch("bible.json")
  .then(res => res.json())
  .then(data => {
    bibleData = data
    loadBooks()
  })

function loadBooks() {
  let div = document.getElementById("bookList")
  div.innerHTML = ""

  bibleData.forEach(book => {
    let btn = document.createElement("button")
    btn.innerText = book.name
    btn.onclick = () => loadChapters(book)
    div.appendChild(btn)
  })
}

function loadChapters(book) {
  let div = document.getElementById("chapterList")
  div.innerHTML = ""

  book.chapters.forEach((chap, i) => {
    let btn = document.createElement("button")
    btn.innerText = "Chapter " + (i + 1)
    btn.onclick = () => loadVerses(chap)
    div.appendChild(btn)
  })
}

function loadVerses(chap) {
  let div = document.getElementById("verseList")
  div.innerHTML = ""

  chap.forEach((verse, i) => {
    let p = document.createElement("p")
    p.innerText = (i + 1) + ". " + verse
    p.onclick = () => highlightVerse(p)
    div.appendChild(p)
  })
}

/* HIGHLIGHT */

function highlightVerse(v) {
  if (highlightStyle == "1") v.style.background = "#ffd6f2"
  else if (highlightStyle == "2") v.style.background = "#39ff14"
  else v.style.background = "#ff69b4"
}

/* JOURNAL */

window.saveJournal = async function () {
  let text = document.getElementById("journalText").value
  let user = localStorage.getItem("username")

  await addDoc(collection(db, "journal"), {
    user: user,
    text: text,
    time: Date.now()
  })

  alert("Saved!")
}

/* MUSIC */

window.addMusic = function () {
  let link = document.getElementById("musicLink").value

  let iframe = document.createElement("iframe")
  iframe.src = link
  iframe.width = "300"
  iframe.height = "170"

  document.getElementById("musicList").appendChild(iframe)
}

/* DISCUSSION */

import { onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"

/* DISCUSSION */

window.postDiscussion = async function () {
  let text = document.getElementById("discussionInput").value
  let user = localStorage.getItem("username") || "Anonymous"

  await addDoc(collection(db, "discussion"), {
    user: user,
    text: text,
    time: Date.now()
  })
}

/* LIVE UPDATES */

const q = query(collection(db, "discussion"), orderBy("time"))

onSnapshot(q, (snapshot) => {
  let div = document.getElementById("discussionPosts")
  div.innerHTML = ""

  snapshot.forEach(doc => {
    let data = doc.data()

    let p = document.createElement("p")
    p.innerText = data.user + ": " + data.text

    div.appendChild(p)
  })
})

/* SEARCH */

window.searchBible = function () {
  let term = document.getElementById("searchInput").value.toLowerCase()
  let results = []

  bibleData.forEach(book => {
    book.chapters.forEach((chap, i) => {
      chap.forEach((verse, j) => {
        if (verse.toLowerCase().includes(term)) {
          results.push(book.name + " " + (i + 1) + ":" + (j + 1) + " " + verse)
        }
      })
    })
  })

  let div = document.getElementById("verseList")
  div.innerHTML = ""

  results.slice(0, 50).forEach(v => {
    let p = document.createElement("p")
    p.innerText = v
    div.appendChild(p)
  })
}
