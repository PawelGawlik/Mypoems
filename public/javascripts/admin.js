const ol = document.getElementsByTagName('ol');
const input = document.getElementsByTagName('input');
const textarea = document.getElementsByTagName('textarea');
fetch('/poems').then((res) => {
    return res.json();
}).then((poemArr) => {
    let i = 0;
    while (i < poemArr.length) {
        for (let j = 0; j < poemArr[i].comments.length; j++) {
            let { display } = poemArr[i].comments[j];
            if (display) {
                const li = document.createElement('li');
                const { comment } = poemArr[i].comments[j];
                const id = poemArr[i].myId;
                fetch('/commentDisplay', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        comment,
                        id
                    })
                })
                li.innerText = comment;
                const button = document.createElement('button');
                button.innerText = 'Usuń';
                li.appendChild(button);
                ol[0].appendChild(li);
                button.onclick = () => {
                    li.remove();
                    fetch('/comment', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            comment,
                            id
                        })
                    })
                }
            }
        }
        const poem = document.createElement('li');
        poem.innerHTML = `${poemArr[i].body.title}` + `<button class=${poemArr[i].myId}>Zmień</button>`;
        ol[1].appendChild(poem);
        const modify = [];
        modify[i] = document.getElementsByClassName(`${poemArr[i].myId}`);
        modify[i][0].onclick = (event) => {
            fetch('/remake', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    class: event.target.className
                })
            }).then((res) => {
                return res.json();
            }).then((poem) => {
                input[0].value = poem.body.title;
                textarea[0].innerText = poem.body.header;
                textarea[1].innerText = poem.body.text;
                input[2].value = poem.myId;
            })
        }
        i++;
    }

})

