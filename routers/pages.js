const express = require('express');
const router = express.Router();
const path = require('path');


router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});


router.get('/index.html', (req, res) => {
    res.redirect('/');
});




router.get('/subeler.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/subeler.html'));
});

router.get('/envanter.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/envanter.html'));
});


router.get('/LokasyonAnalizi.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/LokasyonAnalizi.html'));
});


router.get('/pazarlama.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pazarlama.html'));
});


router.get('/Talep.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/Talep.html'));
});

module.exports = router;