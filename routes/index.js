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
    await main.insertOne({
        type: 'poem',
        body: {
            title: req.body.title,
            header: req.body.header,
            text: req.body.poem
        },
        likes: 0
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
module.exports = router;