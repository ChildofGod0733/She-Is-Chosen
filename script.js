import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
import {
  getFirestore, collection, addDoc, onSnapshot, query, orderBy,
  doc, updateDoc, increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "she-is-chosen.firebaseapp.com",
  projectId: "she-is-chosen"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

let currentUserId = null

/* LOGIN */

window.login = async function () {
  let email = username.value + "@chosen.com"
  let password = password.value
  let name = firstName.value
  let avatar = avatarURL.value

  try {
    let user = await signInWithEmailAndPassword(auth, email, password)
    currentUserId = user.user.uid
  } catch {
    let user = await createUserWithEmailAndPassword(auth, email, password)
    currentUserId = user.user.uid
  }

  localStorage.setItem("name", name)
  localStorage.setItem("avatar", avatar)

  profileName.innerText = name
  profilePic.src = avatar

  loginScreen.style.display = "none"
}

/* NAV */

window.showSection = function (id) {
  document.querySelectorAll(".section").forEach(s => s.style.display = "none")
  document.getElementById(id).style.display = "block"
}

/* DISCUSSION */

window.postDiscussion = async function () {
  await addDoc(collection(db, "discussion"), {
    text: discussionInput.value,
    user: localStorage.getItem("name"),
    avatar: localStorage.getItem("avatar"),
    userId: currentUserId,
    likes: 0,
    time: Date.now()
  })
}

const discussionQ = query(collection(db, "discussion"), orderBy("time"))

onSnapshot(discussionQ, snapshot => {
  discussionPosts.innerHTML = ""

  snapshot.forEach(docSnap => {
    let d = docSnap.data()

    let box = document.createElement("div")

    let img = document.createElement("img")
    img.src = d.avatar
    img.width = 30

    let name = document.createElement("b")
    name.innerText = d.user
    name.onclick = () => openProfile(d.user)

    let text = document.createElement("p")
    text.innerText = d.text

    let like = document.createElement("button")
    like.innerText = "❤️ " + (d.likes || 0)
    like.onclick = () => {
      updateDoc(doc(db, "discussion", docSnap.id), {
        likes: increment(1)
      })
    }

    let replyBtn = document.createElement("button")
    replyBtn.innerText = "Reply"
    replyBtn.onclick = () => reply(docSnap.id)

    let repliesDiv = document.createElement("div")

    loadReplies(docSnap.id, repliesDiv)

    box.append(img, name, text, like, replyBtn, repliesDiv)
    discussionPosts.appendChild(box)
  })
})

/* REPLIES */

async function reply(postId) {
  let text = prompt("Reply:")
  if (!text) return

  await addDoc(collection(db, "replies"), {
    postId,
    text,
    user: localStorage.getItem("name"),
    time: Date.now()
  })
}

function loadReplies(postId, container) {
  const q = query(collection(db, "replies"), orderBy("time"))

  onSnapshot(q, snap => {
    container.innerHTML = ""

    snap.forEach(doc => {
      let r = doc.data()
      if (r.postId === postId) {
        let p = document.createElement("p")
        p.innerText = "↳ " + r.user + ": " + r.text
        container.appendChild(p)
      }
    })
  })
}

/* PROFILE */

window.openProfile = function (username) {
  showSection("profile")

  profileName.innerText = username
  profilePosts.innerHTML = ""

  document.querySelectorAll("#discussionPosts b").forEach(el => {
    if (el.innerText === username) {
      let p = document.createElement("p")
      p.innerText = "Post by " + username
      profilePosts.appendChild(p)
    }
  })
}

/* SEARCH */

window.searchUsers = function () {
  let term = userSearch.value.toLowerCase()
  userResults.innerHTML = ""

  document.querySelectorAll("#discussionPosts b").forEach(el => {
    if (el.innerText.toLowerCase().includes(term)) {
      let p = document.createElement("p")
      p.innerText = el.innerText
      userResults.appendChild(p)
    }
  })
}

/* THEME */

window.setTheme = function (t) {
  if (t === "dark") document.body.style.background = "#222"
  else if (t === "sage") document.body.style.background = "#d8e8d8"
  else document.body.style.background = "#ffe6f1"
}

/* STREAK */

let today = new Date().toDateString()
if (localStorage.getItem("last") !== today) {
  let s = parseInt(localStorage.getItem("streak") || 0) + 1
  localStorage.setItem("streak", s)
  localStorage.setItem("last", today)
}

streak.innerText = "🔥 Streak: " + localStorage.getItem("streak")

/* START */

window.onload = () => showSection("home")
