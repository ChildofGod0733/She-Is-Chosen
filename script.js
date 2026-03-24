import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
import {
  getFirestore, collection, addDoc, onSnapshot, query, orderBy,
  doc, updateDoc, increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"

/* ======================
   FIREBASE
====================== */

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
const auth = getAuth(app)

/* ======================
   GLOBAL
====================== */

let bibleData = []
let currentUserId = null

/* ======================
   AUTH LOGIN
====================== */

window.login = async function () {
  let email = document.getElementById("username").value + "@chosen.com"
  let password = document.getElementById("password").value
  let name = document.getElementById("firstName").value
  let avatar = document.getElementById("avatarURL")?.value || ""

  try {
    let userCred = await signInWithEmailAndPassword(auth, email, password)
    currentUserId = userCred.user.uid
  } catch {
    let userCred = await createUserWithEmailAndPassword(auth, email, password)
    currentUserId = userCred.user.uid
  }

  localStorage.setItem("name", name)
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
    let p = document.createElement("p")
    p.innerText = `${bookName} ${chapterNum}:${i + 1} ${verse}`
    p.onclick = () => p.classList.toggle("highlight")

    let fav = document.createElement("button")
    fav.innerText = "⭐"
    fav.onclick = () => addFavorite(p.innerText)

    div.appendChild(p)
    div.appendChild(fav)
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
   DISCUSSION (FULL SYSTEM)
====================== */

window.postDiscussion = async function () {
  let text = document.getElementById("discussionInput").value
  let user = localStorage.getItem("name")
  let avatar = localStorage.getItem("avatar")

  await addDoc(collection(db, "discussion"), {
    user,
    text,
    avatar,
    likes: 0,
    userId: currentUserId,
    time: Date.now()
  })
}

window.replyToPost = async function (postId, postOwnerId) {
  let text = prompt("Reply:")
  if (!text) return

  let user = localStorage.getItem("name")

  await addDoc(collection(db, "replies"), {
    postId,
    user,
    text,
    time: Date.now()
  })

  if (postOwnerId !== currentUserId) {
    await addDoc(collection(db, "notifications"), {
      to: postOwnerId,
      text: user + " replied to your post 💬",
      time: Date.now()
    })
  }
}

/* LOAD POSTS */

const discussionQ = query(collection(db, "discussion"), orderBy("time"))

onSnapshot(discussionQ, (snapshot) => {
  let div = document.getElementById("discussionPosts")
  div.innerHTML = ""

  snapshot.forEach(docSnap => {
    let data = docSnap.data()

    let box = document.createElement("div")

    let img = document.createElement("img")
    img.src = data.avatar || "https://via.placeholder.com/30"
    img.style.width = "30px"
    img.style.borderRadius = "50%"

    let name = document.createElement("b")
    name.innerText = data.user
    name.style.cursor = "pointer"
    name.onclick = () => showProfile(data.user)

    let text = document.createElement("p")
    text.innerText = data.text

    let likeBtn = document.createElement("button")
    likeBtn.innerText = `❤️ ${data.likes || 0}`
    likeBtn.onclick = async () => {
      await updateDoc(doc(db, "discussion", docSnap.id), {
        likes: increment(1)
      })
    }

    let replyBtn = document.createElement("button")
    replyBtn.innerText = "Reply"
    replyBtn.onclick = () => replyToPost(docSnap.id, data.userId)

    box.appendChild(img)
    box.appendChild(name)
    box.appendChild(text)
    box.appendChild(likeBtn)
    box.appendChild(replyBtn)

    div.appendChild(box)
  })
})

/* ======================
   REPLIES
====================== */

const repliesQ = query(collection(db, "replies"), orderBy("time"))

onSnapshot(repliesQ, (snapshot) => {
  snapshot.forEach(doc => {
    let data = doc.data()

    let p = document.createElement("p")
    p.innerText = `↳ ${data.user}: ${data.text}`
    p.style.marginLeft = "20px"

    document.getElementById("discussionPosts").appendChild(p)
  })
})

/* ======================
   PROFILE
====================== */

window.showProfile = function (username) {
  showSection("profile")

  let div = document.getElementById("profileContent")
  div.innerHTML = `<h2>${username}'s Posts</h2>`
}

/* ======================
   USER SEARCH
====================== */

window.searchUsers = function () {
  let term = document.getElementById("userSearch").value.toLowerCase()

  let div = document.getElementById("userResults")
  div.innerHTML = ""

  document.querySelectorAll("#discussionPosts b").forEach(el => {
    if (el.innerText.toLowerCase().includes(term)) {
      let p = document.createElement("p")
      p.innerText = el.innerText
      div.appendChild(p)
    }
  })
}

/* ======================
   STREAK TRACKER
====================== */

function updateStreak() {
  let today = new Date().toDateString()
  let last = localStorage.getItem("lastVisit")
  let streak = parseInt(localStorage.getItem("streak") || "0")

  if (last !== today) {
    streak++
    localStorage.setItem("streak", streak)
    localStorage.setItem("lastVisit", today)
  }

  let el = document.getElementById("streak")
  if (el) el.innerText = "🔥 Streak: " + streak
}

/* ======================
   THEME SWITCHER
====================== */

window.setTheme = function (theme) {
  if (theme === "dark") document.body.style.background = "#222"
  else if (theme === "sage") document.body.style.background = "#d8e8d8"
  else document.body.style.background = "#ffe6f1"
}

/* ======================
   VERSE OF DAY
====================== */

function loadVerseOfDay() {
  if (!bibleData.length) return

  let book = bibleData[Math.floor(Math.random() * bibleData.length)]
  let chapter = book.chapters[Math.floor(Math.random() * book.chapters.length)]
  let verse = chapter[Math.floor(Math.random() * chapter.length)]

  let el = document.getElementById("verseOfDay")
  if (el) el.innerText = `🌿 ${book.name}: ${verse}`
}

/* ======================
   MUSIC
====================== */

window.addMusic = function () {
  let link = document.getElementById("musicLink").value
  let iframe = document.createElement("iframe")

  if (link.includes("youtube")) {
    let id = link.split("v=")[1]
    iframe.src = "https://www.youtube.com/embed/" + id
  }

  iframe.width = "300"
  iframe.height = "170"

  document.getElementById("musicList").appendChild(iframe)
}

/* ======================
   ON LOAD
====================== */

window.onload = function () {
  showSection("home")
  loadFavorites()
  updateStreak()
}
