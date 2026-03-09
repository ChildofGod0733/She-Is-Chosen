let loggedIn = false

// TAB SWITCHING
function openTab(tabName){

let tabs = document.getElementsByClassName("tab")

for(let i=0;i<tabs.length;i++){
tabs[i].style.display="none"
}

document.getElementById(tabName).style.display="block"

}

openTab("bible")

// LOGIN
function login(){

let name=document.getElementById("firstName").value
let user=document.getElementById("username").value
let pass=document.getElementById("password").value

if(name && user && pass){

loggedIn=true
document.getElementById("loginStatus").innerText="Logged in! Notes will save."

}else{

document.getElementById("loginStatus").innerText="Fill all fields."

}

}

// BIBLE TEXT
const bible = `
Genesis 1:1 In the beginning God created the heaven and the earth.

John 3:16 For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.

Psalm 23:1 The Lord is my shepherd; I shall not want.

Proverbs 17:17 A friend loves at all times.

Proverbs 18:24 A friend sticks closer than a brother.

Romans 8:28 And we know that in all things God works for the good of those who love him.
`

document.getElementById("bibleText").innerText=bible

// HIGHLIGHTING
let selectedText=""

document.getElementById("bibleText").addEventListener("mouseup",function(){

selectedText=window.getSelection().toString()

})

// SAVE HIGHLIGHT
function saveHighlight(){

if(selectedText=="") return

let saved=localStorage.getItem("highlights")

if(!saved) saved=""

saved+=selectedText+"<br><br>"

localStorage.setItem("highlights",saved)

displayHighlights()

}

// DISPLAY HIGHLIGHTS
function displayHighlights(){

let saved=localStorage.getItem("highlights")

if(saved){

document.getElementById("savedHighlights").innerHTML=saved

}

}

displayHighlights()

// SAVE NOTES
function saveNote(){

if(!loggedIn){

alert("Login to save notes.")
return

}

let note=document.getElementById("noteText").value

let saved=localStorage.getItem("notes")

if(!saved) saved=""

saved+=note+"<br><br>"

localStorage.setItem("notes",saved)

displayNotes()

}

function displayNotes(){

let saved=localStorage.getItem("notes")

if(saved){

document.getElementById("savedNotes").innerHTML=saved

}

}

displayNotes()
