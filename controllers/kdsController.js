
const db = require('../db/mysql_connect');

// 1. Tüm İlleri Getiren Fonksiyon
exports.getIller = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM iller');
        res.json(rows); // Veriyi JSON olarak döndür
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Veritabanı hatası' });
    }
};

// 2. En Karlı İlleri Getiren Fonksiyon
exports.getTopIller = async (req, res) => {
    try {
        const query = `
            SELECT I.il_adi, K.potansiyel_skor 
            FROM il_karlilik_skorlari K
            JOIN iller I ON K.il_id = I.il_id
            ORDER BY K.potansiyel_skor DESC
            LIMIT 10
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Veritabanı hatası' });
    }
};

// 3. Dropdown için Tüm Şubeleri Getir
exports.getSubeler = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT sube_id, sube_adi FROM sube_lokasyonlari');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'DB Hatası' });
    }
};


exports.getSubeAnaliz = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM sube_karnesi WHERE sube_id = ?', [id]);
        
        const [trendSonuc] = await db.query(`
            SELECT KT.tur_adi FROM talep_tahmin_verisi TTV
            JOIN kitap_turleri KT ON TTV.tur_id = KT.tur_id
            WHERE TTV.sube_id = ?
            ORDER BY TTV.satilan_adet DESC LIMIT 1
        `, [id]);

        if (!rows[0]) {
            return res.json({ mesaj: "Veri bulunamadı" });
        }

        const veri = rows[0];
        const trendAdi = trendSonuc[0] ? trendSonuc[0].tur_adi : "-";

        let hesaplananPuan = Math.round((veri.performans_skoru || 0) * 10);
        
        let durumMetni = "";
        let renkSinifi = "";
        let aksiyonOnerisi = "";

        if (hesaplananPuan >= 85) {
            durumMetni = "MÜKEMMEL";
            renkSinifi = "text-emerald-500"; 
            aksiyonOnerisi = "🚀 Tavsiye: Başarılı personeli ödüllendir ve stok seviyelerini %15 artır.";
        } else if (hesaplananPuan >= 70) {
            durumMetni = "İYİ";
            renkSinifi = "text-blue-500";
            aksiyonOnerisi = "📈 Tavsiye: Hafta sonuna özel kampanya planlayarak ciroyu yükselt.";
        } else {
            durumMetni = "RİSKLİ";
            renkSinifi = "text-red-500";
            aksiyonOnerisi = "⚠️ Tavsiye: Şube müdürü ile görüş ve yerel reklam bütçesini artır.";
        }

        res.json({
            ciro: "₺" + (veri.tahmini_ciro || "0"),
            kar_marji: "₺" + (veri.net_kar || "0"),
            trend: trendAdi,
            skor: (veri.performans_skoru || "0") + "/10",
            saglik_puan: hesaplananPuan,
            saglik_durum: durumMetni,
            renk_kodu: renkSinifi,
            tavsiye: aksiyonOnerisi
        });

    } catch (error) {
        console.error("KRİTİK HATA:", error);
        res.status(500).json({ error: 'Sunucu hatası oluştu' });
    }
};

exports.getSatisGrafigi = async (req, res) => {
    const { id } = req.params;
    try {
        const [sonuc] = await db.query('CALL sp_satis_grafigi(?)', [id]);
        const hamVeri = sonuc[0];

        res.json({
            labels: hamVeri.map(v => v.ay),
            gecmis: hamVeri.map(v => v.gecmis),
            gelecek: hamVeri.map(v => v.gelecek)
        });
    } catch (error) {
        console.error("Grafik Hatası:", error);
        res.status(500).json({ error: 'DB Hatası' });
    }
};

exports.getKarsilastirma = async (req, res) => {
    const { id1, id2 } = req.params;
    try {
        const [sube1] = await db.query('CALL sp_satis_grafigi(?)', [id1]);
        const [sube2] = await db.query('CALL sp_satis_grafigi(?)', [id2]);

        res.json({
            labels: sube1[0].map(item => item.ay),
            data1: sube1[0].map(item => item.gecmis || item.gelecek),
            data2: sube2[0].map(item => item.gecmis || item.gelecek)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getHaritaSubeler = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT sube_adi FROM sube_lokasyonlari');
        res.json(rows);
    } catch (error) {
        console.error("Veritabanı Hatası:", error);
        res.status(500).json({ error: "Tablo veya sütun bulunamadı" });
    }
};

exports.getKategoriler = async (req, res) => {
    try {
        const sql = "SELECT * FROM kitap_turleri";
        const [results] = await db.query(sql); 
        res.json(results);
    } catch (err) {
        console.error("Veritabanı Hatası:", err);
        res.status(500).send(err);
    }
};


exports.getPazarlamaAnaliz = async (req, res) => {
    const { id } = req.params; 

    try {
        const sqlSegment = `
            SELECT mt.tip_adi, smd.yogunluk_yuzdesi 
            FROM sube_lokasyonlari sl
            JOIN sube_musteri_dagilimi smd ON sl.sube_id = smd.sube_id
            JOIN musteri_tipleri mt ON smd.tip_id = mt.tip_id
            WHERE sl.sube_id = ?
            ORDER BY smd.yogunluk_yuzdesi DESC`;
        
        
        const sqlSeason = `
            SELECT MONTH(satis_tarihi) as ay, SUM(satilan_adet) as toplam_satis
            FROM talep_tahmin_verisi
            WHERE sube_id = ?
            GROUP BY ay
            ORDER BY ay ASC`;

        
        const sqlFinans = `SELECT toplam_satis_adedi FROM sube_karnesi WHERE sube_id = ?`;

        const [segmentRows] = await db.query(sqlSegment, [id]);
        const [seasonRows] = await db.query(sqlSeason, [id]);
        const [finansRows] = await db.query(sqlFinans, [id]);

       
        const segments = (segmentRows || []).map(row => {
            let color = "#94a3b8"; let basket = 100; let cost = 1.0;
            let isim = row.tip_adi.toLowerCase();
            let segId = "general";
            
            
            if (isim.includes('öğrenci') || isim.includes('z kuşağı')) { segId = 'student'; color = '#be123c'; basket = 150; cost=0.5; }
            else if (isim.includes('beyaz yaka')) { segId = 'whitecollar'; color = '#3b82f6'; basket = 350; cost=1.5; }
            else if (isim.includes('emekli')) { segId = 'elderly'; color = '#10b981'; basket = 200; cost=2.5; }
            else if (isim.includes('turist')) { segId = 'tourist'; color = '#f59e0b'; basket = 500; cost=3.0; }
            else if (isim.includes('aile')) { segId = 'family'; color = '#8b5cf6'; basket = 400; cost=1.8; }

            return { id: segId, name: row.tip_adi, share: row.yogunluk_yuzdesi, basket: basket, costFactor: cost, color: color };
        });

        // B. Mevsimsellik (Isı Haritası) Normalizasyonu
        let heatmap = new Array(12).fill(0.1); 
        let maxSatis = 0;
        
        if(seasonRows && seasonRows.length > 0) {
            seasonRows.forEach(r => { if(r.toplam_satis > maxSatis) maxSatis = r.toplam_satis; });
            seasonRows.forEach(r => {
                if (r.ay >= 1 && r.ay <= 12) {
                    heatmap[r.ay - 1] = maxSatis > 0 ? parseFloat((r.toplam_satis / maxSatis).toFixed(2)) : 0.1;
                }
            });
        }

        // C. Dinamik Trafik
        let trafficVal = 10000; 
        if (finansRows && finansRows.length > 0) {
            trafficVal = finansRows[0].toplam_satis_adedi || 10000;
        }
        
        console.log(`DEBUG -> Şube ID: ${id} verisi çekildi.`);
        
        res.json({
            name: "Seçilen Şube",
            traffic: trafficVal,
            segments: segments,
            seasonality: heatmap 
        });

    } catch (error) {
        console.error("Pazarlama Analiz Hatası:", error);
        res.status(500).json({ error: "Veritabanı hatası" });
    }
};

// şubeler özet

exports.tumSubelerOzetGetir = async (req, res) => {
    try {

        
        const sql = `
            SELECT 
                sube_id, 
                sube_adi, 
                tahmini_ciro, 
                net_kar, 
                performans_skoru 
            FROM sube_karnesi
        `;

        const [results] = await db.query(sql);
        res.json(results);

    } catch (err) {
        console.error("Özet Veri SQL Hatası:", err);
        res.status(500).json({ error: "Veritabanı hatası", detay: err.message });
    }
};



// 10. Envanter Listesini Getiren Fonksiyon
exports.getEnvanter = async (req, res) => {
    try {
        const sql = `
            SELECT e.id, e.ad, k.tur_adi AS kategori, e.stok, e.maliyet, e.giris_tarihi, e.satis_hizi 
            FROM envanter e
            LEFT JOIN kitap_turleri k ON e.tur_id = k.tur_id
        `;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (err) {
        console.error("Envanter Hatası:", err);
        res.status(500).json({ error: "Veritabanı hatası" });
    }
};

exports.urunEkle = async (req, res) => {
    // sube_stoklari tablosuna uygun sütunlar
    const { sube_id, tur_id, mevcut_stok, kritik_esik } = req.body;
    try {
        const query = `
            INSERT INTO sube_stoklari (sube_id, tur_id, mevcut_stok, kritik_esik) 
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [sube_id, tur_id, mevcut_stok, kritik_esik]);
        res.json({ message: "Stok başarıyla eklendi", id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ekleme hatası" });
    }
};


exports.urunSil = async (req, res) => {
    const { id } = req.params; // stok_id üzerinden siler
    try {
        await db.query('DELETE FROM sube_stoklari WHERE stok_id = ?', [id]);
        res.json({ message: "Stok kaydı silindi" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Silme hatası" });
    }
};