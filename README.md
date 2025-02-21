# Walnut News Scraper

A Node.js-based news scraping service that collects articles from various news sources for the Walnut Portal project.

## Technologies
- Node.js (LTS Version)
- Puppeteer
- Docker
- Docker Compose

## Requirements
- Node.js 20.x LTS
- Docker & Docker Compose
- PM2 (for production)

## Local Development Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. Start the application:
   ```bash
   npm run dev  # for development
   npm start    # for production
   ```

## Docker Setup

Build and run with Docker:
```bash
docker build -t walnut-news .
docker run --network="host" -t walnut-news
```

Using Docker Compose:
```bash
docker-compose up -d
```

## AWS EC2 Deployment

### Prerequisites
- AWS EC2 instance running Ubuntu 22.04 LTS
- Docker and Docker Compose installed

### Deployment Steps

1. Connect to your EC2 instance:
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

2. Install dependencies:
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Docker and Docker Compose
   sudo apt install docker.io docker-compose -y
   sudo systemctl enable docker
   sudo usermod -aG docker ubuntu
   ```

3. Clone and setup:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   cp .env.example .env
   # Edit .env with production settings
   ```

4. Build and run:
   ```bash
   docker-compose up -d --build
   ```

### Alternative PM2 Deployment

1. Install Node.js and PM2:
   ```bash
   # Install Node.js 20.x LTS
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install nodejs
   
   # Install PM2
   sudo npm install -g pm2
   ```

2. Setup application:
   ```bash
   npm install
   pm2 start index.js --name "walnut-news"
   pm2 save
   ```

### Monitoring and Maintenance

- View logs:
  ```bash
  # Docker logs
  docker-compose logs -f

  # PM2 logs
  pm2 logs walnut-news
  ```

- Restart service:
  ```bash
  # Docker
  docker-compose restart

  # PM2
  pm2 restart walnut-news
  ```

- Update application:
  ```bash
  git pull
  npm install
  
  # If using Docker:
  docker-compose up -d --build
  
  # If using PM2:
  pm2 restart walnut-news
  ```

## API Integration

This scraper sends data to the Laravel backend API. Ensure the following environment variables are set in your `.env` file:

```env
API_URL=http://your-laravel-api-url
API_KEY=your-api-key
```
