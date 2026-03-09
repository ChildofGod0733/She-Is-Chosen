function showTab(id){

document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"))
document.getElementById(id).classList.add("active")

}

function login(){

let name=document.getElementById("firstName").value
let user=document.getElementById("username").value
let pass=document.getElementById("password").value

if(pass.length<4){

document.getElementById("loginMsg").innerText="Password must be name + 3 numbers"
return

}

localStorage.setItem("user",user)
localStorage.setItem("name",name)

document.getElementById("loginMsg").innerText="Logged in!"

}

async function loadChapter(){

let book=document.getElementById("book").value
let chapter=document.getElementById("chapter").value

let res=await fetch(`https://bible-api.com/${book}%20${chapter}`)
let data=await res.json()

let html=""

data.verses.forEach(v=>{

html+=`<p onclick="highlight(this)">${v.verse}. ${v.text}</p>`

})

document.getElementById("bibleText").innerHTML=html

}

function highlight(el){

el.classList.toggle("highlight")

let saved=JSON.parse(localStorage.getItem("savedVerses"))||[]

saved.push(el.innerText)

localStorage.setItem("savedVerses",JSON.stringify(saved))

showSaved()

}

function showSaved(){

let saved=JSON.parse(localStorage.getItem("savedVerses"))||[]

let html=""

saved.forEach(v=>{

html+=`<p>${v}</p>`

})

document.getElementById("savedVerses").innerHTML=html

}

showSaved()

function saveNotes(){

if(!localStorage.getItem("user")){

alert("Login first to save notes")
return

}

localStorage.setItem("notes",document.getElementById("notes").value)

alert("Notes saved")

}

function postDev(){

let text=document.getElementById("devText").value

let p=document.createElement("p")
p.innerText=text

document.getElementById("devList").appendChild(p)

}

function postDiscussion(){

let text=document.getElementById("discText").value

let p=document.createElement("p")
p.innerText=text

document.getElementById("discList").appendChild(p)

}

function addSong(){

let link=document.getElementById("songLink").value

let iframe=document.createElement("iframe")

iframe.src=link.replace("watch?v=","embed/")
iframe.width="100%"
iframe.height="200"

document.getElementById("musicList").appendChild(iframe)

}

function postTip(){

let text=document.getElementById("tipText").value

let p=document.createElement("p")
p.innerText=text

document.getElementById("tipList").appendChild(p)

}

function postPrayer(){

let text=document.getElementById("prayText").value

let p=document.createElement("p")
p.innerText=text

document.getElementById("prayList").appendChild(p)

}

for(let i=0;i<8;i++){

let b=document.createElement("div")

b.className="butterfly"
b.innerText="🦋"

b.style.left=Math.random()*100+"vw"

b.style.animationDuration=6+Math.random()*8+"s"

document.body.appendChild(b)

}
