const body = document.querySelector("body");
let i = 0;
fetch('/poems').then((res) => {
    return res.json();
}).then((poemArr) => {
    while (i < poemArr.length) {
        const h1 = document.createElement("h1");
        const p = document.createElement("P");
        const title = document.createTextNode(poemArr[i].body.title);
        const text = document.createTextNode(poemArr[i].body.text);
        h1.appendChild(title);
        p.appendChild(text);
        body.appendChild(h1);
        body.appendChild(p);
        i++;
    }
})