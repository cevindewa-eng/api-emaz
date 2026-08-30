const express = require('express');
const app = express();
app.use(express.json());

let donasiTertunda = {};

// SILAKAN GANTI PASSWORD INI JIKA MAU
const KODE_RAHASIA = "TepiJurang2026";

app.post('/webhook-saweria', (req, res) => {
    const namaDonatur = req.body.donator_name; 
    const nominal = req.body.amount_raw;
    
    if (namaDonatur && nominal) {
        if (!donasiTertunda[namaDonatur]) {
            donasiTertunda[namaDonatur] = 0;
        }
        donasiTertunda[namaDonatur] += nominal;
        console.log(`[+] Donasi Baru: ${namaDonatur} | Rp${nominal}`);
    }
    res.sendStatus(200);
});

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
    console.log(`Server Jembatan EMAS menyala di port ${PORT}`);
});
