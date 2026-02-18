const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Veritabanı bağlantısı
const db = new sqlite3.Database('./ziyaretci.db');

db.run("CREATE TABLE IF NOT EXISTS ziyaretciler (id INTEGER PRIMARY KEY AUTOINCREMENT, isim TEXT)");

// ANA SAYFA
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// KAYDETME
app.get('/api/kaydet', (req, res) => {
    const isim = req.query.isim;
    if (isim) {
        db.run("INSERT INTO ziyaretciler (isim) VALUES (?)", [isim], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ status: "ok" });
        });
    } else {
        res.status(400).json({ error: "İsim boş olamaz" });
    }
});

// LİSTELEME (Hata buradaydı, şimdi düzelttik)
app.get('/api/ziyaretciler', (req, res) => {
    db.all("SELECT isim FROM ziyaretciler", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows); // Sadece listeyi gönderiyoruz
    });
});

app.listen(port, () => {
    console.log(`Sunucu ${port} portunda çalışıyor`);
});

// 1. Kaydetme kısmına tarih ekleyelim (server.js içinde bul ve değiştir)
app.get('/api/kaydet', (req, res) => {
    const isim = req.query.isim;
    const tarih = new Date().toLocaleString('tr-TR'); // Tarih bilgisini oluşturur
    if (isim) {
        db.run("INSERT INTO ziyaretciler (isim, tarih) VALUES (?, ?)", [isim, tarih], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ status: "ok" });
        });
    }
});

// 2. Silme kapısını ekleyelim (server.js'in sonuna, listen'dan önce ekle)
app.get('/api/sil', (req, res) => {
    const id = req.query.id;
    db.run("DELETE FROM ziyaretciler WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ status: "silindi" });
    });
});