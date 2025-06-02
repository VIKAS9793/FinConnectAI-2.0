# FinConnectAI 2.0 API Reference

## Base URL

```
https://api.finconnectai.com/v1  # Production
http://localhost:3001/api         # Development
```

## Authentication

All endpoints require JWT authentication.

```http
Authorization: Bearer <your_jwt_token>
```

## Rate Limiting

- **Rate Limit**: 100 requests per 15 minutes
- **Headers**:
  - `X-RateLimit-Limit`: Total allowed requests
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Timestamp when limit resets

## Endpoints

### 1. Health Check

```http
GET /health
```

**Response**
```json
{
  "status": "operational",
  "version": "1.0.0",
  "timestamp": "2025-05-30T14:12:42.000Z"
}
```

### 2. Transaction Analysis

```http
POST /transactions/analyze
```

**Request Body**
```json
{
  "transactionId": "txn_789012",
  "amount": 1250.75,
  "currency": "USD",
  "merchant": {
    "id": "mch_12345",
    "name": "Premium Online Retailer"
  },
  "customer": {
    "id": "cust_67890",
    "accountAgeDays": 120
  }
}
```

**Response**
```json
{
  "analysisId": "ana_abc123xyz",
  "riskScore": 78,
  "riskLevel": "HIGH",
  "recommendations": ["REQUIRE_2FA", "REVIEW_MANUALLY"]
}
```

### 3. Get Analysis Results

```http
GET /analyses/{analysisId}
```

**Response**
```json
{
  "analysisId": "ana_abc123xyz",
  "status": "COMPLETED",
  "createdAt": "2025-05-30T14:15:30.000Z",
  "result": {
    "riskScore": 78,
    "riskLevel": "HIGH"
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data"
  }
}
```

### 401 Unauthorized
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

### 429 Too Many Requests
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1622382000
```
