/* =====================================================
   SHE IS CHOSEN
   MAIN SCRIPT
===================================================== */

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  increment,
  where
} from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


/* =====================================================
   FIREBASE
===================================================== */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "she-is-chosen.firebaseapp.com",
  projectId: "she-is-chosen",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


/* =====================================================
   GLOBAL VARIABLES
===================================================== */

let currentUser = null;
let bibleData = [];

const $ = id => document.getElementById(id);


/* =====================================================
   LOGIN
===================================================== */

window.login = async function () {

  const name = $("firstName").value.trim();
  const usernameValue = $("username").value.trim();
  const passwordValue = $("password").value;

  if (!name || !usernameValue || !passwordValue) {
    alert("Please fill in your name, username, and password. 🌸");
    return;
  }

  const email =
    usernameValue.toLowerCase().replace(/\s/g, "") + "@chosen.com";

  try {

    let result;

    try {
      result = await signInWithEmailAndPassword(
        auth,
        email,
        passwordValue
      );
    } catch (signInError) {

      if (
        signInError.code === "auth/user-not-found" ||
        signInError.code === "auth/invalid-credential"
      ) {

        result = await createUserWithEmailAndPassword(
          auth,
          email,
          passwordValue
        );

      } else {
        throw signInError;
      }
    }

    currentUser = result.user.uid;

    localStorage.setItem("name", name);

    const file = $("avatarUpload").files[0];

    if (file) {

      const reader = new FileReader();

      reader.onload = () => {

        localStorage.setItem(
          "avatar",
          reader.result
        );

        if ($("profilePic")) {
          $("profilePic").src = reader.result;
        }
      };

      reader.readAsDataURL(file);
    }

    updateProfileDisplay();

    $("loginScreen").style.display = "none";

    alert("Welcome to She is Chosen! 🌸🦋");

  } catch (error) {

    console.error("Login error:", error);

    alert(
      "We couldn't log you in. Please check your information and try again. 💕"
    );
  }
};


/* =====================================================
   AUTH STATE
===================================================== */

onAuthStateChanged(auth, user => {

  if (user) {

    currentUser = user.uid;

    $("loginScreen").style.display = "none";

    updateProfileDisplay();

  } else {

    currentUser = null;

    $("loginScreen").style.display = "block";
  }
});


/* =====================================================
   PROFILE DISPLAY
===================================================== */

function updateProfileDisplay() {

  const name =
    localStorage.getItem("name") || "Chosen Girl";

  const avatar =
    localStorage.getItem("avatar");

  if ($("profileName")) {
    $("profileName").innerText = name;
  }

  if (avatar && $("profilePic")) {
    $("profilePic").src = avatar;
  }
}


/* =====================================================
   NAVIGATION
===================================================== */

window.showSection = function (id) {

  const sections =
    document.querySelectorAll(".section");

  sections.forEach(section => {
    section.style.display = "none";
  });

  const selected =
    $(id);

  if (!selected) {
    console.error("Section not found:", id);
    return;
  }

  selected.style.display = "block";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
};


/* =====================================================
   BIBLE
===================================================== */

async function loadBible() {

  try {

    const response =
      await fetch("bible.json");

    if (!response.ok) {
      throw new Error("Bible file could not be loaded.");
    }

    bibleData =
      await response.json();

    loadBooks();
    verseOfDay();

  } catch (error) {

    console.error("Bible error:", error);

    if ($("verseList")) {
      $("verseList").innerText =
        "The Bible couldn't load. Please make sure bible.json is in the same folder as your website.";
    }
  }
}


function loadBooks() {

  const container =
    $("bookList");

  if (!container) return;

  container.innerHTML = "";

  bibleData.forEach(book => {

    const button =
      document.createElement("button");

    button.innerText =
      book.name;

    button.addEventListener("click", () => {
      loadChapters(book);
    });

    container.appendChild(button);
  });
}


function loadChapters(book) {

  const container =
    $("chapterList");

  if (!container) return;

  container.innerHTML = "";

  book.chapters.forEach((chapter, index) => {

    const button =
      document.createElement("button");

    button.innerText =
      "Chapter " + (index + 1);

    button.addEventListener("click", () => {

      loadVerses(
        book.name,
        index + 1,
        chapter
      );

    });

    container.appendChild(button);
  });
}


function loadVerses(bookName, chapterNumber, chapter) {

  const container =
    $("verseList");

  if (!container) return;

  container.innerHTML = "";

  chapter.forEach((verse, index) => {

    const p =
      document.createElement("p");

    const reference =
      `${bookName} ${chapterNumber}:${index + 1}`;

    p.innerText =
      `${reference} — ${verse}`;

    p.title =
      "Click to save this verse 💖";

    p.addEventListener("click", () => {

      p.style.background =
        "var(--rose-light)";

      saveVerse(
        `${reference} — ${verse}`
      );

    });

    container.appendChild(p);
  });
}


/* =====================================================
   SEARCH BIBLE
===================================================== */

window.searchBible = function () {

  const input =
    $("searchInput");

  const container =
    $("verseList");

  if (!input || !container) return;

  const term =
    input.value.trim().toLowerCase();

  container.innerHTML = "";

  if (!term) {
    container.innerText =
      "Type something to search the Bible. 📖";
    return;
  }

  let found = 0;

  bibleData.forEach(book => {

    book.chapters.forEach((chapter, chapterIndex) => {

      chapter.forEach((verse, verseIndex) => {

        if (
          verse.toLowerCase().includes(term)
        ) {

          found++;

          const p =
            document.createElement("p");

          p.innerText =
            `${book.name} ${chapterIndex + 1}:${verseIndex + 1} — ${verse}`;

          p.addEventListener("click", () => {
            saveVerse(p.innerText);
            p.style.background =
              "var(--rose-light)";
          });

          container.appendChild(p);
        }
      });
    });
  });

  if (found === 0) {
    container.innerText =
      "No verses found. Try another word. 🌿";
  }
};


/* =====================================================
   VERSE OF THE DAY
===================================================== */

function verseOfDay() {

  if (!bibleData.length) return;

  const book =
    bibleData[
      Math.floor(Math.random() * bibleData.length)
    ];

  const chapter =
    book.chapters[
      Math.floor(
        Math.random() * book.chapters.length
      )
    ];

  const verse =
    chapter[
      Math.floor(Math.random() * chapter.length)
    ];

  if ($("verseOfDay")) {
    $("verseOfDay").innerText =
      "🌿 " + verse;
  }
}


/* =====================================================
   SAVED VERSES
===================================================== */

function saveVerse(verse) {

  const favorites =
    JSON.parse(
      localStorage.getItem("favorites") || "[]"
    );

  if (!favorites.includes(verse)) {

    favorites.push(verse);

    localStorage.setItem(
      "favorites",
      JSON.stringify(favorites)
    );

    loadFavorites();

  } else {

    alert("You've already saved this verse. 🌸");
  }
}


function loadFavorites() {

  const container =
    $("profileFavorites");

  if (!container) return;

  const favorites =
    JSON.parse(
      localStorage.getItem("favorites") || "[]"
    );

  container.innerHTML = "";

  if (!favorites.length) {

    container.innerText =
      "Your saved verses will appear here. 📖";

    return;
  }

  favorites.forEach((verse, index) => {

    const div =
      document.createElement("div");

    const p =
      document.createElement("p");

    p.innerText =
      verse;

    const button =
      document.createElement("button");

    button.innerText =
      "❌ Remove";

    button.addEventListener("click", () => {
      deleteVerse(index);
    });

    div.appendChild(p);
    div.appendChild(button);

    container.appendChild(div);
  });
}


function deleteVerse(index) {

  const favorites =
    JSON.parse(
      localStorage.getItem("favorites") || "[]"
    );

  favorites.splice(index, 1);

  localStorage.setItem(
    "favorites",
    JSON.stringify(favorites)
  );

  loadFavorites();
}


/* =====================================================
   NOTES
===================================================== */

window.saveNotes = function () {

  const note =
    $("notes").value;

  localStorage.setItem(
    "notes",
    note
  );

  loadNotes();

  alert("Notes saved! 🌿");
};


function loadNotes() {

  const note =
    localStorage.getItem("notes") || "";

  if ($("notes")) {
    $("notes").value = note;
  }

  if ($("profileNotes")) {
    $("profileNotes").innerText =
      note || "No notes saved yet.";
  }
}


window.deleteNotes = function () {

  if (
    !confirm("Delete all your notes? 🌸")
  ) {
    return;
  }

  localStorage.removeItem("notes");

  loadNotes();
};


/* =====================================================
   SHARED NOTES
===================================================== */

window.shareNote = async function () {

  if (!currentUser) {
    alert("Please log in first. 💕");
    return;
  }

  const text =
    $("notes").value.trim();

  if (!text) {
    alert("Write something in your notes first! 🌿");
    return;
  }

  try {

    await addDoc(
      collection(db, "sharedNotes"),
      {
        text: text,
        user:
          localStorage.getItem("name") ||
          "Chosen Girl",
        userId: currentUser,
        time: Date.now()
      }
    );

    alert("Your note was shared! 🦋");

  } catch (error) {

    console.error(error);

    alert(
      "Your note couldn't be shared. Check your Firebase setup."
    );
  }
};


/* =====================================================
   JOURNAL
===================================================== */

window.saveJournal = async function () {

  if (!currentUser) {
    alert("Please log in first. 💕");
    return;
  }

  const text =
    $("journalText").value.trim();

  if (!text) {
    alert("Write something in your journal first. 🌸");
    return;
  }

  try {

    await addDoc(
      collection(db, "journal"),
      {
        text: text,
        user:
          localStorage.getItem("name") ||
          "Chosen Girl",
        userId: currentUser,
        time: Date.now()
      }
    );

    $("journalText").value = "";

  } catch (error) {

    console.error(error);

    alert(
      "Journal entry couldn't be saved. Check Firebase."
    );
  }
};


const journalQuery =
  query(
    collection(db, "journal"),
    orderBy("time", "desc")
  );


onSnapshot(
  journalQuery,
  snapshot => {

    const container =
      $("journalEntries");

    if (!container) return;

    container.innerHTML = "";

    snapshot.forEach(docSnap => {

      const data =
        docSnap.data();

      const div =
        document.createElement("div");

      const date =
        new Date(data.time)
          .toLocaleString();

      div.innerText =
        `${data.user} • ${date}\n\n${data.text}`;

      container.appendChild(div);
    });

  },
  error => {
    console.error(
      "Journal listener error:",
      error
    );
  }
);


/* =====================================================
   MUSIC
===================================================== */

window.addMusic = function () {

  const input =
    $("musicLink");

  const container =
    $("musicList");

  const link =
    input.value.trim();

  if (!link) {
    alert("Paste a YouTube link first. 🎧");
    return;
  }

  let videoId = null;

  try {

    const url =
      new URL(link);

    if (
      url.hostname.includes("youtube.com")
    ) {

      videoId =
        url.searchParams.get("v");

    } else if (
      url.hostname.includes("youtu.be")
    ) {

      videoId =
        url.pathname.substring(1);

    }

  } catch {

    alert("That doesn't look like a valid YouTube link.");
    return;
  }

  if (!videoId) {

    alert(
      "I couldn't find the YouTube video in that link."
    );

    return;
  }

  const iframe =
    document.createElement("iframe");

  iframe.src =
    `https://www.youtube.com/embed/${videoId}`;

  iframe.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";

  iframe.allowFullscreen =
    true;

  container.appendChild(iframe);

  input.value = "";
};


/* =====================================================
   DISCUSSION
===================================================== */

window.postDiscussion = async function () {

  if (!currentUser) {
    alert("Please log in first. 💕");
    return;
  }

  const text =
    $("discussionInput").value.trim();

  if (!text) return;

  try {

    await addDoc(
      collection(db, "discussion"),
      {
        text: text,
        user:
          localStorage.getItem("name") ||
          "Chosen Girl",
        avatar:
          localStorage.getItem("avatar") || "",
        userId: currentUser,
        likes: 0,
        time: Date.now()
      }
    );

    $("discussionInput").value = "";

  } catch (error) {

    console.error(error);

    alert(
      "Your post couldn't be published. Check Firebase."
    );
  }
};


const discussionQuery =
  query(
    collection(db, "discussion"),
    orderBy("time", "asc")
  );


onSnapshot(
  discussionQuery,
  snapshot => {

    const container =
      $("discussionPosts");

    if (!container) return;

    container.innerHTML = "";

    snapshot.forEach(docSnap => {

      const data =
        docSnap.data();

      const card =
        document.createElement("div");

      const p =
        document.createElement("p");

      p.innerText =
        `${data.user}: ${data.text}`;

      const like =
        document.createElement("button");

      like.innerText =
        `❤️ ${data.likes || 0}`;

      like.addEventListener("click", () => {

        updateDoc(
          doc(
            db,
            "discussion",
            docSnap.id
          ),
          {
            likes: increment(1)
          }
        );
      });


      const edit =
        document.createElement("button");

      edit.innerText =
        "✏️ Edit";

      edit.addEventListener(
        "click",
        async () => {

          if (
            data.userId !== currentUser
          ) {
            alert(
              "You can only edit your own posts."
            );
            return;
          }

          const edited =
            prompt(
              "Edit your post:",
              data.text
            );

          if (
            edited === null ||
            !edited.trim()
          ) {
            return;
          }

          await updateDoc(
            doc(
              db,
              "discussion",
              docSnap.id
            ),
            {
              text: edited.trim()
            }
          );
        }
      );


      const remove =
        document.createElement("button");

      remove.innerText =
        "🗑️ Delete";

      remove.addEventListener(
        "click",
        async () => {

          if (
            data.userId !== currentUser
          ) {
            alert(
              "You can only delete your own posts."
            );
            return;
          }

          if (
            !confirm(
              "Delete this post?"
            )
          ) {
            return;
          }

          await deleteDoc(
            doc(
              db,
              "discussion",
              docSnap.id
            )
          );
        }
      );


      card.appendChild(p);
      card.appendChild(like);

      if (
        data.userId === currentUser
      ) {
        card.appendChild(edit);
        card.appendChild(remove);
      }

      container.appendChild(card);
    });

  },
  error => {
    console.error(
      "Discussion listener error:",
      error
    );
  }
);


/* =====================================================
   SHARED NOTES FEED
===================================================== */

const sharedNotesQuery =
  query(
    collection(db, "sharedNotes"),
    orderBy("time", "desc")
  );


onSnapshot(
  sharedNotesQuery,
  snapshot => {

    const container =
      $("sharedNotes");

    if (!container) return;

    container.innerHTML = "";

    snapshot.forEach(docSnap => {

      const data =
        docSnap.data();

      const div =
        document.createElement("div");

      div.innerText =
        `${data.user}: ${data.text}`;

      container.appendChild(div);
    });

  },
  error => {
    console.error(
      "Shared notes error:",
      error
    );
  }
);


/* =====================================================
   NOTIFICATIONS
===================================================== */

let notificationCount = 0;
let notificationsLoaded = false;


const notificationQuery =
  query(
    collection(db, "notifications"),
    orderBy("time", "desc")
  );


onSnapshot(
  notificationQuery,
  snapshot => {

    if (!notificationsLoaded) {
      notificationsLoaded = true;
      return;
    }

    notificationCount =
      snapshot.size;

    updateNotificationBell();
  }
);


function updateNotificationBell() {

  const bell =
    $("notifBell");

  if (!bell) return;

  if (notificationCount > 0) {

    bell.innerText =
      `🔔 ${notificationCount}`;

  } else {

    bell.innerText =
      "🔔";
  }
}


window.showNotifications = function () {

  const container =
    $("notifications");

  if (!container) return;

  if (
    container.style.display === "block"
  ) {

    container.style.display =
      "none";

    return;
  }

  container.style.display =
    "block";

  container.innerHTML =
    "<p>Notifications 🌸</p>";

  const q =
    query(
      collection(db, "notifications"),
      orderBy("time", "desc")
    );

  onSnapshot(
    q,
    snapshot => {

      container.innerHTML = "";

      if (snapshot.empty) {

        container.innerHTML =
          "<p>No notifications yet. 🌿</p>";

        return;
      }

      snapshot.forEach(docSnap => {

        const data =
          docSnap.data();

        const p =
          document.createElement("p");

        p.innerText =
          data.text;

        container.appendChild(p);
      });
    }
  );
};


/* =====================================================
   STREAK
===================================================== */

function updateStreak() {

  const today =
    new Date().toDateString();

  const lastVisit =
    localStorage.getItem("lastVisit");

  let count =
    parseInt(
      localStorage.getItem("streak") || "0",
      10
    );


  if (lastVisit !== today) {

    count++;

    localStorage.setItem(
      "streak",
      count
    );

    localStorage.setItem(
      "lastVisit",
      today
    );
  }


  const streakElement =
    $("streak");

  if (streakElement) {

    streakElement.innerText =
      `🔥 Streak: ${count}`;
  }
}


/* =====================================================
   DEVOTIONAL
===================================================== */

function loadDevotional() {

  const devos = [
    "You are chosen 💖",
    "God is with you 🌿",
    "Be strong today ✨",
    "You are loved 🌸",
    "Do not fear 🙏"
  ];

  const devotional =
    devos[
      new Date().getDate() %
      devos.length
    ];

  const element =
    $("devotionalCard");

  if (element) {
    element.innerText =
      devotional;
  }
}


/* =====================================================
   THEMES
===================================================== */

window.setTheme = function (theme) {

  const allowedThemes = [
    "pink",
    "dark",
    "sage",
    "ocean",
    "sunset"
  ];

  if (
    !allowedThemes.includes(theme)
  ) {
    theme = "pink";
  }

  localStorage.setItem(
    "theme",
    theme
  );

  applyTheme(theme);
};


function applyTheme(theme) {

  const allowedThemes = [
    "pink",
    "dark",
    "sage",
    "ocean",
    "sunset"
  ];

  if (
    !allowedThemes.includes(theme)
  ) {
    theme = "pink";
  }

  document.body.classList.remove(
    "pink",
    "dark",
    "sage",
    "ocean",
    "sunset"
  );

  document.body.classList.add(
    theme
  );
}


/* =====================================================
   START APP
===================================================== */

function startApp() {

  showSection("home");

  loadNotes();
  loadFavorites();
  updateStreak();
  loadDevotional();
  updateProfileDisplay();

  const savedTheme =
    localStorage.getItem("theme") ||
    "pink";

  applyTheme(savedTheme);

  loadBible();
}


window.addEventListener(
  "DOMContentLoaded",
  startApp
);
