const express = require('express');
const router = express.Router();
const config = require('../config');
const mongo = require('mongodb');
const client = new mongo.MongoClient(config.db, { useNewUrlParser: true });
const db = client.db('poetry');
const main = db.collection('main');
router.get('/', async (req, res, next) => {
    const ip = req.ip;
    await client.connect();
    const mainObjArr = await main.find({ myId: 0 }).toArray();
    if (mainObjArr[0].ips.every((el) => {
        return !(el.ip === ip);
    })) {
        mainObjArr[0].ips.push({
            ip
        });
        const { visitors } = mainObjArr[0];
        await main.updateOne({ myId: 0 }, {
            $set: {
                visitors: visitors + 1,
                ips: mainObjArr[0].ips
            }
        })
    }
    client.close();
    next();
})
router.get('/admin.html', (req, res, next) => {
    if (!req.session.poetry) {
        res.redirect('/error.html');
        return;
    }
    next();
})
router.post('/log.html', (req, res) => {
    if (req.body.login === config.login && req.body.password === config.password) {
        req.session.poetry = 1;
        res.redirect('/admin.html');
        return;
    }
    res.redirect('/error.html');
})
router.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/');
})
router.post('/admin.html', async (req, res) => {
    await client.connect();
    const poemArr = await main.find({ type: 'poem' }).toArray();
    const poemArr2 = [...poemArr];
    poemArr2.sort((param1, param2) => {
        return param1.myId - param2.myId;
    })
    let maxId;
    if (poemArr2.length) {
        maxId = poemArr2[poemArr2.length - 1].myId;
    } else {
        maxId = 0;
    }
    await main.insertOne({
        myId: maxId + 1,
        type: 'poem',
        body: {
            title: req.body.title,
            header: req.body.header,
            text: req.body.poem
        },
        likes: 0,
        commentNumber: 0,
        comments: []
    })
    if (req.body.delete) {
        const hidden = Number(req.body.hidden);
        await main.deleteOne({
            type: 'poem',
            myId: hidden
        })
        if (hidden) {
            await main.updateMany({ myId: { $gt: hidden } }, {
                $inc: {
                    myId: -1
                }
            })
            const mainObjArr = await main.find({ myId: 0 }).toArray();
            const newIpsArr = mainObjArr[0].ips.map((el) => {
                if (el.hasOwnProperty(`likeButton${hidden}`)) {
                    delete el[`likeButton${hidden}`];
                }
                let i = 1;
                while (i < 14) {
                    if (el.hasOwnProperty(`likeButton${hidden + i}`)) {
                        delete el[`likeButton${hidden + i}`];
                        el[`likeButton${hidden - 1 + i}`] = true;
                    }
                    i++;
                }
                return el;
            })
            await main.updateOne({ myId: 0 }, {
                $set: {
                    ips: newIpsArr
                }
            })
        }
    }
    res.redirect('back');
    client.close();
})
router.get('/poems', async (req, res) => {
    await client.connect();
    const poemArr = await main.find({ type: 'poem' }).toArray();
    poemArr.sort((param1, param2) => {
        return param1.myId - param2.myId;
    })
    res.json(poemArr);
    client.close();
})
router.get('/poem/:id', async (req, res) => {
    await client.connect();
    const id = Number(req.params.id);
    const poem = await main.find({ myId: id }).toArray();
    res.json(poem[0]);
    client.close();
})
router.get('/poem.html/:id?', (req, res) => {
    res.sendFile('poem.html', {
        root: './public'
    })
})
router.post('/comment/:id', async (req, res) => {
    await client.connect();
    const id = parseInt(req.params.id);
    const poemArr = await main.find({ myId: id }).toArray();
    const { nick, comment } = req.body;
    poemArr[0].comments.push({
        nick,
        comment,
        display: 3,
        date: new Date().toLocaleDateString('pl-PL', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    })
    const { comments } = poemArr[0];
    await main.updateOne({ myId: id }, {
        $set: {
            comments,
            commentNumber: comments.length
        }
    });
    res.redirect('back');
    client.close();
})
router.get('/likes/:id', async (req, res) => {
    await client.connect();
    const id = parseInt(req.params.id);
    const poemArr = await main.find({ myId: id }).toArray();
    const { likes } = poemArr[0];
    await main.updateOne({ myId: id }, {
        $set: {
            likes: likes + 1
        }
    })
    const mainObjArr = await main.find({ myId: 0 }).toArray();
    const userArr = mainObjArr[0].ips.map((el) => {
        if (el.ip === req.ip) {
            const likeButton = `likeButton${id}`
            el[likeButton] = true;
        }
        return el;
    })
    await main.updateOne({ myId: 0 }, {
        $set: {
            ips: userArr
        }
    })
    res.json(poemArr[0]);
    client.close();
})
router.delete('/comment', async (req, res) => {
    await client.connect();
    const body = req.body;
    const poem = await main.find({ myId: body.id }).toArray();
    const newArr = poem[0].comments.filter((el) => {
        return el.comment !== body.comment;
    })
    await main.updateOne({ myId: body.id }, {
        $set: {
            comments: newArr,
            commentNumber: newArr.length
        }
    })
    res.json(poem[0]);
    client.close();
})
router.post('/commentDisplay', async (req, res) => {
    await client.connect();
    const body = req.body;
    const poem = await main.find({ myId: body.id }).toArray();
    const newArr = poem[0].comments.filter((el) => {
        if (el.comment === body.comment) {
            el.display--;
        }
        return true;
    })
    await main.updateOne({ myId: body.id }, {
        $set: {
            comments: newArr
        }
    })
    res.json(poem[0]);
    client.close();
})
router.get('/buttonDisplay/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    await client.connect();
    const mainObjArr = await main.find({ myId: 0 }).toArray();
    const userArr = mainObjArr[0].ips.filter((el) => {
        return el.ip === req.ip;
    })
    const likeButton = userArr[0].hasOwnProperty(`likeButton${id}`);
    res.json({ likeButton });
    client.close();
})
router.get('/visits', async (req, res) => {
    await client.connect();
    const mainObjArr = await main.find({ myId: 0 }).toArray();
    const { visitors } = mainObjArr[0];
    res.json({ visitors });
    client.close();
})
router.post('/remake', async (req, res) => {
    await client.connect();
    const poemArr = await main.find({ myId: Number(req.body.class) }).toArray();
    const poem = poemArr[0];
    res.json(poem);
    client.close();
})
router.delete('/delete', async (req, res) => {
    const id = Number(req.body.class);
    await client.connect();
    await main.deleteOne({ myId: id });
    await main.updateMany({ myId: { $gt: id } }, {
        $inc: {
            myId: -1
        }
    })
    const mainObjArr = await main.find({ myId: 0 }).toArray();
    const newIpsArr = mainObjArr[0].ips.map((el) => {
        if (el.hasOwnProperty(`likeButton${id}`)) {
            delete el[`likeButton${id}`];
        }
        let i = 1;
        while (i < 14) {
            if (el.hasOwnProperty(`likeButton${id + i}`)) {
                delete el[`likeButton${id + i}`];
                el[`likeButton${id - 1 + i}`] = true;
            }
            i++;
        }
        return el;
    })
    await main.updateOne({ myId: 0 }, {
        $set: {
            ips: newIpsArr
        }
    })
    res.json();
    client.close();
})
router.post('/change', async (req, res) => {
    const id = Number(req.body.class);
    const newId = Number(req.body.newMyId);
    await client.connect();
    const obj = await main.findOne({ myId: id })
    if (id > newId) {
        await main.updateMany({
            myId: { $gte: newId, $lt: id },
            type: 'poem'
        }, {
            $inc: {
                myId: 1
            }
        })
        const mainObjArr = await main.find({ myId: 0 }).toArray();
        const newIpsArr = mainObjArr[0].ips.map((el) => {
            if (el.hasOwnProperty(`likeButton${id}`)) {
                delete el[`likeButton${id}`];
                el[`likeButton2${newId}`] = true;
            }
            let i = newId;
            while (i < id) {
                if (el.hasOwnProperty(`likeButton${i}`)) {
                    delete el[`likeButton${i}`];
                    el[`likeButton2${i + 1}`] = true;
                }
                i++;
            }
            for (i = 1; i < 15; i++) {
                if (el.hasOwnProperty(`likeButton2${i}`)) {
                    delete el[`likeButton2${i}`];
                    el[`likeButton${i}`] = true;
                }
            }
            return el;
        })
        await main.updateOne({ myId: 0 }, {
            $set: {
                ips: newIpsArr
            }
        })
    } else if (id < newId) {
        await main.updateMany({
            myId: { $gt: id, $lte: newId },
            type: 'poem'
        }, {
            $inc: {
                myId: -1
            }
        })
        const mainObjArr = await main.find({ myId: 0 }).toArray();
        const newIpsArr = mainObjArr[0].ips.map((el) => {
            if (el.hasOwnProperty(`likeButton${id}`)) {
                delete el[`likeButton${id}`];
                el[`likeButton2${newId}`] = true;
            }
            let i = newId;
            while (i > id) {
                if (el.hasOwnProperty(`likeButton${i}`)) {
                    delete el[`likeButton${i}`];
                    el[`likeButton2${i - 1}`] = true;
                }
                i--;
            }
            for (i = 1; i < 15; i++) {
                if (el.hasOwnProperty(`likeButton2${i}`)) {
                    delete el[`likeButton2${i}`];
                    el[`likeButton${i}`] = true;
                }
            }
            return el;
        })
        await main.updateOne({ myId: 0 }, {
            $set: {
                ips: newIpsArr
            }
        })
    }
    await main.updateOne(obj, {
        $set: {
            myId: newId
        }
    })
    res.json();
    client.close();
})
module.exports = router;