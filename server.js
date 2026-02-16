const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();
app.use(express.static(__dirname));
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./ziyaretci.db');

// Tabloyu yeni sütunlarla (tarih ve cikis_saati) kuruyoruz
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS ziyaretciler (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        isim TEXT,
        tarih DATETIME DEFAULT (datetime('now','localtime')),
        cikis_saati DATETIME
    )`);
});

// İSİM KAYDETME VE LİSTELEME
app.get('/api/kaydet', (req, res) => {
    const isim = req.query.isim;
    if (isim) {
        db.run("INSERT INTO ziyaretciler (isim) VALUES (?)", [isim], function(err) {
            db.all("SELECT * FROM ziyaretciler ORDER BY id DESC", [], (err, rows) => {
                res.json({ toplamListe: rows });
            });
        });
    } else {
        db.all("SELECT * FROM ziyaretciler ORDER BY id DESC", [], (err, rows) => {
            res.json({ toplamListe: rows });
        });
    }
});

// ÇIKIŞ YAPMA (GÜNCELLEME)
app.get('/api/cikis-yap', (req, res) => {
    const id = req.query.id;
    db.run("UPDATE ziyaretciler SET cikis_saati = datetime('now','localtime') WHERE id = ?", [id], function(err) {
        db.all("SELECT * FROM ziyaretciler ORDER BY id DESC", [], (err, rows) => {
            res.json({ toplamListe: rows });
        });
    });
});

// İSTATİSTİK
app.get('/api/istatistik', (req, res) => {
    db.get("SELECT COUNT(*) as toplam FROM ziyaretciler", [], (err, row) => {
        res.json({ toplam: row ? row.toplam : 0 });
    });
});

app.listen(3000, '0.0.0.0', () => {
    console.log("SUNUCU 3000 PORTUNDA AKTIF VE HAZIR!");
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});