const header = document.getElementsByName("header");
const article = document.getElementsByTagName("article");
const span = document.getElementsByTagName("span");
const form = document.getElementsByTagName("form");
const comments = document.getElementsByClassName("comments");
const path = location.pathname;
const param = location.param;
const commentDisplay = (param1, param2, param3) => {
    const [param1] = document.createElement("p");
    const [param2] = document.createTextNode(poem.comments[i][param3]);
    param1.appendChild(param2);
    comments[0].appendChild(param1);
}
form.setAttribute("action", `/comment/:${param}`)
fetch(`${path}`).then((res) => {
    return res.json;
}).then((poem) => {
    header[0].innerText = poem.body.title;
    article[0].innerText = poem.body.text;
    span[0].innerText = poem.commentNumber;
    let i = 0;
    while (i < poem.comments.length) {
        commentDisplay("p1", "text1", "nick");
        commentDisplay("p2", "text2", "comment");
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