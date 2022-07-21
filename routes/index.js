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
    const numberOfId = poemArr.length;
    await main.insertOne({
        myId: numberOfId + 1,
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
    res.redirect('back');
    client.close();
})
router.get('/poems', async (req, res) => {
    await client.connect();
    const poemArr = await main.find({ type: 'poem' }).toArray();
    res.json(poemArr);
    client.close();
})
/*router.get('/poem.html/:id?', (req, res) => {
    res.sendFile('poem.html', {
        root: './public'
    })
})*/
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
    //if (!req.cookies[`like${id}`]) {
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
    //res.cookie(`like${id}`, true);
    res.json(poemArr[0]);
    client.close();
    /* } else {
         await client.connect();
         const id = parseInt(req.params.id);
         const poemArr = await main.find({ myId: id }).toArray();
         res.json(poemArr[0]);
         client.close();
     }*/
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
module.exports = router;