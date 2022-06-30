const express = require('express');
const router = express.Router();
const config = require('../config');
const mongo = require('mongodb');
const client = new mongo.MongoClient(config.db, { useNewUrlParser: true });
const db = client.db('poetry');
const main = db.collection('main');
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
    console.log(req.params.id)
    const poemArr = await main.find({ myId: id }).toArray();
    const { nick, comment } = req.body;
    poemArr[0].comments.push({
        nick,
        comment
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
    res.json(poemArr[0]);
    client.close();
})
module.exports = router;