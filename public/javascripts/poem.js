const header = document.getElementsByTagName("header");
const article = document.getElementsByTagName("article");
const span = document.getElementsByTagName("span");
const form = document.getElementsByTagName("form");
const comments = document.getElementsByClassName("comments");
const path = location.pathname;
const param = path.split('/')[2];
const button = document.getElementsByTagName('button');
const adv = document.querySelector('.advertisement');
const off = document.querySelector('.off');
const a = document.querySelector('.advertisement>a');
button[0].onclick = function () {
    fetch(`/likes/${param}`)
    this.remove();
}
off.onclick = () => {
    adv.remove();
}
const links = ["https://tmlead.pl/redirect/190176_2282", "https://tmlead.pl/redirect/190176_2289", "https://tmlead.pl/redirect/190176_2265", "https://tmlead.pl/redirect/190176_2262"];
const desc = ["TaniaKsiążka.pl - księgarnia online", "Deichmann.com - sklep z butami online", "Lidl Polska – Bezpieczne zakupy w lidlowych cenach", "Renee.pl - Sklep z Modą"];
const param2 = Math.floor(Math.random() * 4);
const href = links[param2];
a.setAttribute('href', href);
a.innerText = desc[param2];
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
        fetch(`/buttonDisplay/${param}`).then((res) => {
            return res.json();
        }).then((likeButton) => {
            const like = likeButton.likeButton;
            if (like) {
                button[0].remove();
            }
        })
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