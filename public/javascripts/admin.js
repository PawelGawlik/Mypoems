const ol = document.getElementsByTagName('ol');
fetch('/poems').then((res) => {
    return res.json();
}).then((poemArr) => {
    let i = 0;
    while (i < poemArr.length) {
        for (let j = 0; j < poemArr[i].comments.length; j++) {
            const li = document.createElement('li');
            const { comment } = poemArr[i].comments[j];
            const id = poemArr[i].myId;
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
        i++;
    }
})

