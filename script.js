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

/* LOGIN FIXED */

window.login = async function () {
  let email = document.getElementById("username").value + "@chosen.com"
  let pass = document.getElementById("password").value
  let name = document.getElementById("firstName").value

  try {
    await signInWithEmailAndPassword(auth, email, pass)
  } catch {
    await createUserWithEmailAndPassword(auth, email, pass)
  }

  localStorage.setItem("name", name)

  /* IMAGE UPLOAD */
  let file = document.getElementById("avatarUpload").files[0]
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
  document.body.style.transition = "all 0.5s ease"
}

/* NAV */

window.showSection = function (id) {
  document.querySelectorAll(".section").forEach(s => s.style.display = "none")
  document.getElementById(id).style.display = "block"
}

/* DISCUSSION FULL */

window.postDiscussion = async function () {
  await addDoc(collection(db, "discussion"), {
    text: discussionInput.value,
    user: localStorage.getItem("name"),
    avatar: localStorage.getItem("avatar"),
    likes: 0,
    time: Date.now()
  })
}

const q = query(collection(db, "discussion"), orderBy("time"))

onSnapshot(q, snap => {
  discussionPosts.innerHTML = ""

  snap.forEach(docSnap => {
    let d = docSnap.data()

    let box = document.createElement("div")

    let img = document.createElement("img")
    img.src = d.avatar
    img.width = 30

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
      let newText = prompt("Edit:", d.text)
      if (newText) {
        await updateDoc(doc(db, "discussion", docSnap.id), { text: newText })
      }
    }

    let del = document.createElement("button")
    del.innerText = "🗑️"
    del.onclick = () => deleteDoc(doc(db, "discussion", docSnap.id))

    box.append(img, p, like, edit, del)
    discussionPosts.appendChild(box)
  })
})

/* JOURNAL */

window.saveJournal = async function () {
  await addDoc(collection(db, "journal"), {
    text: journalText.value,
    user: localStorage.getItem("name"),
    time: Date.now()
  })
}

/* NOTES */

window.saveNotes = function () {
  localStorage.setItem("notes", notes.value)
  profileNotes.innerText = notes.value
}

/* MUSIC */

window.addMusic = function () {
  let iframe = document.createElement("iframe")
  let id = musicLink.value.split("v=")[1]
  iframe.src = "https://www.youtube.com/embed/" + id
  iframe.width = 300
  iframe.height = 170
  musicList.appendChild(iframe)
}

/* THEMES */

window.setTheme = function (t) {
  if (t === "dark") document.body.style.background = "#222"
  else if (t === "sage") document.body.style.background = "#d8e8d8"
  else if (t === "ocean") document.body.style.background = "#aee1f9"
  else if (t === "sunset") document.body.style.background = "#ffb347"
  else document.body.style.background = "#ffe6f1"
}

/* NOTIFICATIONS */

window.showNotifications = function () {
  notifications.innerText = "✨ New activity coming soon!"
}

/* PROFILE LOAD */

window.onload = () => {
  showSection("home")
  profileName.innerText = localStorage.getItem("name")
  profilePic.src = localStorage.getItem("avatar")
}
