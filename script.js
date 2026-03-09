```javascript
let loggedIn=false
let highlightColor="yellow"

function openTab(name){

let tabs=document.getElementsByClassName("tab")

for(let i=0;i<tabs.length;i++){

 tabs[i].style.display="none"

}

document.getElementById(name).style.display="block"

}

openTab("bible")

function login(){

let name=document.getElementById("firstName").value
let user=document.getElementById("username").value
let pass=document.getElementById("password").value

if(name && user && pass){

loggedIn=true

document.getElementById("loginStatus").innerText="Logged in!"

}

}

function setColor(color){
highlightColor=color
}

const bibleText=`
Genesis 1:1 In the beginning God created the heavens and the earth.

Psalm 23:1 The Lord is my shepherd; I shall not want.

Proverbs 17:17 A friend loves at all times.

Proverbs 18:24 A friend sticks closer than a brother.

John 3:16 For God so loved the world that he gave his only Son.

Romans 8:28 God works all things for the good of those who love Him.
`

document.getElementById("bibleText").innerText=bibleText

let selected=""

document.getElementById("bibleText").addEventListener("mouseup",function(){
selected=window.getSelection().toString()
})

function bookmarkVerse(){

if(selected=="")return

let saved=localStorage.getItem("bookmarks")||""

saved+=selected+"<br><br>"

localStorage.setItem("bookmarks",saved)

showBookmarks()

}

function showBookmarks(){

let saved=localStorage.getItem("bookmarks")

if(saved)

 document.getElementById("savedBookmarks").innerHTML=saved

}

showBookmarks()

function saveNote(){

if(!loggedIn){

alert("Login to save notes")

return

}

let note=document.getElementById("noteText").value

let saved=localStorage.getItem("notes")||""

saved+=note+"<br><br>"

localStorage.setItem("notes",saved)

showNotes()

}

function showNotes(){

let saved=localStorage.getItem("notes")

if(saved)

 document.getElementById("savedNotes").innerHTML=saved

}

showNotes()

function searchBible(){

let q=document.getElementById("searchBox").value.toLowerCase()

let verses=bibleText.split("\n")

let results=""

for(let v of verses){

 if(v.toLowerCase().includes(q)){

  results+=v+"<br><br>"

 }

}

document.getElementById("searchResults").innerHTML=results

}

const daily=[
"Psalm 46:1 God is our refuge and strength.",
"Proverbs 3:5 Trust in the Lord with all your heart.",
"Joshua 1:9 Be strong and courageous.",
"Romans 8:28 God works all things for good."
]

let verse=daily[Math.floor(Math.random()*daily.length)]

document.getElementById("dailyVerse").innerText="Verse of the Day: "+verse
```

