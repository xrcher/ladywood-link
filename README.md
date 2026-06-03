# 🏙️ LadywoodLink
### ℹ️ About
LadywoodLink is a community-driven digital platform designed to empower the residents of Ladywood, Birmingham in the UK, by addressing critical local challenges in waste, sanitation, and environmental resilience. 

The app features an interactive dashboard that gamifies sustainable living through a "Green Points" loyalty scheme, rewarding users for verified recycling and reporting fly-tipping to directly target the area's 17,000-tonne waste backlog. 

By integrating real-time environmental alerts, such as sewage spillage warnings for local watercourses, LadywoodLink aims to bridge the digital divide and foster a more inclusive, climate-resilient neighbourhood.

---
### ✅ Features
- Account Login/Signup Database System with Password Encryption
- Functional Dashboard with Visual Overview of Key Data
- Interactive Dashboard Map with Reports and Warnings
- Dashboard Green Points and Carbon Footprint Score
- Household Recycling Reporting System to Earn Green Points
- Uncollected Rubbish/Flytipping Reporting System to Earn Green Points
- Profile and Accessibility Settings
- any more...? ✏️

---
### 🔗 Requirements
- Docker (Docker Desktop Recommended)
- npm (Install Using Instructions Below)
- Internet Connection for CDN Assets (May Change) ✏️

---
### 🔨 Usage (Development)
📁 *Make sure you are in src folder before running any commands! Use `cd src

1️⃣ **First Time Setup**
1. Run `docker compose up`
2. Run `npm install` (if not already installed)
3. Test database connection at http://localhost:3000/test-db (green emoji indicates functioning)

🟢 **Starting Server and NPM**
1. Run `docker compose up`
2. Run `npm run dev`
3. Open http://localhost:3000/ and login with 

🔴 **Stopping Server and NPM**
1. Run `npm stop`
2. Run `docker compose down` or stop the container in Docker Desktop

---
### 💾 Database Details
👤 **Development Log In**
Email: admin@test.com
Password: password

**Connection Details**
Connect using a client like Beekeeper Studio, or a built-in IDE plugin if you fancy:
Host: 127.0.0.1 (localhost)
Port: 5432
User: admin
Password: password
Database: auth_dashboard_db

****