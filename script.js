import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"

/* FIREBASE */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "she-is-chosen.firebaseapp.com",
  projectId: "she-is-chosen",
  storageBucket: "she-is-chosen.firebasestorage.app",
  messagingSenderId: "836410295991",
  appId: "1:836410295991:web:d7831a2187d1e9b5602f32"
  const auth = getAuth(app)
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

/* GLOBAL */

let bibleData = []

/* ======================
   LOGIN
====================== */

window.login = function () {
  let name = document.getElementById("firstName").value
  let username = document.getElementById("username").value
  let password = document.getElementById("password").value
  let avatar = document.getElementById("avatarURL")?.value || ""

  if (password.length < 4) {
    alert("Password must be name + 3 numbers")
    return
  }

  localStorage.setItem("name", name)
  localStorage.setItem("username", username)
  localStorage.setItem("avatar", avatar)

  document.getElementById("loginScreen").style.display = "none"
}

/* ======================
   NAVIGATION
====================== */

window.showSection = function (section) {
  document.querySelectorAll(".section").forEach(s => s.style.display = "none")
  document.getElementById(section).style.display = "block"
}

/* ======================
   BIBLE
====================== */

fetch("bible.json")
  .then(res => res.json())
  .then(data => {
    bibleData = data
    loadBooks()
    loadVerseOfDay()
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
    btn.onclick = () => loadVerses(chap, book.name, i + 1)
    div.appendChild(btn)
  })
}

function loadVerses(chap, bookName, chapterNum) {
  let div = document.getElementById("verseList")
  div.innerHTML = ""

  chap.forEach((verse, i) => {
    let container = document.createElement("div")

    let p = document.createElement("p")
    p.innerText = `${bookName} ${chapterNum}:${i + 1} ${verse}`
    p.onclick = () => p.classList.toggle("highlight")

    let favBtn = document.createElement("button")
    favBtn.innerText = "⭐"
    favBtn.onclick = (e) => {
      e.stopPropagation()
      addFavorite(p.innerText)
    }

    container.appendChild(p)
    container.appendChild(favBtn)
    div.appendChild(container)
  })
}

/* ======================
   FAVORITES
====================== */

window.addFavorite = function (text) {
  let favs = JSON.parse(localStorage.getItem("favorites") || "[]")
  favs.push(text)
  localStorage.setItem("favorites", JSON.stringify(favs))
  loadFavorites()
}

function loadFavorites() {
  let div = document.getElementById("favoriteList")
  div.innerHTML = ""

  let favs = JSON.parse(localStorage.getItem("favorites") || "[]")

  favs.forEach(f => {
    let p = document.createElement("p")
    p.innerText = f
    div.appendChild(p)
  })
}

/* ======================
   JOURNAL (LIVE)
====================== */

window.saveJournal = async function () {
  let text = document.getElementById("journalText").value
  let user = localStorage.getItem("name") || "Anonymous"

  await addDoc(collection(db, "journal"), {
    user,
    text,
    time: Date.now()
  })

  document.getElementById("journalText").value = ""
}

const journalQ = query(collection(db, "journal"), orderBy("time"))

onSnapshot(journalQ, (snapshot) => {
  let div = document.getElementById("journalEntries")
  div.innerHTML = ""

  snapshot.forEach(doc => {
    let data = doc.data()

    let p = document.createElement("p")
    p.innerText = `${data.user}: ${data.text}`

    div.appendChild(p)
  })
})

/* ======================
   DISCUSSION (LIVE + LIKES + REPLIES)
====================== */

window.postDiscussion = async function () {
  let text = document.getElementById("discussionInput").value
  let user = localStorage.getItem("name") || "Anonymous"
  let avatar = localStorage.getItem("avatar") || ""

  await addDoc(collection(db, "discussion"), {
    user,
    text,
    avatar,
    likes: 0,
    time: Date.now()
  })

  document.getElementById("discussionInput").value = ""
}

window.replyToPost = async function (postId) {
  let text = prompt("Write a reply:")
  if (!text) return

  let user = localStorage.getItem("name") || "Anonymous"

  await addDoc(collection(db, "replies"), {
    postId,
    user,
    text,
    time: Date.now()
  })
}

const discussionQ = query(collection(db, "discussion"), orderBy("time"))

onSnapshot(discussionQ, (snapshot) => {
  let div = document.getElementById("discussionPosts")
  div.innerHTML = ""

  snapshot.forEach(docSnap => {
    let data = docSnap.data()

    let container = document.createElement("div")

    let img = document.createElement("img")
    img.src = data.avatar || "https://via.placeholder.com/30"
    img.style.width = "30px"
    img.style.borderRadius = "50%"

    let p = document.createElement("p")
    p.innerText = `${data.user}: ${data.text}`

    let likeBtn = document.createElement("button")
    likeBtn.innerText = `❤️ ${data.likes || 0}`

    let replyBtn = document.createElement("button")
    replyBtn.innerText = "Reply"
    replyBtn.onclick = () => replyToPost(docSnap.id)

    container.appendChild(img)
    container.appendChild(p)
    container.appendChild(likeBtn)
    container.appendChild(replyBtn)

    div.appendChild(container)
  })
})

const repliesQ = query(collection(db, "replies"), orderBy("time"))

onSnapshot(repliesQ, (snapshot) => {
  snapshot.forEach(doc => {
    let data = doc.data()

    let reply = document.createElement("p")
    reply.innerText = `↳ ${data.user}: ${data.text}`
    reply.style.marginLeft = "20px"

    document.getElementById("discussionPosts").appendChild(reply)
  })
})

/* ======================
   MUSIC
====================== */

window.addMusic = function () {
  let link = document.getElementById("musicLink").value

  let iframe = document.createElement("iframe")

  if (link.includes("youtube.com") || link.includes("youtu.be")) {
    let id = link.split("v=")[1] || link.split("/").pop()
    iframe.src = "https://www.youtube.com/embed/" + id
  } else {
    iframe.src = link
  }

  iframe.width = "300"
  iframe.height = "170"

  document.getElementById("musicList").appendChild(iframe)
}

/* ======================
   SEARCH
====================== */

window.searchBible = function () {
  let term = document.getElementById("searchInput").value.toLowerCase()
  let results = []

  bibleData.forEach(book => {
    book.chapters.forEach((chap, i) => {
      chap.forEach((verse, j) => {
        if (verse.toLowerCase().includes(term)) {
          results.push(`${book.name} ${i + 1}:${j + 1} ${verse}`)
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

/* ======================
   VERSE OF THE DAY
====================== */

function loadVerseOfDay() {
  if (!bibleData.length) return

  let book = bibleData[Math.floor(Math.random() * bibleData.length)]
  let chapter = book.chapters[Math.floor(Math.random() * book.chapters.length)]
  let verse = chapter[Math.floor(Math.random() * chapter.length)]

  let el = document.getElementById("verseOfDay")
  if (el) {
    el.innerText = `🌿 ${book.name}: ${verse}`
  }
}

/* ======================
   ON LOAD
====================== */

window.onload = function () {
  showSection("bible")
  loadFavorites()
}
