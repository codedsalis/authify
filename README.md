# Codedsalis Authify

## Features

- **Authentication and Authorization:**
  - User registration with secure password hashing.
  - Role-based access control using custom decorators and guards.

- **Email Integration:**
  - Welcome emails upon user registration.
  - Email queue processing via Redis.

- **Database Support:**
  - SQLite database for local development.

- **Template-Based Emails:**
  - Uses Handlebars templates for email content (e.g., `welcome.hbs`).

- **Dockerized Environment:**
  - Docker Compose for simplified setup and environment consistency.

---

## Prerequisites

- Node.js v20
- Docker and Docker Compose

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/codedsalis/authify.git
cd authify
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` and customize the values as needed:

```bash
cp .env.example .env
```

### 3. Start the Services

Run the application using Docker Compose:

```bash
docker-compose up --build
```

This will start the following services:
- Node.js backend
- SQLite database
- Redis for queue management
- NGINX reverse proxy

---

### 4. Link to documentation
Once all services have started, you can go to https://localhost:3000/api to test the available endpoints

## Development

### Install Dependencies

Install dependencies locally if needed:

```bash
npm install
```

### Run the Application Locally

Start the application in development mode:

```bash
npm run start:dev
```

### Build for Production

Build the project for production:

```bash
npm run build
```

---

## Testing

### Run Unit Tests

```bash
npm test
```

---

## Key Files and Directories

- **`src/config/`**: Configuration files for app, database, mailer, and Redis.
- **`src/common/resources/templates/`**: Handlebars templates for email content.
- **`docker-compose.yml`**: Defines the Dockerized environment.
- **`nginx.conf`**: Configuration for NGINX reverse proxy.

