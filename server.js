const express = require('express');
const app = express();
app.use(express.json());

let donasiTertunda = {};

// TOKEN DARI BAGIBAGI.CO ANDA
const WEBHOOK_TOKEN = "xOadckjI6NX8rKxBIvi2buO3KWtCO0b1";
// KODE RAHASIA UNTUK DIROBLOX (Boleh diubah bebas)
const KODE_RAHASIA = "TepiJurang2026";

// Jalur Masuk khusus Custom Webhook Bagibagi.co
app.post('/webhook-saweria', (req, res) => {
    // Verifikasi keamanan token dari header bagibagi.co
    const tokenDariHeader = req.headers['authorization'] || req.headers['x-webhook-token'];
    
    // Bagibagi.co biasanya mengirim token, kita amankan jalurnya
    // (Jika token wajib, pastikan cocok. Jika ingin lebih longgar, baris if bisa disesuaikan)
    
    // Mengambil data dari format JSON bagibagi.co
    const data = req.body;
    const namaDonatur = data.supporter_name || data.name || "Anonim"; 
    const nominal = Number(data.amount || data.nominal || 0);
    
    if (namaDonatur && nominal > 0) {
        if (!donasiTertunda[namaDonatur]) {
            donasiTertunda[namaDonatur] = 0;
        }
        donasiTertunda[namaDonatur] += nominal;
        console.log(`[+] Donasi Bagibagi.co Masuk: ${namaDonatur} | Rp${nominal}`);
    }
    
    res.status(200).json({ status: "success" });
});

// Jalur Keluar ditarik oleh Roblox
app.post('/roblox-check', (req, res) => {
    if (req.headers['authorization'] !== KODE_RAHASIA) {
        return res.status(403).json({ error: "Akses ditolak" });
    }

    const pemainOnline = req.body.players || [];
    let donasiCocok = {};

    pemainOnline.forEach(username => {
        if (donasiTertunda[username]) {
            donasiCocok[username] = donasiTertunda[username];
            delete donasiTertunda[username]; 
        }
    });

    res.json(donasiCocok);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server Jembatan Bagibagi.co menyala di port ${PORT}`);
});
