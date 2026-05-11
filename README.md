# Smart Prescription Template System

A standalone prescription template system for doctors. Create reusable diagnosis-based templates tagged by ICD-11 code with pre-configured drug regimens from the PPB catalog.

## Architecture

| Package | Description | Output |
|---------|-------------|--------|
| `packages/server` | Express + Prisma + PostgreSQL API | REST API on port 3000 |
| `packages/react` | React component library | npm package (`smart-prescription-react`) |
| `packages/widget` | Vanilla JS widget | UMD bundle for CDN/script tag |

## Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm 9+

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create the database

```bash
createdb smart_prescription
```

### 3. Configure environment

```bash
cd packages/server
cp .env.example .env
# Edit .env with your DATABASE_URL if different from default
```

Default DATABASE_URL: `postgresql://kevinkoech:password@localhost:5432/smart_prescription`

### 4. Run database migrations

```bash
cd packages/server
npx prisma migrate dev --name init
```

### 5. Generate Prisma client

```bash
cd packages/server
npx prisma generate
```

## Running

### Start the API server

```bash
# From project root
npm run dev:server

# Or directly
cd packages/server
npm run dev
```

Server starts at `http://localhost:3000`. Verify:

```bash
curl http://localhost:3000/health
```

### Start the React dev app

```bash
# From project root
npm run dev:react

# Or directly
cd packages/react
npx vite
```

Opens at `http://localhost:5173`.

### Start the Widget demo

```bash
cd packages/widget
npx vite
```

Opens at `http://localhost:5174`.

## Testing the Full Flow

### Step 1: Register a user

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@test.com",
    "name": "Dr. Test",
    "password": "password123",
    "role": "PHYSICIAN"
  }'
```

Save the `token` from the response.

### Step 2: Set the token in the browser

Open the React app at `http://localhost:5173`, then in browser console:

```javascript
localStorage.setItem('token', 'PASTE_YOUR_TOKEN_HERE')
location.reload()
```

### Step 3: Sync the drug catalog

Register an admin user for sync access:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "name": "Admin",
    "password": "admin123",
    "role": "ADMIN"
  }'
```

Trigger the PPB catalog sync (uses the admin token):

```bash
curl -X POST http://localhost:3000/api/drugs/sync \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

This fetches generic drugs from the PPB/DHA HIE Terminology Service and caches them locally.

### Step 4: Create a prescription template

Via the React UI (click "New Template") or via API:

```bash
curl -X POST http://localhost:3000/api/templates \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "templateName": "Malaria Treatment - Uncomplicated",
    "icd11Code": "1C62",
    "icd11Description": "Malaria due to Plasmodium falciparum",
    "visibility": "PUBLIC",
    "instructions": "Start treatment within 24 hours of confirmed diagnosis. Monitor for vomiting within 1 hour of dose.",
    "findings": [
      {"finding": "Temperature", "findingType": "VITAL", "isRequired": true},
      {"finding": "Parasitemia Level", "findingType": "LAB_RESULT", "isRequired": true},
      {"finding": "Weight", "findingType": "VITAL", "isRequired": true}
    ],
    "drugItems": [
      {
        "drugCode": "GE13069",
        "drugName": "ARTEMETHER + LUMEFANTRINE",
        "dosage": "2 tablets",
        "frequency": "Twice daily",
        "duration": 3,
        "durationUnit": "DAYS",
        "routeOfAdministration": "Oral",
        "instructions": "Take with fatty food for better absorption"
      }
    ]
  }'
```

### Step 5: List templates

```bash
curl http://localhost:3000/api/templates \
  -H "Authorization: Bearer YOUR_TOKEN"
```

With filters:

```bash
curl "http://localhost:3000/api/templates?icd_code=1C62&visibility=PUBLIC&search=malaria" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 6: Use a template (get prescription-ready data)

```bash
curl http://localhost:3000/api/templates/TEMPLATE_ID/use \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Returns a pre-filled prescription payload ready for submission.

### Step 7: Test ICD-11 search

```bash
curl "http://localhost:3000/api/icd/search?q=malaria" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 8: Test drug search

```bash
curl "http://localhost:3000/api/drugs/search?q=amox" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Testing Privacy/Visibility

1. Register two users (doctor1 and doctor2)
2. As doctor1, create a template with `"visibility": "PRIVATE"`
3. As doctor2, try to list templates — the private template should not appear
4. As doctor1, list templates — it should appear
5. Change visibility to `"PUBLIC"` — now doctor2 can see and use it

## API Reference

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (email, name, password, role) |
| POST | `/api/auth/login` | Login (email, password) → token |
| GET | `/api/auth/me` | Get current user |

### Templates (requires auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/templates` | Create template |
| GET | `/api/templates` | List (query: search, icd_code, visibility, page, limit) |
| GET | `/api/templates/:id` | Get one template |
| PUT | `/api/templates/:id` | Update (owner/admin only) |
| DELETE | `/api/templates/:id` | Delete (owner/admin only) |
| GET | `/api/templates/:id/use` | Get prescription-ready output |

### Drugs (requires auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/drugs/search?q=` | Search local drug cache |
| GET | `/api/drugs/:code` | Get drug by generic_concept_code |
| POST | `/api/drugs/sync` | Trigger PPB catalog sync (admin only) |

### ICD-11 (requires auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/icd/search?q=` | Search ICD-11 diagnoses |

## Using the React Component in Another Project

```bash
npm install smart-prescription-react
```

```tsx
import { TemplateManager } from 'smart-prescription-react';

function MyApp() {
  return (
    <TemplateManager
      apiBaseUrl="http://localhost:3000"
      authToken={userToken}
      onUseTemplate={(data) => {
        // data contains prescription-ready items, findings, instructions
        console.log(data);
      }}
      mode="embedded"
    />
  );
}
```

## Using the Vanilla JS Widget

```html
<script src="prescription-template-widget.umd.js"></script>
<div id="rx-templates"></div>
<script>
  const widget = new PrescriptionTemplateWidget({
    container: '#rx-templates',
    apiBaseUrl: 'http://localhost:3000',
    authToken: 'your-jwt-token',
    mode: 'full'
  });

  widget.on('template:applied', (data) => {
    console.log('Prescription data:', data);
  });

  widget.mount();
</script>
```

## Build for Production

```bash
# Build React library
npm run build:react

# Build Widget (UMD + ES)
npm run build:widget

# Build both
npm run build:all
```

Output:
- `packages/react/dist/` — ES module + CJS + types
- `packages/widget/dist/` — UMD bundle + CSS
