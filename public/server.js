"use strict";

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ضع رابط Webhook الجديد هنا، دون مشاركته مع أي شخص
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1566983279427453138/HLEoQq-ozB_IHkKw9rknAvD638KRURjza-QTyZ5pfP9oCMCn5nn0llQJos7iPfaVYm8K";

// المنتجات
const PRODUCTS = {
    cocaine: {
        name: "Cocaine",
        price: 600
    },
    meth: {
        name: "Meth",
        price: 600
    }
};

// =====================================
// CORS - السماح للمتجر بالاتصال بالخادم
// =====================================

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

// =====================================
// إعدادات Express
// =====================================

app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));

// الصفحة الرئيسية
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// =====================================
// استقبال الطلبات
// =====================================

app.post("/api/orders", async (req, res) => {
    try {
        const data = req.body || {};

        const gangName = String(data.gangName || "").trim();
        const radioNumber = String(data.radioNumber || "").trim();
        const location = String(data.deliveryLocation || "").trim();
        const products = data.products;

        // التحقق من المعلومات
        if (!gangName || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                success: false,
                message: "يرجى إكمال معلومات الطلب."
            });
        }

        if (
            DISCORD_WEBHOOK_URL === "PUT_YOUR_NEW_WEBHOOK_URL_HERE" ||
            !DISCORD_WEBHOOK_URL.startsWith("https://discord.com/api/webhooks/")
        ) {
            return res.status(500).json({
                success: false,
                message: "رابط Discord غير مضبوط في الخادم."
            });
        }

        if (
            gangName.length > 100 ||
            radioNumber.length > 50 ||
            location.length > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "بعض المعلومات طويلة جدًا."
            });
        }

        let total = 0;
        let productList = "";

        // التحقق من المنتجات والكميات
        for (const item of products) {
            const product = PRODUCTS[item.id];
            const quantity = Number(item.quantity);

            if (
                !product ||
                !Number.isInteger(quantity) ||
                quantity < 1 ||
                quantity > 1000
            ) {
                return res.status(400).json({
                    success: false,
                    message: "المنتج أو الكمية غير صحيحة."
                });
            }

            const subtotal = product.price * quantity;
            total += subtotal;

            productList +=
                `**${product.name}**\n` +
                `الكمية: ${quantity}\n` +
                `المجموع: ${subtotal}$\n\n`;
        }

        // إنشاء رسالة Discord
        const embed = {
            title: "MADRAZO FAMILY | NEW ORDER",
            description:
                productList +
                `**المجموع النهائي: ${total}$**`,
            color: 0xD4AF37,
            fields: [
                {
                    name: "اسم العصابة",
                    value: gangName
                },
                {
                    name: "رقم الراديو",
                    value: radioNumber || "غير محدد"
                },
                {
                    name: "الموقع",
                    value: location || "غير محدد"
                }
            ],
            timestamp: new Date().toISOString()
        };

        // إرسال الطلب إلى Discord
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: "MADRAZO FAMILY",
                embeds: [embed]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();

            console.error("Discord Error:", response.status, errorText);

            return res.status(502).json({
                success: false,
                message: "تعذر إرسال الطلب إلى Discord."
            });
        }

        console.log("Order sent successfully!");

        return res.json({
            success: true,
            message: "تم إرسال الطلب بنجاح."
        });

    } catch (error) {
        console.error("Order Error:", error);

        return res.status(500).json({
            success: false,
            message: "حدث خطأ أثناء إرسال الطلب."
        });
    }
});

// =====================================
// معالجة الروابط غير الموجودة
// =====================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "الصفحة غير موجودة."
    });
});

// =====================================
// تشغيل الخادم
// =====================================

app.listen(PORT, () => {
    console.log("MADRAZO FAMILY STORE");
    console.log("Server running on port " + PORT);
});