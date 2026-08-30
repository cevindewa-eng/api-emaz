const express = require('express');
const app = express();
app.use(express.json());

let donasiTertunda = {};

const KODE_RAHASIA = "TepiJurang2026";

// Rute penerima webhook dari bagibagi.co
app.post('/webhook-bagibagi', (req, res) => {
    const data = req.body;
    
    // Menangkap data dari bagibagi.co (mencakup berbagai kemungkinan nama field)
    const namaDonatur = data.supporter_name || data.name || data.username || "Anonim"; 
    const nominal = Number(data.amount || data.nominal || data.raw_amount || 0);
    
    console.log("Data masuk dari bagibagi.co:", data);

    if (namaDonatur && nominal > 0) {
        if (!donasiTertunda[namaDonatur]) {
            donasiTertunda[namaDonatur] = 0;
        }
        donasiTertunda[namaDonatur] += nominal;
        console.log(`[+] BERHASIL: ${namaDonatur} mendonasikan Rp${nominal}`);
    }
    
    res.status(200).json({ status: "ok" });
});

// Rute pengecekan dari Roblox
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
    console.log(`Server Jembatan menyala di port ${PORT}`);
});
