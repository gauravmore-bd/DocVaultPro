# DocuVault Pro

A document management and sharing portal built with Node.js, Express, and MySQL.

## Features

- User authentication (register, login)
- Document upload and management
- Document versioning
- Document sharing with other users
- Permission-based access control
- Audit logging

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Setup Instructions

1. Clone the repository

```bash
git clone <repository-url>
cd docuvaultpro
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables

```bash
cp .env.example .env
```

Edit the `.env` file with your database credentials and JWT secret.

4. Run database migrations

```bash
npx knex migrate:latest
```

5. Start the server

```bash
npm start
```

The server will start on port 5000 by default (or the port specified in your .env file).

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Documents

- `POST /api/documents/upload` - Upload a new document
- `GET /api/documents/my` - Get all documents uploaded by the user
- `GET /api/documents/download/:id` - Download a document
- `GET /api/documents/view/:id` - View a document inline
- `POST /api/documents/:id/version` - Upload a new version of a document
- `GET /api/documents/:id/versions` - Get all versions of a document
- `GET /api/documents/version/:versionId/download` - Download a specific version
- `POST /api/documents/:id/restore/:versionId` - Restore a specific version
- `POST /api/documents/:id/share` - Share a document with another user
- `GET /api/documents/shared/with-me` - Get documents shared with the user

## License

ISC