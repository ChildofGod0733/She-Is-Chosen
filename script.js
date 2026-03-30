import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
import {
  getFirestore, collection, addDoc, onSnapshot, query, orderBy,
  doc, updateDoc, deleteDoc, increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"

/* ======================
   FIREBASE SETUP
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
   AUTH
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

  // avatar
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

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user.uid
    loginScreen.style.display = "none"
  }
})

/* ======================
   NAV
====================== */

window.showSection = function (id) {
  document.querySelectorAll(".section").forEach(s => s.style.display = "none")
  document.getElementById(id).style.display = "block"
}

/* ======================
   BIBLE
====================== */

fetch("bible.json")
  .then(res => res.json())
  .then(data => {
    bibleData = data
    loadBooks()
    verseOfDay()
  })

function loadBooks() {
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

    p.onclick = () => saveVerse(p.innerText)

    verseList.appendChild(p)
  })
}

/* FAVORITES */

function saveVerse(v) {
  let fav = JSON.parse(localStorage.getItem("favorites") || "[]")
  if (!fav.includes(v)) fav.push(v)
  localStorage.setItem("favorites", JSON.stringify(fav))
  loadFavorites()
}

function loadFavorites() {
  let fav = JSON.parse(localStorage.getItem("favorites") || "[]")
  profileFavorites.innerHTML = ""

  fav.forEach((v, i) => {
    let div = document.createElement("div")
    div.innerHTML = `${v} <button onclick="deleteVerse(${i})">❌</button>`
    profileFavorites.appendChild(div)
  })
}

window.deleteVerse = function (i) {
  let fav = JSON.parse(localStorage.getItem("favorites") || "[]")
  fav.splice(i, 1)
  localStorage.setItem("favorites", JSON.stringify(fav))
  loadFavorites()
}

/* ======================
   NOTES
====================== */

window.saveNotes = function () {
  localStorage.setItem("notes", notes.value)
  loadNotes()
}

window.deleteNotes = function () {
  if (!confirm("Delete notes?")) return
  localStorage.removeItem("notes")
  notes.value = ""
  profileNotes.innerText = ""
}

function loadNotes() {
  let n = localStorage.getItem("notes") || ""
  notes.value = n
  profileNotes.innerText = n
}

/* SHARE NOTES */

window.shareNote = async function () {
  if (!notes.value) return

  await addDoc(collection(db, "sharedNotes"), {
    text: notes.value,
    user: localStorage.getItem("name"),
    time: Date.now()
  })
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

const journalQ = query(collection(db, "journal"), orderBy("time"))

onSnapshot(journalQ, snap => {
  journalEntries.innerHTML = ""
  snap.forEach(doc => {
    let d = doc.data()
    let div = document.createElement("div")
    div.innerText = d.user + ": " + d.text
    journalEntries.appendChild(div)
  })
})

/* ======================
   DISCUSSION + NOTIFS
====================== */

function sendNotification(text) {
  addDoc(collection(db, "notifications"), {
    text,
    time: Date.now()
  })
}

window.postDiscussion = async function () {
  if (!discussionInput.value) return

  await addDoc(collection(db, "discussion"), {
    text: discussionInput.value,
    user: localStorage.getItem("name"),
    userId: currentUser,
    likes: 0,
    time: Date.now()
  })

  sendNotification(localStorage.getItem("name") + " posted 💬")
  discussionInput.value = ""
}

const discussionQ = query(collection(db, "discussion"), orderBy("time"))

onSnapshot(discussionQ, snap => {
  discussionPosts.innerHTML = ""

  snap.forEach(docSnap => {
    let d = docSnap.data()

    let div = document.createElement("div")
    div.innerHTML = `
      <p>${d.user}: ${d.text}</p>
      <button onclick="likePost('${docSnap.id}')">❤️ ${d.likes || 0}</button>
    `

    discussionPosts.appendChild(div)
  })
})

window.likePost = function (id) {
  updateDoc(doc(db, "discussion", id), {
    likes: increment(1)
  })
}

/* ======================
   STREAK
====================== */

function updateStreak() {
  let today = new Date().toDateString()
  let last = localStorage.getItem("lastVisit")
  let count = parseInt(localStorage.getItem("streak") || "0")

  if (last !== today) {
    count++
    localStorage.setItem("streak", count)
    localStorage.setItem("lastVisit", today)
  }

  document.getElementById("streak").innerText = "🔥 " + count
}

/* ======================
   THEMES
====================== */

window.setTheme = function (theme) {
  localStorage.setItem("theme", theme)
  document.body.className = theme
}

/* ======================
   START
====================== */

window.onload = () => {
  showSection("home")
  loadNotes()
  loadFavorites()
  updateStreak()

  profileName.innerText = localStorage.getItem("name") || "User"

  let avatar = localStorage.getItem("avatar")
  if (avatar) profilePic.src = avatar

  document.body.className = localStorage.getItem("theme") || "pink"
}
