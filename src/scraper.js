const puppeteer = require('puppeteer');
const { sendToLaravel } = require('./api');

async function setupBrowser() {
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--window-size=1920,1080',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-site-isolation-trials'
        ]
    });
    const page = await browser.newPage();

    await page.setViewport({
        width: 1920,
        height: 1080
    });

    await page.setExtraHTTPHeaders({
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
    });

    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

    await page.setDefaultNavigationTimeout(120000);
    await page.setDefaultTimeout(120000);

    return { browser, page };
}

async function getWordCount(text) {
    return text.trim().split(/\s+/).length;
}

async function waitForTimeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeEconomyNews() {
    let browser;
    try {
        const { browser: newBrowser, page } = await setupBrowser();
        browser = newBrowser;

        console.log('Navigating to World page...');
        
        await page.setCookie({
            name: 'cookieConsent',
            value: 'true',
            domain: '.hurriyet.com.tr'
        });

        await page.goto('https://www.hurriyet.com.tr/dunya/', {
            waitUntil: 'networkidle0',
            timeout: 120000
        });

        await waitForTimeout(3000);

        await page.evaluate(async () => {
            await new Promise((resolve) => {
                let totalHeight = 0;
                const distance = 100;
                const timer = setInterval(() => {
                    const scrollHeight = document.documentElement.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;
                    if(totalHeight >= scrollHeight - window.innerHeight){
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });

        await waitForTimeout(2000);

        const newsLinks = await page.evaluate(() => {
            const links = [...document.querySelectorAll('.category__list__item a[href]')];
            return links
                .map(link => link.href)
                .filter(href => href.includes('/dunya/'))
                .filter((url, index, self) => self.indexOf(url) === index);
        });

        if (newsLinks.length === 0) {
            throw new Error('No news links found!');
        }

        
        const randomNewNumber = Math.floor(Math.random() * newsLinks.length);

        const targetUrl = newsLinks[randomNewNumber];


        await page.goto(targetUrl, {
            waitUntil: 'networkidle0',
            timeout: 120000
        });

        await waitForTimeout(3000);

        const newsData = await page.evaluate(() => {
            const selectors = {
                title: [
                    '.news-detail-title',
                    'h1.title',
                    '.article-head__title',
                    '.content-head__title'
                ],
                content: [
                    '.news-content',
                    '.article-content',
                    '.content-body',
                    '.news-detail-content'
                ]
            };

            const getContent = (selectorList) => {
                for (const selector of selectorList) {
                    const element = document.querySelector(selector);
                    if (element) return element.innerText;
                }
                return '';
            };

            return {
                title: getContent(selectors.title),
                content: getContent(selectors.content)
            };
        });

        if (!newsData.title || !newsData.content) {
            throw new Error('Could not extract news content');
        }

        const wordCount = await getWordCount(newsData.content);

        const payload = [{
            title: newsData.title,
            word_count: wordCount,
            source: 'hurriyet.com.tr/dunya'
        }];

        console.log('News data:', {
            title: newsData.title,
            wordCount
        });

        await sendToLaravel(payload);

    } catch (error) {
        console.error('Scraping error details:', {
            message: error.message,
            stack: error.stack
        });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function startScraping() {
    console.log('Starting scraper service...');
    const interval = parseInt(process.env.SCRAPE_INTERVAL) || 300000;
    
    setInterval(async () => {
        console.log('Starting new scrape job:', new Date().toISOString());
        await scrapeEconomyNews();
    }, interval);

    await scrapeEconomyNews();
}

module.exports = { startScraping };