const puppeteer = require("puppeteer");

let browserInstance = null;
let idleTimer = null;
let requestCount = 0;
const MAX_REQUESTS_BEFORE_RESTART = 50; // Restart browser after 50 renders to prevent memory leaks
const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // Close browser after 5 minutes of inactivity

async function getBrowser() {
    // Clear idle timer since the browser is active
    if (idleTimer) {
        clearTimeout(idleTimer);
        idleTimer = null;
    }

    if (!browserInstance || !browserInstance.isConnected()) {
        console.log("[Puppeteer] Launching fresh Chrome instance...");
        browserInstance = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage', // critical for low memory / Docker environments
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-extensions'
            ]
        });
        requestCount = 0;
    }
    return browserInstance;
}

function startIdleTimer() {
    if (idleTimer) clearTimeout(idleTimer);

    idleTimer = setTimeout(async () => {
        if (browserInstance && browserInstance.isConnected()) {
            console.log("[Puppeteer] Closing browser due to inactivity.");
            try {
                await browserInstance.close();
            } catch (err) {
                console.error("[Puppeteer] Error closing idle browser:", err);
            }
            browserInstance = null;
        }
    }, IDLE_TIMEOUT_MS);
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await getBrowser();
    requestCount++;

    const page = await browser.newPage();
    try {
        await page.setContent(htmlContent, { waitUntil: "networkidle0" });
        const pdfBuffer = await page.pdf({
            format: "A4",
            margin: {
                top: "20mm",
                bottom: "20mm",
                left: "15mm",
                right: "15mm"
            }
        });
        return pdfBuffer;
    } finally {
        await page.close();

        if (requestCount >= MAX_REQUESTS_BEFORE_RESTART) {
            console.log(`[Puppeteer] Reached ${MAX_REQUESTS_BEFORE_RESTART} requests. Re-spawning browser...`);
            try {
                await browser.close();
            } catch (err) {
                console.error("[Puppeteer] Error closing browser for scheduled restart:", err);
            }
            browserInstance = null;
        } else {
            startIdleTimer();
        }
    }
}

async function closeBrowser() {
    if (idleTimer) {
        clearTimeout(idleTimer);
        idleTimer = null;
    }
    if (browserInstance && browserInstance.isConnected()) {
        console.log("[Puppeteer] Force closing browser during shutdown...");
        await browserInstance.close();
        browserInstance = null;
    }
}

module.exports = {
    generatePdfFromHtml,
    closeBrowser
};
