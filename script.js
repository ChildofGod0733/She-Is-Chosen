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

/* ======================
   LOGIN (FIXED)
====================== */

window.login = async function () {
  let email = document.getElementById("username").value + "@chosen.com"
  let pass = document.getElementById("password").value
  let name = document.getElementById("firstName").value

  if (!email || !pass) {
    alert("Please fill everything")
    return
  }

  try {
    let user = await signInWithEmailAndPassword(auth, email, pass)
    currentUser = user.user.uid
  } catch {
    let user = await createUserWithEmailAndPassword(auth, email, pass)
    currentUser = user.user.uid
  }

  localStorage.setItem("name", name)

  /* PROFILE IMAGE UPLOAD */
  let file = document.getElementById("avatarUpload").files[0]
  if (file) {
    let reader = new FileReader()
    reader.onload = () => {
      localStorage.setItem("avatar", reader.result)
      document.getElementById("profilePic").src = reader.result
    }
    reader.readAsDataURL(file)
  }

  document.getElementById("profileName").innerText = name
  document.getElementById("loginScreen").style.display = "none"
}

/* ======================
   NAVIGATION
====================== */

window.showSection = function (id) {
  document.querySelectorAll(".section").forEach(s => s.style.display = "none")
  document.getElementById(id).style.display = "block"
}

/* ======================
   DISCUSSION (FULL SYSTEM)
====================== */

window.postDiscussion = async function () {
  let text = document.getElementById("discussionInput").value

  if (!text) return

  await addDoc(collection(db, "discussion"), {
    text,
    user: localStorage.getItem("name"),
    avatar: localStorage.getItem("avatar"),
    userId: currentUser,
    likes: 0,
    time: Date.now()
  })

  document.getElementById("discussionInput").value = ""
}

/* LOAD POSTS */

const discussionQ = query(collection(db, "discussion"), orderBy("time"))

onSnapshot(discussionQ, snapshot => {
  let container = document.getElementById("discussionPosts")
  container.innerHTML = ""

  snapshot.forEach(docSnap => {
    let d = docSnap.data()

    let card = document.createElement("div")

    /* PROFILE ROW */
    let header = document.createElement("div")

    let img = document.createElement("img")
    img.src = d.avatar || ""
    img.width = 30

    let name = document.createElement("b")
    name.innerText = d.user

    header.append(img, name)

    /* TEXT */
    let text = document.createElement("p")
    text.innerText = d.text

    /* BUTTONS ROW */
    let actions = document.createElement("div")

    /* LIKE */
    let like = document.createElement("button")
    like.innerText = "❤️ " + (d.likes || 0)
    like.onclick = () => {
      updateDoc(doc(db, "discussion", docSnap.id), {
        likes: increment(1)
      })
    }

    /* EDIT */
    let edit = document.createElement("button")
    edit.innerText = "✏️"
    edit.onclick = async () => {
      if (d.userId !== currentUser) return alert("Not your post")
      let newText = prompt("Edit post:", d.text)
      if (newText) {
        await updateDoc(doc(db, "discussion", docSnap.id), {
          text: newText
        })
      }
    }

    /* DELETE */
    let del = document.createElement("button")
    del.innerText = "🗑️"
    del.onclick = async () => {
      if (d.userId !== currentUser) return alert("Not your post")
      await deleteDoc(doc(db, "discussion", docSnap.id))
    }

    /* REPLY */
    let replyBtn = document.createElement("button")
    replyBtn.innerText = "💬"
    replyBtn.onclick = () => reply(docSnap.id)

    actions.append(like, replyBtn, edit, del)

    /* REPLIES CONTAINER */
    let repliesDiv = document.createElement("div")
    loadReplies(docSnap.id, repliesDiv)

    card.append(header, text, actions, repliesDiv)
    container.appendChild(card)
  })
})

/* ======================
   REPLIES
====================== */

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
        p.style.marginLeft = "20px"
        container.appendChild(p)
      }
    })
  })
}

/* ======================
   JOURNAL
====================== */

window.saveJournal = async function () {
  let text = document.getElementById("journalText").value

  await addDoc(collection(db, "journal"), {
    text,
    user: localStorage.getItem("name"),
    time: Date.now()
  })

  document.getElementById("journalText").value = ""
}

const journalQ = query(collection(db, "journal"), orderBy("time"))

onSnapshot(journalQ, snap => {
  let div = document.getElementById("journalEntries")
  div.innerHTML = ""

  snap.forEach(doc => {
    let d = doc.data()
    let p = document.createElement("p")
    p.innerText = d.user + ": " + d.text
    div.appendChild(p)
  })
})

/* ======================
   NOTES
====================== */

window.saveNotes = function () {
  let val = document.getElementById("notes").value
  localStorage.setItem("notes", val)
  document.getElementById("profileNotes").innerText = val
}

function loadNotes() {
  let val = localStorage.getItem("notes") || ""
  document.getElementById("notes").value = val
  document.getElementById("profileNotes").innerText = val
}

/* ======================
   MUSIC
====================== */

window.addMusic = function () {
  let link = document.getElementById("musicLink").value
  if (!link) return

  let iframe = document.createElement("iframe")

  if (link.includes("youtube")) {
    let id = link.split("v=")[1]
    iframe.src = "https://www.youtube.com/embed/" + id
  }

  iframe.width = "100%"
  iframe.height = "200"

  document.getElementById("musicList").appendChild(iframe)
}

/* ======================
   THEMES (FULL)
====================== */

window.setTheme = function (t) {
  document.body.style.transition = "all 0.5s ease"

  if (t === "dark") {
    document.body.style.background = "#121212"
    document.body.style.color = "white"
  }
  else if (t === "sage") {
    document.body.style.background = "#d8e8d8"
    document.body.style.color = "#2f4f2f"
  }
  else if (t === "ocean") {
    document.body.style.background = "#aee1f9"
    document.body.style.color = "#034f84"
  }
  else if (t === "sunset") {
    document.body.style.background = "#ffb347"
    document.body.style.color = "#5a2a00"
  }
  else {
    document.body.style.background = "#ffe6f1"
    document.body.style.color = "#444"
  }
}

/* ======================
   NOTIFICATIONS
====================== */

window.showNotifications = function () {
  let box = document.getElementById("notifications")
  box.style.display = box.style.display === "block" ? "none" : "block"
  box.innerText = "✨ New features coming!"
}

/* ======================
   STREAK
====================== */

function updateStreak() {
  let today = new Date().toDateString()
  let last = localStorage.getItem("last")

  let streak = parseInt(localStorage.getItem("streak") || "0")

  if (last !== today) {
    streak++
    localStorage.setItem("streak", streak)
    localStorage.setItem("last", today)
  }

  document.getElementById("streak").innerText = "🔥 Streak: " + streak
}

/* ======================
   START
====================== */

window.onload = () => {
  showSection("home")
  loadNotes()
  updateStreak()

  document.getElementById("profileName").innerText = localStorage.getItem("name")
  document.getElementById("profilePic").src = localStorage.getItem("avatar")
}
