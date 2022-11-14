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
        poem.innerHTML = (`${poemArr[i].body.title}`
            + `<button class=${poemArr[i].myId}>Zmień</button>`
            + `<button class=${poemArr[i].myId}>Usuń</button>`
            + `<input type=number value=${poemArr[i].myId} class=index max=${poemArr.length}>
            <button class=${poemArr[i].myId}><<</button>`
        )
        ol[1].appendChild(poem);
        poem.classList.add('poem');
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
        modify[i][1].onclick = (event) => {
            if (confirm("Czy na pewno chcesz usunąć wiersz?")) {
                fetch('/delete', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        class: event.target.className
                    })
                }).then(() => {
                    event.target.parentElement.remove();
                })
            }
        }
        modify[i][2].onclick = (event) => {
            const index = document.getElementsByClassName('index');
            if (index[Number(event.target.className) - 1].value <= poemArr.length) {
                fetch('/change', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        class: event.target.className,
                        newMyId: index[Number(event.target.className) - 1].value
                    })
                }).then(() => {
                    location.reload();
                })
            } else {
                alert(`Zbyt duże id! Najdalsza pozycja dla wiersza to ${poemArr.length}.`)
            }
        }
        i++;
    }

})

