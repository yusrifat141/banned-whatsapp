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

    const apiKey = "xsmtpsib-94185f5b595783b5ade8c49cd0a85d7b19a4add080d46598adf7f04192dce1fb-zZmtqZFZrcACrARp";

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
                    email: "no-reply@domain.com"
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

        if (sendRes.ok) {
            return res.status(200).json({ success: true });
        } else {
            return res.status(400).json({
                success: false,
                message: data?.message || "Failed to send email"
            });
        }

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}
