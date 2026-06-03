# LadywoodLink
### About
LadywoodLink is...

---
### Features
- feature 1
- feature 2
- feature 3
---
### Requirements
- Docker
- npm

---
### Usage (Development)
**Starting Server and NPM**
1. Run `docker compose up`
2. Run `npm install` (if not already installed)
3. Run `npm run dev`
4. Test database connection at http://localhost:3000/test-db (green emoji indicates functioning)
5. Open http://localhost:3000/ and click `Skip to Dashboard (DEV)`

**Stopping Server and NPM**
1. Run `npm stop`
2. Open Docker Desktop and press stop button on the database container

*NOTE:* From here, all pages can be accessed via the dashboard with `dev-bypass`. After SQL is set up, a demo account 
will be created for access to the dashboard instead, and the bypass will be removed.

---