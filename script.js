import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
import {
  getFirestore, collection, addDoc, onSnapshot, query, orderBy,
  doc, updateDoc, deleteDoc, increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"

/* ======================
   FIREBASE
====================== */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "she-is-chosen.firebaseapp.com",
  projectId: "she-is-chosen"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

let currentUser = null
let bibleData = []

/* ======================
   LOGIN (PERSISTENT)
====================== */

window.login = async function () {

  let email = username.value + "@chosen.com"
  let pass = password.value
  let name = firstName.value

  let user

  try {
    user = await signInWithEmailAndPassword(auth, email, pass)
  } catch {
    user = await createUserWithEmailAndPassword(auth, email, pass)
  }

  currentUser = user.user.uid

  localStorage.setItem("loggedIn", "true")
  localStorage.setItem("name", name)

  /* PROFILE PIC SAVE */
  let file = avatarUpload.files[0]
  if (file) {
    let reader = new FileReader()
    reader.onload = () => {
      localStorage.setItem("avatar", reader.result)
      profilePic.src = reader.result
    }
    reader.readAsDataURL(file)
  }

  profileName.innerText = name

  loginScreen.style.display = "none"
}

/* AUTO LOGIN FIX */
window.addEventListener("load", () => {
  if (localStorage.getItem("loggedIn") === "true") {
    loginScreen.style.display = "none"
  }
})
let avatar = localStorage.getItem("avatar")
if (avatar) {
  profilePic.src = avatar
}
/* ======================
   NAVIGATION
====================== */

window.showSection = function (id) {
  document.querySelectorAll(".section").forEach(s => s.style.display = "none")
  document.getElementById(id).style.display = "block"
}

/* ======================
   BIBLE SYSTEM
====================== */

fetch("bible.json")
  .then(res => res.json())
  .then(data => {
    bibleData = data
    loadBooks()
    verseOfDay()
  })

function loadBooks() {
  if (!bookList) return
  bookList.innerHTML = ""

  bibleData.forEach(book => {
    let btn = document.createElement("button")
    btn.innerText = book.name
    btn.onclick = () => loadChapters(book)
    bookList.appendChild(btn)
  })
}

function loadChapters(book) {
  chapterList.innerHTML = ""
  book.chapters.forEach((chap, i) => {
    let btn = document.createElement("button")
    btn.innerText = "Chapter " + (i + 1)
    btn.onclick = () => loadVerses(book.name, i + 1, chap)
    chapterList.appendChild(btn)
  })
}

function loadVerses(bookName, chapterNum, chap) {
  verseList.innerHTML = ""

  chap.forEach((v, i) => {
    let p = document.createElement("p")
    p.innerText = `${bookName} ${chapterNum}:${i + 1} ${v}`

    p.onclick = () => {
      p.style.background = "#ffd6ea"
      saveVerse(p.innerText)
    }

    verseList.appendChild(p)
  })
}

/* SAVE VERSES */

function saveVerse(v) {
  let fav = JSON.parse(localStorage.getItem("favorites") || "[]")
  fav.push(v)
  localStorage.setItem("favorites", JSON.stringify(fav))
  loadFavorites()
}

function loadFavorites() {
  let fav = JSON.parse(localStorage.getItem("favorites") || "[]")
  profileFavorites.innerHTML = ""

  fav.forEach((v, index) => {
    let div = document.createElement("div")

    let p = document.createElement("p")
    p.innerText = v

    let del = document.createElement("button")
    del.innerText = "❌"
    del.onclick = () => deleteVerse(index)

    div.append(p, del)
    profileFavorites.appendChild(div)
  })
}

function deleteVerse(index) {
  let fav = JSON.parse(localStorage.getItem("favorites") || "[]")

  fav.splice(index, 1)

  localStorage.setItem("favorites", JSON.stringify(fav))
  loadFavorites()
}

  fav.forEach(v => {
    let p = document.createElement("p")
    p.innerText = v
    profileFavorites.appendChild(p)
  })
}

/* SEARCH */

window.searchBible = function () {
  let term = searchInput.value.toLowerCase()
  verseList.innerHTML = ""

  bibleData.forEach(book => {
    book.chapters.forEach((chap, i) => {
      chap.forEach((v, j) => {
        if (v.toLowerCase().includes(term)) {
          let p = document.createElement("p")
          p.innerText = `${book.name} ${i + 1}:${j + 1} ${v}`
          verseList.appendChild(p)
        }
      })
    })
  })
}

/* VERSE OF DAY */

function verseOfDay() {
  let b = bibleData[Math.floor(Math.random() * bibleData.length)]
  let c = b.chapters[Math.floor(Math.random() * b.chapters.length)]
  let v = c[Math.floor(Math.random() * c.length)]

  document.getElementById("verseOfDay").innerText = "🌿 " + v
}

/* ======================
   NOTES
====================== */

window.saveNotes = function () {
  localStorage.setItem("notes", notes.value)
  loadNotes()
}

window.deleteNotes = function () {
  if (!confirm("Delete your notes?")) return

  localStorage.removeItem("notes")
  notes.value = ""
  profileNotes.innerText = ""
}

function loadNotes() {
  let n = localStorage.getItem("notes") || ""
  notes.value = n
  profileNotes.innerText = n
}
/* ======================
   JOURNAL
====================== */

window.saveJournal = async function () {
  await addDoc(collection(db, "journal"), {
    text: journalText.value,
    user: localStorage.getItem("name"),
    time: Date.now()
  })
  journalText.value = ""
}

/* ======================
   MUSIC
====================== */

window.addMusic = function () {
  let link = musicLink.value
  let iframe = document.createElement("iframe")

  if (link.includes("youtube")) {
    let id = link.split("v=")[1]
    iframe.src = "https://www.youtube.com/embed/" + id
  }

  iframe.width = "100%"
  iframe.height = "200"

  musicList.appendChild(iframe)
}

/* ======================
   DISCUSSION (FULL)
====================== */

window.postDiscussion = async function () {
  if (!discussionInput.value) return

  await addDoc(collection(db, "discussion"), {
    text: discussionInput.value,
    user: localStorage.getItem("name"),
    avatar: localStorage.getItem("avatar"),
    userId: currentUser,
    likes: 0,
    time: Date.now()
  })

  discussionInput.value = ""
}

const discussionQ = query(collection(db, "discussion"), orderBy("time"))

onSnapshot(discussionQ, snapshot => {
  discussionPosts.innerHTML = ""

  snapshot.forEach(docSnap => {
    let d = docSnap.data()

    let card = document.createElement("div")

    let p = document.createElement("p")
    p.innerText = d.user + ": " + d.text

    let like = document.createElement("button")
    like.innerText = "❤️ " + (d.likes || 0)
    like.onclick = () => {
      updateDoc(doc(db, "discussion", docSnap.id), {
        likes: increment(1)
      })
    }

    let edit = document.createElement("button")
    edit.innerText = "✏️"
    edit.onclick = async () => {
      if (d.userId !== currentUser) return
      let t = prompt("Edit:", d.text)
      if (t) updateDoc(doc(db, "discussion", docSnap.id), { text: t })
    }

    let del = document.createElement("button")
    del.innerText = "🗑️"
    del.onclick = () => {
      if (d.userId !== currentUser) return
      deleteDoc(doc(db, "discussion", docSnap.id))
    }

    card.append(p, like, edit, del)
    discussionPosts.appendChild(card)
  })
})

/* ======================
   STREAK + DEVOTIONAL
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

  streak.innerText = "🔥 Streak: " + streak
  showReward(streak)
}

function showReward(streak) {
  let msg = ""
  if (streak === 3) msg = "🌸 3 days!"
  else if (streak === 7) msg = "✨ 1 week!"
  else if (streak === 30) msg = "🔥 30 days!!"

  document.getElementById("streakReward").innerText = msg
}

function loadDevotional() {
  let devos = [
    "You are chosen 💖",
    "God is with you 🌿",
    "Be strong today ✨",
    "You are loved 💕",
    "Do not fear 🙏"
  ]

  let d = devos[new Date().getDate() % devos.length]

  document.getElementById("devotionalCard").innerText = d
}

/* ======================
   THEMES
====================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
import {
  getFirestore, collection, addDoc, onSnapshot, query, orderBy,
  doc, updateDoc, deleteDoc, increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"

/* ======================
   FIREBASE
====================== */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "she-is-chosen.firebaseapp.com",
  projectId: "she-is-chosen"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

let currentUser = null
let bibleData = []

/* ======================
   LOGIN (PERSISTENT)
====================== */

window.login = async function () {
  let email = username.value + "@chosen.com"
  let pass = password.value
  let name = firstName.value

  let user

  try {
    user = await signInWithEmailAndPassword(auth, email, pass)
  } catch {
    user = await createUserWithEmailAndPassword(auth, email, pass)
  }

  currentUser = user.user.uid

  localStorage.setItem("name", name)
  localStorage.setItem("loggedIn", "true")

  /* PROFILE IMAGE */
  let file = avatarUpload.files[0]
  if (file) {
    let reader = new FileReader()
    reader.onload = () => {
      localStorage.setItem("avatar", reader.result)
      profilePic.src = reader.result
    }
    reader.readAsDataURL(file)
  }

  profileName.innerText = name
  loginScreen.style.display = "none"
}

/* AUTO LOGIN */

if (localStorage.getItem("loggedIn") === "true") {
  loginScreen.style.display = "none"
}

/* ======================
   NAVIGATION
====================== */

window.showSection = function (id) {
  document.querySelectorAll(".section").forEach(s => s.style.display = "none")
  document.getElementById(id).style.display = "block"
}

/* ======================
   BIBLE SYSTEM
====================== */

fetch("bible.json")
  .then(res => res.json())
  .then(data => {
    bibleData = data
    loadBooks()
    verseOfDay()
  })

function loadBooks() {
  if (!bookList) return
  bookList.innerHTML = ""

  bibleData.forEach(book => {
    let btn = document.createElement("button")
    btn.innerText = book.name
    btn.onclick = () => loadChapters(book)
    bookList.appendChild(btn)
  })
}

function loadChapters(book) {
  chapterList.innerHTML = ""
  book.chapters.forEach((chap, i) => {
    let btn = document.createElement("button")
    btn.innerText = "Chapter " + (i + 1)
    btn.onclick = () => loadVerses(book.name, i + 1, chap)
    chapterList.appendChild(btn)
  })
}

function loadVerses(bookName, chapterNum, chap) {
  verseList.innerHTML = ""

  chap.forEach((v, i) => {
    let p = document.createElement("p")
    p.innerText = `${bookName} ${chapterNum}:${i + 1} ${v}`

    p.onclick = () => {
      p.style.background = "#ffd6ea"
      saveVerse(p.innerText)
    }

    verseList.appendChild(p)
  })
}

/* SAVE VERSES */

function saveVerse(v) {
  let fav = JSON.parse(localStorage.getItem("favorites") || "[]")
  fav.push(v)
  localStorage.setItem("favorites", JSON.stringify(fav))
  loadFavorites()
}

function loadFavorites() {
  let fav = JSON.parse(localStorage.getItem("favorites") || "[]")
  profileFavorites.innerHTML = ""

  fav.forEach(v => {
    let p = document.createElement("p")
    p.innerText = v
    profileFavorites.appendChild(p)
  })
}

/* SEARCH */

window.searchBible = function () {
  let term = searchInput.value.toLowerCase()
  verseList.innerHTML = ""

  bibleData.forEach(book => {
    book.chapters.forEach((chap, i) => {
      chap.forEach((v, j) => {
        if (v.toLowerCase().includes(term)) {
          let p = document.createElement("p")
          p.innerText = `${book.name} ${i + 1}:${j + 1} ${v}`
          verseList.appendChild(p)
        }
      })
    })
  })
}

/* VERSE OF DAY */

function verseOfDay() {
  let b = bibleData[Math.floor(Math.random() * bibleData.length)]
  let c = b.chapters[Math.floor(Math.random() * b.chapters.length)]
  let v = c[Math.floor(Math.random() * c.length)]

  document.getElementById("verseOfDay").innerText = "🌿 " + v
}

/* ======================
   NOTES
====================== */

window.saveNotes = function () {
  localStorage.setItem("notes", notes.value)
  loadNotes()
}

function loadNotes() {
  let n = localStorage.getItem("notes") || ""
  notes.value = n
  profileNotes.innerText = n
}

/* ======================
   JOURNAL
====================== */

window.saveJournal = async function () {
  await addDoc(collection(db, "journal"), {
    text: journalText.value,
    user: localStorage.getItem("name"),
    time: Date.now()
  })
  journalText.value = ""
}

/* ======================
   MUSIC
====================== */

window.addMusic = function () {
  let link = musicLink.value
  let iframe = document.createElement("iframe")

  if (link.includes("youtube")) {
    let id = link.split("v=")[1]
    iframe.src = "https://www.youtube.com/embed/" + id
  }

  iframe.width = "100%"
  iframe.height = "200"

  musicList.appendChild(iframe)
}

/* ======================
   DISCUSSION (FULL)
====================== */

window.postDiscussion = async function () {
  if (!discussionInput.value) return

  await addDoc(collection(db, "discussion"), {
    text: discussionInput.value,
    user: localStorage.getItem("name"),
    avatar: localStorage.getItem("avatar"),
    userId: currentUser,
    likes: 0,
    time: Date.now()
  })

  discussionInput.value = ""
}

const discussionQ = query(collection(db, "discussion"), orderBy("time"))

onSnapshot(discussionQ, snapshot => {
  discussionPosts.innerHTML = ""

  snapshot.forEach(docSnap => {
    let d = docSnap.data()

    let card = document.createElement("div")

    let p = document.createElement("p")
    p.innerText = d.user + ": " + d.text

    let like = document.createElement("button")
    like.innerText = "❤️ " + (d.likes || 0)
    like.onclick = () => {
      updateDoc(doc(db, "discussion", docSnap.id), {
        likes: increment(1)
      })
    }

    let edit = document.createElement("button")
    edit.innerText = "✏️"
    edit.onclick = async () => {
      if (d.userId !== currentUser) return
      let t = prompt("Edit:", d.text)
      if (t) updateDoc(doc(db, "discussion", docSnap.id), { text: t })
    }

    let del = document.createElement("button")
    del.innerText = "🗑️"
    del.onclick = () => {
      if (d.userId !== currentUser) return
      deleteDoc(doc(db, "discussion", docSnap.id))
    }

    card.append(p, like, edit, del)
    discussionPosts.appendChild(card)
  })
})

/* ======================
   STREAK + DEVOTIONAL
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

  streak.innerText = "🔥 Streak: " + streak
  showReward(streak)
}

function showReward(streak) {
  let msg = ""
  if (streak === 3) msg = "🌸 3 days!"
  else if (streak === 7) msg = "✨ 1 week!"
  else if (streak === 30) msg = "🔥 30 days!!"

  document.getElementById("streakReward").innerText = msg
}

function loadDevotional() {
  let devos = [
    "You are chosen 💖",
    "God is with you 🌿",
    "Be strong today ✨",
    "You are loved 💕",
    "Do not fear 🙏"
  ]

  let d = devos[new Date().getDate() % devos.length]

  document.getElementById("devotionalCard").innerText = d
}

/* ======================
   THEMES
====================== */

window.setTheme = function (theme) {
  localStorage.setItem("theme", theme)
  applyTheme(theme)
}

function applyTheme(theme) {

  document.body.className = ""  // reset EVERYTHING

  document.body.classList.add(theme)

}

/* ======================
   START
====================== */

window.onload = () => {
  showSection("home")

  loadNotes()
  loadFavorites()
  updateStreak()
  loadDevotional()

  profileName.innerText = localStorage.getItem("name")
  profilePic.src = localStorage.getItem("avatar")

  document.body.className = localStorage.getItem("theme") || "pink"
}
}

/* ======================
   START
====================== */

window.onload = () => {
  showSection("home")

  loadNotes()
  loadFavorites()
  updateStreak()
  loadDevotional()

  profileName.innerText = localStorage.getItem("name")

  let avatar = localStorage.getItem("avatar")
  if (avatar) profilePic.src = avatar

  applyTheme(localStorage.getItem("theme") || "pink")
}
