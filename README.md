# Digital Banking API

A backend banking system built with Node.js, Express, and MongoDB, integrating with the **NibssByPhoenix** sandbox API for BVN/NIN verification and core banking operations (account creation, transfers, balance checks, and transaction status).

## Features

- **User Authentication** — signup and login with JWT-based auth
- **Customer Onboarding** — BVN/NIN insertion and validation via NIBSS
- **Account Creation** — KYC-based account creation, auto pre-funded with ₦15,000
- **Core Banking Operations**
  - Name Enquiry (verify recipient before transfer)
  - Funds Transfer (intra-bank and inter-bank)
  - Account Balance Check
  - Transaction Status Check
- **Transaction History** — each user can only view their own transactions (data isolation enforced)

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Atlas) with Mongoose
- **Auth:** JSON Web Tokens (JWT), bcrypt for password hashing
- **External API:** [NibssByPhoenix](https://nibssbyphoenix.onrender.com/api/docs/) for KYC verification and banking operations
- **Other:** Axios (HTTP client for NIBSS calls), UUID (transaction references)

## Project Structure

```
digital-bank/
├── Config/
│   ├── databaseConfig.js    # MongoDB connection
│   ├── cloudinary.js        # Cloudinary config (image uploads)
│   └── nibss.js              # NIBSS auth token + API client
├── Controllers/
│   ├── UserController.js     # signup, login
│   ├── CustomerController.js # onboarding, KYC verification
│   ├── AccountController.js  # BVN/NIN insert/validate, account creation
│   └── TransactionController.js # name enquiry, transfer, balance, status, history
├── Middleware/
│   ├── auth.js                # JWT verification (protect routes)
│   └── role.js                # role-based authorization
├── Models/
│   ├── Users.js
│   ├── Customer.js
│   ├── Account.js
│   └── Transaction.js
├── Routes/
│   ├── UserRoute.js
│   ├── CustomerRoute.js
│   ├── AccountRoute.js
│   └── TransactionRoute.js
├── app.js                     # app entry point
└── .env                        # environment variables (not committed)
```

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/Johnnywick07/digital-bank-api.git
cd digital-bank-api
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create a `.env` file in the root directory
```env
PORT=3099
MONGO_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<any random secret string>
NIBSS_API_KEY=<your NIBSS fintech onboarding apiKey>
NIBSS_API_SECRET=<your NIBSS fintech onboarding apiSecret>
NIBSS_BASE_URL=https://nibssbyphoenix.onrender.com
```

> Your `NIBSS_API_KEY` and `NIBSS_API_SECRET` are obtained by calling the NIBSS `POST /api/fintech/onboard` endpoint with your name and email.

### 4. Run the server
```bash
npm run dev
```
Server runs at `http://localhost:3099` (or whichever `PORT` you set).

## API Endpoints

### Users (`/users`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/users/` | Create a new user | No |
| POST | `/users/login` | Login and receive JWT token | No |

### Customers (`/customers`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/customers/onboard` | Insert + validate BVN/NIN, save verified customer record | Yes |
| GET | `/customers/me` | Get logged-in user's onboarding status | Yes |

**Sample onboard body:**
```json
{
  "kycType": "bvn",
  "kycID": "22334455667",
  "firstName": "John",
  "lastName": "Anu",
  "dob": "2002-03-17",
  "phone": "08012345678"
}
```

### Accounts (`/accounts`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/accounts/insert-bvn` | Insert a BVN record | Yes |
| POST | `/accounts/validate-bvn` | Validate a BVN | Yes |
| POST | `/accounts/insert-nin` | Insert a NIN record | Yes |
| POST | `/accounts/validate-nin` | Validate a NIN | Yes |
| POST | `/accounts/create` | Create a bank account (auto-funded ₦15,000) | Yes |
| GET | `/accounts/me` | Get logged-in user's account | Yes |

**Sample create body:**
```json
{
  "kycType": "bvn",
  "kycID": "22334455667",
  "dob": "2002-03-17"
}
```

### Transactions (`/transactions`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/transactions/name-enquiry` | Verify recipient account details | Yes |
| POST | `/transactions/transfer` | Transfer funds (intra/inter-bank) | Yes |
| GET | `/transactions/balance` | Check account balance | Yes |
| GET | `/transactions/status/:reference` | Check a transaction's status | Yes |
| GET | `/transactions/history` | View own transaction history | Yes |

**Sample transfer body:**
```json
{
  "receiverAccount": "3841411321",
  "receiverBankCode": "384",
  "amount": 5000,
  "narration": "Test transfer"
}
```

## Authentication

All protected routes require a Bearer token in the request header:
```
Authorization: Bearer <your_jwt_token>
```
Obtain a token by calling `POST /users/login`.

## Data Privacy & Isolation

Each user can only view and manage their own account and transaction data. Transaction history queries are scoped to the authenticated user's ID (`req.user.id`), so no user can access another user's records.

## Testing

This API was tested using Postman against a local server connected to MongoDB Atlas and the live NibssByPhoenix sandbox API.

## Notes

- Account numbers, balances, and BVN/NIN records are generated/managed by the NibssByPhoenix sandbox — no real BVN/NIN data is used or required.
- Every new account is pre-funded with ₦15,000 to enable test transactions, as specified in the project requirements.
