# Blood Bank Management System API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication

#### Register User
- **POST** `/auth/register`
- **Multipart Form Data**
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string",
    "contact_no": "string",
    "address": "string",
    "blood_group": "string",
    "role": "donor | blood_bank_staff",
    "age": "number",
    "gender": "string",
    "bank_id": "number (optional)",
    "profile_picture": "file (optional)"
  }
  ```
- **Response**: User object with JWT token

#### Login
- **POST** `/auth/login`
- **Body**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**: User object with JWT token

#### Get Profile
- **GET** `/auth/profile`
- **Auth Required**: Yes
- **Response**: User profile details

#### Update Profile
- **PUT** `/auth/profile`
- **Auth Required**: Yes
- **Multipart Form Data**
  ```json
  {
    "name": "string (optional)",
    "contact_no": "string (optional)",
    "address": "string (optional)",
    "profile_picture": "file (optional)"
  }
  ```
- **Response**: Updated user object

### Blood Donations

#### Create Donation
- **POST** `/donations/donate`
- **Auth Required**: Yes
- **Body**
  ```json
  {
    "blood_group": "string",
    "quantity": "number",
    "bank_id": "number"
  }
  ```
- **Response**: Donation details

#### Get Donor History
- **GET** `/donations/history`
- **Auth Required**: Yes
- **Response**: List of user's donations

#### Check Donation Eligibility
- **GET** `/donations/eligibility`
- **Auth Required**: Yes
- **Response**: Eligibility status and next eligible date

#### Get Bank Donations
- **GET** `/donations/bank`
- **Auth Required**: Yes (Blood Bank Staff)
- **Response**: List of donations at the bank

#### Get Donation Statistics
- **GET** `/donations/stats`
- **Query Parameters**: `bank_id` (optional)
- **Response**: Donation statistics by blood group

### Blood Requests

#### Create Blood Request
- **POST** `/requests`
- **Auth Required**: Yes
- **Body**
  ```json
  {
    "blood_group": "string",
    "quantity": "number",
    "urgency": "normal | urgent | emergency",
    "reason": "string",
    "bank_id": "number"
  }
  ```
- **Response**: Request details

#### Create Direct Request
- **POST** `/requests/direct`
- **Body**
  ```json
  {
    "requester_name": "string",
    "contact_no": "string",
    "blood_group": "string",
    "quantity": "number",
    "reason": "string",
    "bank_id": "number"
  }
  ```
- **Response**: Request details

#### Get User Requests
- **GET** `/requests/user`
- **Auth Required**: Yes
- **Response**: List of user's requests

#### Get Bank Requests
- **GET** `/requests/bank`
- **Auth Required**: Yes (Blood Bank Staff)
- **Query Parameters**: `include_direct=true|false`
- **Response**: List of requests at the bank

#### Update Request Status
- **PUT** `/requests/:request_id/status`
- **Auth Required**: Yes (Blood Bank Staff)
- **Body**
  ```json
  {
    "status": "fulfilled | cancelled"
  }
  ```
- **Response**: Updated request details

#### Get Pending Requests
- **GET** `/requests/pending`
- **Query Parameters**: `bank_id` (optional)
- **Response**: List of pending requests

### Blood Banks

#### Get All Banks
- **GET** `/banks`
- **Response**: List of all blood banks with stock information

#### Get Banks by Location
- **GET** `/banks/location`
- **Query Parameters**: `state`, `city`
- **Response**: List of blood banks in the location

#### Get Bank Details
- **GET** `/banks/:bank_id`
- **Response**: Blood bank details with current stock

#### Check Blood Availability
- **GET** `/banks/availability`
- **Query Parameters**: `bank_id`, `blood_group`
- **Response**: Available quantity for the blood group

#### Create Blood Bank
- **POST** `/banks`
- **Auth Required**: Yes (Admin)
- **Body**
  ```json
  {
    "name": "string",
    "email": "string",
    "contact_no": "string",
    "address": "string",
    "state": "string",
    "city": "string"
  }
  ```
- **Response**: Created blood bank details

#### Update Blood Stock
- **PUT** `/banks/stock`
- **Auth Required**: Yes (Blood Bank Staff)
- **Body**
  ```json
  {
    "blood_group": "string",
    "quantity": "number",
    "operation": "add | subtract"
  }
  ```
- **Response**: Updated stock details

### Notifications

#### Get User Notifications
- **GET** `/notifications`
- **Auth Required**: Yes
- **Response**: List of user's notifications

#### Get Unread Notifications
- **GET** `/notifications/unread`
- **Auth Required**: Yes
- **Response**: List of unread notifications

#### Mark Notification as Read
- **PUT** `/notifications/:notification_id/read`
- **Auth Required**: Yes
- **Response**: Updated notification

#### Mark All Notifications as Read
- **PUT** `/notifications/read-all`
- **Auth Required**: Yes
- **Response**: List of updated notifications

## Error Responses
All endpoints return error responses in the following format:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error 