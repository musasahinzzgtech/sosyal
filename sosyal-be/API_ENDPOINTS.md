# User API Endpoints

## User Registration with Photos

### POST `/api/users/register-with-photos`

Registers a new user with optional photo uploads.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `userData`: JSON string containing user information
  - `photos`: Array of image files (optional, max 10)

**User Data Fields:**
```json
{
  "firstName": "string (required)",
  "lastName": "string (required)",
  "email": "string (required, unique)",
  "phone": "string (optional)",
  "password": "string (required, min 8 chars)",
  "city": "string (required)",
  "birthDate": "string (required, ISO date)",
  "userType": "musteri|isletme (required)",
  "skinColor": "string (optional)",
  "height": "number (optional, 100-250)",
  "weight": "number (optional, 30-200)",
  "age": "number (optional, 18-100)",
  "services": "string (optional)",
  "priceRange": "string (optional)",
  "businessAddress": "string (optional, required for isletme)",
  "businessSector": "string (optional, required for isletme)",
  "businessServices": "string (optional, required for isletme)",
  "instagram": "string (optional)",
  "facebook": "string (optional)"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "city": "string",
    "userType": "musteri|isletme",
    "photos": ["string"],
    "createdAt": "date",
    "updatedAt": "date"
  }
}
```

## Photo Management

### POST `/api/users/upload-photos` (Protected)
Upload multiple photos for an authenticated user.

**Request:**
- Authorization: `Bearer <token>`
- Content-Type: `multipart/form-data`
- Body:
  - `photos`: Array of image files (max 10)

**Response:**
```json
{
  "message": "Photos uploaded successfully",
  "photoUrls": ["string"],
  "count": "number"
}
```

### POST `/api/users/upload-photo` (Protected)
Upload a single photo for an authenticated user.

**Request:**
- Authorization: `Bearer <token>`
- Content-Type: `multipart/form-data`
- Body:
  - `photo`: Single image file

**Response:**
```json
{
  "message": "Photo uploaded successfully",
  "photoUrl": "string",
  "filename": "string"
}
```

### DELETE `/api/users/remove-photo` (Protected)
Remove a photo from user's profile.

**Request:**
- Authorization: `Bearer <token>`
- Content-Type: `application/json`
- Body:
  - `url`: Photo URL to remove

**Response:**
```json
{
  "message": "Photo removed successfully"
}
```

## User Profile

### GET `/api/users/profile/complete` (Protected)
Get complete user profile details.

**Request:**
- Authorization: `Bearer <token>`

**Response:**
```json
{
  "_id": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "city": "string",
  "birthDate": "date",
  "userType": "musteri|isletme",
  "photos": ["string"],
  "businessAddress": "string",
  "businessSector": "string",
  "businessServices": "string",
  "instagram": "string",
  "facebook": "string",
  "rating": "number",
  "reviewCount": "number",
  "isOnline": "boolean",
  "isVerified": "boolean",
  "createdAt": "date",
  "updatedAt": "date"
}
```

## File Upload Specifications

- **Supported formats**: JPG, JPEG, PNG, GIF
- **Maximum file size**: 5MB per file
- **Maximum files**: 10 files per request
- **Storage location**: `/uploads/photos/`
- **Access URL**: `/uploads/photos/<filename>`

## Business User Requirements

When `userType` is `"isletme"`, the following fields are required:
- `businessServices`: Description of services offered
- `businessSector`: Business sector (e.g., "elektirik", "kaporta", "boya")
- `businessAddress`: Business address (optional but recommended)

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `409`: Conflict (email already exists)
- `500`: Internal Server Error

Error responses include descriptive messages:
```json
{
  "message": "Error description",
  "statusCode": 400
}
```
