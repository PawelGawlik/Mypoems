const h2 = document.querySelectorAll("h2");
const p = document.querySelectorAll("p");
const counter = document.querySelectorAll(".counter");
let i = 0;
let max = 7;
if (location.pathname === "/page2.html") {
    i = 7;
    max = 14;
}
const poems = (par1, poemArr) => {
    h2[par1].innerText = poemArr[par1].body.title;
    p[par1].innerText = poemArr[par1].body.header;
    counter[par1].innerText = poemArr[par1].likes;
}
fetch('/poems').then((res) => {
    return res.json();
}).then((poemArr) => {
    while (i < poemArr.length && i < max) {
        poems(i, poemArr);
        i++;
    }
})