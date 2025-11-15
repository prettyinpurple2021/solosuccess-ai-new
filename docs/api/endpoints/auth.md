# Authentication Endpoints

## Register

Create a new user account.

**Endpoint:** `POST /auth/register`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "businessName": "Acme Inc"
}
```

**Validation Rules:**
- `email`: Valid email format, unique
- `password`: Minimum 8 characters, must include uppercase, lowercase, and numbers
- `firstName`: Optional, 1-50 characters
- `lastName`: Optional, 1-50 characters
- `businessName`: Optional, 1-100 characters

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_123abc",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "subscriptionTier": "free",
      "createdAt": "2025-11-15T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input
- `409 Conflict` - Email already exists

---

## Login

Authenticate and receive access token.

**Endpoint:** `POST /auth/login`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "mfaCode": "123456"
}
```

**Parameters:**
- `email`: User's email address
- `password`: User's password
- `mfaCode`: Optional, required if MFA is enabled

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_123abc",
      "email": "user@example.com",
      "subscriptionTier": "premium",
      "mfaEnabled": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `403 Forbidden` - MFA code required or invalid

---

## Logout

End the current session.

**Endpoint:** `POST /auth/logout`

**Authentication:** Required

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Successfully logged out"
  }
}
```

---

## Refresh Token

Obtain a new access token using refresh token.

**Endpoint:** `POST /auth/refresh`

**Authentication:** Not required (uses refresh token)

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or expired refresh token

---

## Forgot Password

Request a password reset link.

**Endpoint:** `POST /auth/forgot-password`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Password reset email sent if account exists"
  }
}
```

**Note:** For security, this endpoint always returns success even if the email doesn't exist.

---

## Reset Password

Reset password using reset token.

**Endpoint:** `POST /auth/reset-password`

**Authentication:** Not required

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Password successfully reset"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid or expired token
- `400 Bad Request` - Password doesn't meet requirements

---

## Setup MFA

Enable multi-factor authentication.

**Endpoint:** `POST /auth/mfa/setup`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "backupCodes": [
      "12345678",
      "87654321",
      "11223344",
      "44332211",
      "55667788"
    ]
  }
}
```

**Note:** User must verify MFA setup by calling the verify endpoint with a code from their authenticator app.

---

## Verify MFA

Verify and activate MFA setup.

**Endpoint:** `POST /auth/mfa/verify`

**Authentication:** Required

**Request Body:**
```json
{
  "code": "123456"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "MFA successfully enabled",
    "mfaEnabled": true
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid MFA code

---

## OAuth Login

Authenticate using OAuth providers (Google, LinkedIn).

**Endpoint:** `GET /auth/oauth/:provider`

**Parameters:**
- `provider`: `google` or `linkedin`

**Query Parameters:**
- `redirect_uri`: URL to redirect after authentication

**Response:** Redirects to OAuth provider

**Callback:** `GET /auth/oauth/:provider/callback`

After successful OAuth authentication, user is redirected to the application with a token in the URL or session.
