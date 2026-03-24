import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
import {
  getFirestore, collection, addDoc, onSnapshot, query, orderBy,
  doc, updateDoc, deleteDoc, increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"

/* FIREBASE */

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

/* LOGIN (PERSISTENT FIXED) */

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

  /* IMAGE UPLOAD */
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

  localStorage.setItem("loggedIn", "true")

  loginScreen.style.display = "none"
}

/* AUTO LOGIN */

if (localStorage.getItem("loggedIn") === "true") {
  loginScreen.style.display = "none"
}

/* NAV */

window.showSection = function (id) {
  document.querySelectorAll(".section").forEach(s => s.style.display = "none")
  document.getElementById(id).style.display = "block"
}

/* ======================
   BIBLE (FULL UPGRADE)
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

    p.onclick = () => {
      p.style.background = "#ffd6ea"
      saveVerse(p.innerText)
    }

    verseList.appendChild(p)
  })
}

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
   NOTES (FIXED)
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
   THEME (SAVED + GLOBAL)
====================== */

window.setTheme = function (t) {
  localStorage.setItem("theme", t)
  applyTheme(t)
}

function applyTheme(t) {
  document.body.className = ""

  if (t === "dark") document.body.classList.add("dark")
  else if (t === "sage") document.body.classList.add("sage")
  else if (t === "ocean") document.body.classList.add("ocean")
  else if (t === "sunset") document.body.classList.add("sunset")
  else document.body.classList.add("pink")
}

/* ======================
   START
====================== */

window.onload = () => {
  showSection("home")
  loadNotes()
  loadFavorites()

  profileName.innerText = localStorage.getItem("name")
  profilePic.src = localStorage.getItem("avatar")

  applyTheme(localStorage.getItem("theme") || "pink")
}
