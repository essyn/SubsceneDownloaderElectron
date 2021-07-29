
const { ipcRenderer } = require('electron');
const path = require('path');
let items = document.getElementById("items");
const liste = document.getElementById("status")
const reset=document.getElementById("reset")
reset.addEventListener("click",()=>{
    console.log("f")
    liste.innerHTML="";
    items.value="";
})
document.getElementById("addTask").addEventListener('click', () => {
    liste.innerHTML = ""

    let v = items.value.split(/\s+/g);
    ipcRenderer.send("deneme", { items: v })

});

ipcRenderer.on("complete", (err, data) => {
    let a = document.createElement("li");
    a.textContent = `${data.name} downloaded`
    liste.appendChild(a)
})