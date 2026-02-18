const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// VERİTABANI BAĞLANTISI VE TABLO OLUŞTURMA
const db = new sqlite3.Database('./ziyaretci.db');

// Tabloyu güncelledik: 'tarih' sütununu ekledik
db.run(`CREATE TABLE IF NOT EXISTS ziyaretciler (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    isim TEXT, 
    tarih TEXT
)`);

// ANA SAYFA
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// LİSTELEME
app.get('/api/ziyaretciler', (req, res) => {
    db.all("SELECT * FROM ziyaretciler", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// KAYDETME
app.get('/api/kaydet', (req, res) => {
    const isim = req.query.isim;
    const tarih = new Date().toLocaleString('tr-TR'); // Türkiye saatiyle tarih
    if (isim) {
        db.run("INSERT INTO ziyaretciler (isim, tarih) VALUES (?, ?)", [isim, tarih], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ status: "ok" });
        });
    } else {
        res.status(400).json({ error: "İsim boş olamaz" });
    }
});

// SİLME (Yeni eklediğimiz kısım burası)
app.get('/api/sil', (req, res) => {
    const id = req.query.id;
    db.run("DELETE FROM ziyaretciler WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ status: "silindi" });
    });
});

app.listen(port, () => {
    console.log(`Sunucu ${port} portunda çalışıyor`);
});