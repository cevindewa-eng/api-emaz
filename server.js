const express = require('express');
const app = express();
app.use(express.json());

let donasiTertunda = {}; // Menyimpan data: { username: { amount, message } }

const KODE_RAHASIA = "TepiJurang2026";

// Rute penerima webhook dari bagibagi.co
app.post('/webhook-bagibagi', (req, res) => {
    const data = req.body;
    console.log("Data mentah dari bagibagi.co:", JSON.stringify(data));
    
    const namaDonatur = data.name || data.supporter_name || data.username || "Anonim"; 
    const pesanDonatur = data.message || "Mendukung tanpa pesan";
    
    let rawAmount = data.amount || data.nominal || data.raw_amount || 0;
    if (typeof rawAmount === 'string') {
        rawAmount = Number(rawAmount.replace(/[^0-9]/g, '')) || 0;
    }
    const nominal = Number(rawAmount);

    if (namaDonatur && nominal > 0) {
        if (!donasiTertunda[namaDonatur]) {
            donasiTertunda[namaDonatur] = { amount: 0, message: pesanDonatur };
        }
        donasiTertunda[namaDonatur].amount += nominal;
        donasiTertunda[namaDonatur].message = pesanDonatur; // Simpan pesan terbaru
        
        console.log(`[+] BERHASIL: ${namaDonatur} mendonasikan Rp${nominal} | Pesan: "${pesanDonatur}"`);
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
