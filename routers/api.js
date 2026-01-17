const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const db = require('../db/mysql_connect');

// Middlewares
const simpleCheck = require('../middlewares/validations/simpleCheck');

// Controllers
const kdsController = require('../controllers/kdsController');

// Apply Validation Middleware
router.use(simpleCheck);

// --- KDS & Analiz Rotaları ---
router.get('/iller', kdsController.getIller);
router.get('/top-iller', kdsController.getTopIller);
router.get('/subeler', kdsController.getSubeler);
router.get('/sube-analiz/:id', kdsController.getSubeAnaliz);
router.get('/satis-grafik/:id', kdsController.getSatisGrafigi);
router.get('/karsilastir/:id1/:id2', kdsController.getKarsilastirma);
router.get('/harita-subeler', kdsController.getHaritaSubeler);
router.get('/kategoriler', kdsController.getKategoriler);
router.get('/pazarlama-analiz/:id', kdsController.getPazarlamaAnaliz);
router.get('/tum-subeler-ozet', kdsController.tumSubelerOzetGetir);
router.post('/envanter-ekle', kdsController.urunEkle);
router.delete('/envanter-sil/:id', kdsController.urunSil);

// YENİ DÜZELTME: Artık SQL burada değil, controller'da!
router.get('/envanter', kdsController.getEnvanter);


// --- Harita Verisi (GeoJSON + DB Merge) ---
// Not: Burası dosya okuma işlemi içerdiği için burada kalabilir,
// ama istenirse bu da controller'a taşınabilir. Şimdilik risk almayalım, kalsın.
router.get('/harita-verisi', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT k.*, s.potansiyel_skor,
            (SELECT COUNT(*) FROM sube_lokasyonlari sl WHERE sl.il_id = k.il_id) as bizim_sube_sayisi
            FROM il_analiz_kriterleri k
            LEFT JOIN il_karlilik_skorlari s ON k.il_id = s.il_id
        `);

        let geojsonPath = path.join(__dirname, '../public/tr-cities.json');
        if (!fs.existsSync(geojsonPath)) {
            geojsonPath = path.join(__dirname, '../public/data/tr-cities.json');
        }

        if (!fs.existsSync(geojsonPath)) {
            return res.status(404).json({ error: "GeoJSON dosyası bulunamadı." });
        }

        let geoData = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));

        geoData.features = geoData.features.map(feature => {
            const geoId = parseInt(feature.properties.number); 
            const dbVerisi = rows.find(r => parseInt(r.il_id) === geoId);
            
            return {
                ...feature,
                properties: {
                    ...feature.properties,
                    ...(dbVerisi || {}), 
                    bizim_sube_sayisi: dbVerisi ? dbVerisi.bizim_sube_sayisi : 0 
                }
            };
        });

        res.json(geoData);

    } catch (err) {
        console.error("Harita verisi hatası:", err);
        res.status(500).json({ error: "Sunucu hatası" });
    }
});

module.exports = router;