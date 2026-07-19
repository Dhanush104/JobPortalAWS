# Online Job Application Portal – AWS Deployment Guide

## Project Overview

This project is a full-stack **Online Job Application Portal** deployed on **Amazon Web Services (AWS)**.

The frontend is built using **React.js** and hosted on **Amazon S3** with **CloudFront** for global content delivery. The backend is developed using **Node.js** and **Express.js**, deployed on an **EC2** instance with **Nginx** as a reverse proxy. The application uses **Amazon RDS MySQL** as its database and is secured with **HTTPS** using **Let's Encrypt SSL** and **DuckDNS**.

---

# Tech Stack

## Frontend

* React.js
* HTML5
* CSS3
* JavaScript

## Backend

* Node.js
* Express.js
* JWT Authentication
* bcrypt

## Database

* Amazon RDS MySQL

## AWS Services

* Amazon EC2
* Amazon S3
* Amazon CloudFront
* Amazon RDS
* Amazon VPC
* Security Groups

## Other Tools

* Nginx
* PM2
* DuckDNS
* Let's Encrypt
* Git
* GitHub

---

# AWS Architecture

```text
                  Users
                     │
               HTTPS Request
                     │
          Amazon CloudFront (CDN)
                     │
              Amazon S3 Bucket
         (React Frontend - Vite)
                     │
          HTTPS API Requests
                     │
             DuckDNS Domain
                     │
              Nginx Reverse Proxy
                     │
             Node.js + Express
             (Running with PM2)
                     │
               Amazon RDS MySQL
```

---

# Deployment Steps

## 1. Create AWS Infrastructure

* Create VPC
* Create Public Subnet
* Configure Internet Gateway
* Configure Route Table
* Configure Security Groups

---

## 2. Launch EC2 Instance

* Ubuntu Server
* Configure Security Group
* Connect using SSH

---

## 3. Install Required Software

```bash
sudo apt update
sudo apt install nginx
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs
sudo npm install -g pm2
```

---

## 4. Deploy Backend

Clone repository

```bash
git clone https://github.com/Dhanush104/JobPortalAWS.git
```

Install packages

```bash
npm install
```

Configure environment variables

```env
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
```

Start server

```bash
pm2 start server.js --name server
```

---

## 5. Configure Nginx

Proxy requests to Node.js application

```nginx
server {
    listen 80;
    server_name jobportalec2.duckdns.org;

    location / {
        proxy_pass http://127.0.0.1:3000;
    }
}
```

Reload Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6. Configure Amazon RDS

* Create MySQL database
* Configure Security Group
* Update backend `.env`
* Verify database connectivity

---

## 7. Deploy Frontend

Build React project

```bash
npm run build
```

Upload build folder to S3

```bash
aws s3 sync dist/ s3://YOUR_BUCKET_NAME --delete
```

---

## 8. Configure CloudFront

* Create Distribution
* Select S3 bucket as Origin
* Enable HTTPS
* Configure caching

---

## 9. Configure HTTPS

Create DuckDNS domain

```
jobportalec2.duckdns.org
```

Install SSL

```bash
sudo certbot --nginx -d jobportalec2.duckdns.org
```

---

## 10. Update Frontend API

```javascript
const API_URL = "https://jobportalec2.duckdns.org/api";
```

Rebuild

```bash
npm run build
```

Upload new build

```bash
aws s3 sync dist/ s3://YOUR_BUCKET_NAME --delete
```

Invalidate CloudFront cache

```bash
aws cloudfront create-invalidation \
--distribution-id YOUR_DISTRIBUTION_ID \
--paths "/*"
```

---

# Challenges Faced


* Nginx reverse proxy configuration
* CloudFront mixed-content errors
* SSL certificate installation

---

# Final Deployment

### Frontend

Amazon S3 + CloudFront

### Backend

Amazon EC2 + Nginx + PM2

### Database

Amazon RDS MySQL

### Security

HTTPS using Let's Encrypt + DuckDNS

---

# Project Outcome

The application is successfully deployed on AWS with:

* Secure HTTPS communication
* Cloud-based architecture
* Scalable frontend delivery using CloudFront
* Dedicated backend hosted on EC2
* Managed MySQL database using Amazon RDS
* Production-ready deployment with Nginx and PM2

---

# GitHub Repository Structure

```text
Online-Job-Application-Portal/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── database/
│   ├── server.js
│   └── package.json
│
├── screenshots/
│   ├── architecture.png
│   ├── homepage.png
│   ├── login.png
│   ├── dashboard.png
│   └── aws-deployment.png
│
├── README.md
└── LICENSE
```
