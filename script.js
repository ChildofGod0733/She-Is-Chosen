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

/* ======================
   DISCUSSION (EDIT + DELETE)
====================== */

window.postDiscussion = async function () {
  await addDoc(collection(db, "discussion"), {
    text: discussionInput.value,
    user: localStorage.getItem("name"),
    avatar: localStorage.getItem("avatar"),
    userId: currentUserId,
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

    let box = document.createElement("div")

    let img = document.createElement("img")
    img.src = d.avatar
    img.width = 30

    let name = document.createElement("b")
    name.innerText = d.user

    let text = document.createElement("p")
    text.innerText = d.text

    /* LIKE */
    let like = document.createElement("button")
    like.innerText = "❤️ " + (d.likes || 0)
    like.onclick = () => {
      updateDoc(doc(db, "discussion", docSnap.id), {
        likes: increment(1)
      })
    }

    /* EDIT */
    let editBtn = document.createElement("button")
    editBtn.innerText = "✏️"
    editBtn.onclick = async () => {
      let newText = prompt("Edit your post:", d.text)
      if (newText) {
        await updateDoc(doc(db, "discussion", docSnap.id), {
          text: newText
        })
      }
    }

    /* DELETE */
    let deleteBtn = document.createElement("button")
    deleteBtn.innerText = "🗑️"
    deleteBtn.onclick = async () => {
      if (confirm("Delete this post?")) {
        await deleteDoc(doc(db, "discussion", docSnap.id))
      }
    }

    /* REPLY */
    let replyBtn = document.createElement("button")
    replyBtn.innerText = "Reply"
    replyBtn.onclick = () => reply(docSnap.id)

    let repliesDiv = document.createElement("div")
    loadReplies(docSnap.id, repliesDiv)

    box.append(img, name, text, like, editBtn, deleteBtn, replyBtn, repliesDiv)
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

/* ======================
   JOURNAL (RESTORED)
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
    let p = document.createElement("p")
    p.innerText = d.user + ": " + d.text
    journalEntries.appendChild(p)
  })
})

/* ======================
   NOTES (RESTORED)
====================== */

window.saveNotes = function () {
  localStorage.setItem("notes", notes.value)
  alert("Notes saved!")
}

window.onload = function () {
  showSection("home")
  notes.value = localStorage.getItem("notes") || ""
}

/* ======================
   MUSIC (RESTORED)
====================== */

window.addMusic = function () {
  let link = musicLink.value

  let iframe = document.createElement("iframe")

  if (link.includes("youtube")) {
    let id = link.split("v=")[1]
    iframe.src = "https://www.youtube.com/embed/" + id
  }

  iframe.width = "300"
  iframe.height = "170"

  musicList.appendChild(iframe)
}
