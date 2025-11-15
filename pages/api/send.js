export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method not allowed"
        });
    }

    const { text } = req.body;
    if (!text) {
        return res.status(400).json({
            success: false,
            message: "Missing report text"
        });
    }

    // Ambil API key dari ENV
    const apiKey = process.env.BREVO_API_KEY;

    // Debug log untuk cek isi API key di server
    console.log("[DEBUG] API KEY:", apiKey);

    // Validasi kalau API key tidak ada
    if (!apiKey || apiKey.length < 10) {
        return res.status(500).json({
            success: false,
            message: "API key not found in environment variables!"
        });
    }

    // Gunakan email sender yang sudah diverifikasi di Brevo
    const senderEmail = "yusrifat1234@gmail.com"; // Pastikan email ini sudah aktif dan diverifikasi di Brevo
    const whatsappSupport = "support@support.whatsapp.com";

    try {
        const sendRes = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "content-type": "application/json",
                "api-key": apiKey
            },
            body: JSON.stringify({
                sender: {
                    name: "WhatsApp Auto Report",
                    email: senderEmail
                },
                to: [
                    { email: whatsappSupport }
                ],
                subject: "WhatsApp Automated Report",
                htmlContent: `
                    <div style="font-family: Arial; padding: 10px;">
                        <h3>WhatsApp Report</h3>
                        <p>${text}</p>
                    </div>
                `
            })
        });

        const data = await sendRes.json();

        // Debug log untuk cek response Brevo
        console.log("[DEBUG RESPONSE]", data, "Status:", sendRes.status);

        // Deteksi error spesifik Brevo
        if (sendRes.status === 404) {
            return res.status(404).json({
                success: false,
                message: "Endpoint SMTP Brevo tidak ditemukan. Cek URL dan tipe API key!"
            });
        }
        if (sendRes.status === 401 || data?.code === 'unauthorized') {
            return res.status(401).json({
                success: false,
                message: "API key Salah, tidak valid, atau expired! Pastikan ENV dan key benar."
            });
        }
        if (sendRes.ok) {
            return res.status(200).json({ success: true, data });
        } else {
            return res.status(400).json({
                success: false,
                message: data?.message || "Gagal kirim email",
                details: data
            });
        }
    } catch (err) {
        console.error("[SEND ERROR]", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message
        });
    }
}
