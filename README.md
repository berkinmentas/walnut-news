# Walnut News Scraper

News scraping service for Walnut Portal project. Built with Node.js and Puppeteer.

## Requirements
- Node.js LTS
- Docker
- Docker Compose

## Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file from `.env.example`
4. Run: `npm start`

## Docker
Run with Docker:
```docker build -t walnut-news.```
```docker run --network="host" -t walnut-news ```
```docker-compose up```