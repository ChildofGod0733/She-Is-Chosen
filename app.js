const bibleAPI = "https://bible-api.com/";

let username = localStorage.getItem("username");

function saveUsername(){

username = document.getElementById("usernameInput").value;

localStorage.setItem("username",username);

alert("Welcome "+username);

}


async function searchBible(){

let ref = document.getElementById("searchInput").value;

let res = await fetch(bibleAPI + ref);

let data = await res.json();

document.getElementById("bibleResult").innerText = data.text;

}


function saveVerse(){

let verse = document.getElementById("dailyVerse").innerText;

let saved = JSON.parse(localStorage.getItem("savedVerses")) || [];

saved.push(verse);

localStorage.setItem("savedVerses",JSON.stringify(saved));

showSaved();

}


function showSaved(){

let saved = JSON.parse(localStorage.getItem("savedVerses")) || [];

let container = document.getElementById("savedVerses");

container.innerHTML="";

saved.forEach(v=>{

let p=document.createElement("p");

p.innerText=v;

container.appendChild(p);

});

}

showSaved();


function postDevotional(){

let text=document.getElementById("devotionalText").value;

let div=document.createElement("p");

div.innerText=username+": "+text;

document.getElementById("devotionalList").appendChild(div);

}


function addMusic(){

let link=document.getElementById("musicLink").value;

let iframe=document.createElement("iframe");

iframe.src=link.replace("watch?v=","embed/");

iframe.width="100%";

iframe.height="200";

document.getElementById("musicList").appendChild(iframe);

}


function postDiscussion(){

let text=document.getElementById("discussionText").value;

let div=document.createElement("p");

div.innerText=username+": "+text;

document.getElementById("discussionList").appendChild(div);

}


function postPrayer(){

let text=document.getElementById("prayerText").value;

let div=document.createElement("p");

div.innerText=username+": "+text;

document.getElementById("prayerList").appendChild(div);

}


function postTip(){

let text=document.getElementById("tipText").value;

let div=document.createElement("p");

div.innerText=username+": "+text;

document.getElementById("tipsList").appendChild(div);

}


/* butterflies */

function butterflies(){

for(let i=0;i<8;i++){

let b=document.createElement("div");

b.className="butterfly";

b.innerText="🦋";

b.style.left=Math.random()*100+"vw";

b.style.animationDuration=8+Math.random()*10+"s";

document.body.appendChild(b);

}

}

butterflies();


/* daily verse */

fetch("https://bible-api.com/proverbs 31:25")

.then(res=>res.json())

.then(data=>{

document.getElementById("dailyVerse").innerText=data.text

})
