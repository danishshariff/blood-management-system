# Blood Bank Management System

A comprehensive web-based Blood Bank Management System that facilitates blood donation, request management, and inventory tracking.

## Features

### User Management
- User registration and authentication
- Role-based access control (Donors and Blood Bank Staff)
- Profile management
- Session handling

### Blood Donation
- Donation tracking and history
- Eligibility checking (56-day interval)
- Donation statistics
- Real-time countdown to next eligible donation

### Blood Request Management
- Blood request creation
- Request status tracking
- Urgency levels (Normal, Urgent, Emergency)
- Direct requests for non-registered users

### Inventory Management
- Blood stock tracking
- Real-time stock updates
- Blood group-wise inventory
- Stock level monitoring

## Technical Stack

### Frontend
- HTML5, CSS3
- JavaScript (Vanilla)
- EJS Templating Engine
- Font Awesome Icons

### Backend
- Node.js
- Express.js
- PostgreSQL Database
- Session-based Authentication

### Database
- Third Normal Form (3NF) compliant
- Proper indexing for performance
- Transaction support
- Data integrity constraints

## Database Schema

### Tables
1. `users` - User information and authentication
2. `blood_banks` - Blood bank details
3. `blood_stock` - Blood inventory tracking
4. `donations` - Donation records
5. `blood_requests` - Blood request management
6. `direct_requests` - Non-registered user requests
7. `user_sessions` - Session management

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/blood-bank-management.git
cd blood-bank-management
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```
PG_HOST=localhost
PG_USER=postgres
PG_PASSWORD=your_password
PG_DATABASE=blood_bank_management
PG_PORT=5432
```

4. Initialize the database:
```bash
psql -U postgres -d blood_bank_management -f backend/config/database.sql
```

5. Start the application:
```bash
npm start
```

## Usage

### For Donors
1. Register/Login to the system
2. View available blood requests
3. Check donation eligibility
4. Make donations
5. Track donation history

### For Blood Bank Staff
1. Register/Login to the system
2. Manage blood stock
3. Process blood requests
4. Track donations
5. Generate reports

## Security Features

- Password hashing using bcrypt
- Session-based authentication
- Role-based access control
- Input validation
- SQL injection prevention
- XSS protection

## Performance Optimizations

- Database indexing
- Query optimization
- Caching strategies
- Efficient transaction handling
- Proper connection pooling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgments

- Font Awesome for icons
- PostgreSQL for database
- Node.js community
- Express.js team

## Contact

For any queries or support, please contact:
- Email: your.email@example.com
- GitHub: [yourusername](https://github.com/yourusername)
