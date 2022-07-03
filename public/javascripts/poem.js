const header = document.getElementsByTagName("header");
const article = document.getElementsByTagName("article");
const span = document.getElementsByTagName("span");
const form = document.getElementsByTagName("form");
const comments = document.getElementsByClassName("comments");
const path = location.pathname;
const param = path.split('/')[2];
const button = document.getElementsByTagName('button');
button[0].onclick = function () {
    fetch(`/likes/${param}`)
}
/*const commentDisplay = (param3) => {
    const param1 = document.createElement("p");
    const param2 = document.createTextNode(poem.comments[i][param3]);
    param1.appendChild(param2);
    comments[0].appendChild(param1);
}*/
form[0].setAttribute("action", `/comment/${param}`);
if (path !== '/poem.html') {
    fetch(`/poem/${param}`).then((res) => {
        return res.json();
    }).then((poem) => {
        header[0].innerText = poem.body.title;
        article[0].innerText = poem.body.text;
        span[0].innerText = poem.commentNumber;
        //button[0].setAttribute('disabled', poem.button);
        let i = 0;
        const commentDisplay = (param3) => {
            const param1 = document.createElement("p");
            const param2 = document.createTextNode(poem.comments[i][param3]);
            param1.appendChild(param2);
            comments[0].appendChild(param1);
        }
        while (i < poem.comments.length) {
            commentDisplay("nick");
            commentDisplay("comment");
            const div = document.createElement('div');
            div.innerText = poem.comments[i].date;
            comments[0].appendChild(div)
            /*const p1 = document.createElement("p");
            const text1 = document.createTextNode(poem.comments[i].nick);
            p1.appendChild(text1);
            comments[0].appendChild(p1);
            const p2 = document.createElement("p");
            const text2 = document.createTextNode(poem.comments[i].comment);
            p2.appendChild(text2);
            comments[0].appendChild(p2);*/
            i++;
        }
    })
}