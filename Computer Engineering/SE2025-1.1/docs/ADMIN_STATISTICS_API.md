# Admin Statistics API Documentation

## 📊 Overview

Admin Statistics API cung cấp dashboard analytics cho SE2025 Cinema System với **4 rạp chiếu phim**. API yêu cầu role `ADMIN` để truy cập.

**Base URL**: `http://localhost:5000/api/admin/statistics`  
**Authorization**: JWT Bearer Token với role ADMIN

## 👤 Admin Access

```yaml
Username: admin
Email: admin@se2025.com
Password: admin123
Role: ADMIN
```

## 📈 Endpoints

### 1. Dashboard Summary

Get tổng quan doanh thu và booking statistics.

```http
GET /api/admin/statistics/dashboard?startDate=2025-11-01&endDate=2025-11-30
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `startDate` (required): YYYY-MM-DD format
- `endDate` (required): YYYY-MM-DD format

**Response 200 OK:**
```json
{
  "totalRevenue": 125000000,
  "totalBookings": 450,
  "totalTickets": 890,
  "averageTicketPrice": 140449,
  "growth": {
    "revenue": 15.5,
    "bookings": 12.3,
    "tickets": 18.7
  },
  "bookingsByStatus": {
    "confirmed": 420,
    "cancelled": 15,
    "pending": 15,
    "completed": 380
  },
  "startDate": "2025-11-01",
  "endDate": "2025-11-30"
}
```

### 2. Revenue by Movie

Top movies performance trong period.

```http
GET /api/admin/statistics/revenue/by-movie?startDate=2025-11-01&endDate=2025-11-30&limit=5
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `startDate` (required): Start date
- `endDate` (required): End date  
- `limit` (optional): Top N movies (default: 10)

**Response 200 OK:**
```json
{
  "movies": [
    {
      "movieId": 1,
      "title": "Avatar",
      "genre": "Action, Adventure",
      "totalRevenue": 45000000,
      "totalTickets": 375,
      "totalShowtimes": 12,
      "averagePrice": 120000,
      "occupancyRate": 82.5
    }
  ],
  "summary": {
    "totalMovies": 5,
    "totalRevenue": 125000000,
    "totalTickets": 890,
    "averageOccupancy": 78.3
  },
  "startDate": "2025-11-01",
  "endDate": "2025-11-30"
}
```

### 3. Revenue by Theater

Performance comparison across 4 theaters.

```http
GET /api/admin/statistics/revenue/by-theater?startDate=2025-11-01&endDate=2025-11-30
Authorization: Bearer <admin_token>
```

**Response 200 OK:**
```json
{
  "theaters": [
    {
      "theaterId": 1,
      "name": "SE2025-HN01",
      "address": "Cinema Hai Ba Trung, Hanoi",
      "city": "Hanoi",
      "totalRevenue": 32000000,
      "totalTickets": 235,
      "totalShowtimes": 8,
      "occupancyRate": 85.2,
      "roomCount": 1,
      "avgTicketPrice": 136170
    },
    {
      "theaterId": 2,
      "name": "SE2025-HN02", 
      "address": "Cinema Royal City, Hanoi",
      "city": "Hanoi",
      "totalRevenue": 28000000,
      "totalTickets": 210,
      "totalShowtimes": 6,
      "occupancyRate": 78.9,
      "roomCount": 1,
      "avgTicketPrice": 133333
    }
  ],
  "summary": {
    "totalTheaters": 4,
    "totalRevenue": 125000000,
    "totalTickets": 890,
    "averageOccupancy": 78.3
  },
  "startDate": "2025-11-01", 
  "endDate": "2025-11-30"
}
```

### 4. Daily Revenue Trend

Time-series data cho charts.

```http
GET /api/admin/statistics/revenue/by-date?startDate=2025-11-01&endDate=2025-11-30
Authorization: Bearer <admin_token>
```

**Response 200 OK:**
```json
{
  "dailyRevenue": [
    {
      "date": "2025-11-01",
      "totalRevenue": 4200000,
      "totalBookings": 15,
      "totalTickets": 28,
      "averageTicketPrice": 150000,
      "occupancyRate": 82.3
    }
  ],
  "summary": {
    "totalDays": 30,
    "totalRevenue": 125000000,
    "averageDailyRevenue": 4166667,
    "peakDay": {
      "date": "2025-11-15",
      "revenue": 6500000
    },
    "lowestDay": {
      "date": "2025-11-03", 
      "revenue": 2100000
    }
  },
  "startDate": "2025-11-01",
  "endDate": "2025-11-30"
}
```

### 5. Monthly Revenue Trend

Monthly analytics với growth calculations.

```http
GET /api/admin/statistics/revenue/by-month?startDate=2025-01-01&endDate=2025-12-31
Authorization: Bearer <admin_token>
```

**Response 200 OK:**
```json
{
  "monthlyRevenue": [
    {
      "month": "2025-01",
      "totalRevenue": 98500000,
      "totalBookings": 380,
      "totalTickets": 745,
      "averageTicketPrice": 132214,
      "occupancyRate": 75.2,
      "growthRate": 0,
      "daysInMonth": 31
    },
    {
      "month": "2025-02", 
      "totalRevenue": 125000000,
      "totalBookings": 450,
      "totalTickets": 890,
      "averageTicketPrice": 140449,
      "occupancyRate": 82.1,
      "growthRate": 26.9,
      "daysInMonth": 28
    }
  ],
  "summary": {
    "totalMonths": 12,
    "totalRevenue": 1450000000,
    "averageMonthlyRevenue": 120833333,
    "bestMonth": {
      "month": "2025-12",
      "revenue": 185000000
    },
    "worstMonth": {
      "month": "2025-03",
      "revenue": 89000000  
    },
    "overallGrowthRate": 15.8
  },
  "startDate": "2025-01-01",
  "endDate": "2025-12-31"
}
```

## 🔒 Security Features

### Authorization
- **Role Required**: `ADMIN` 
- **Token**: JWT Bearer trong Authorization header
- **Validation**: Role-based guard protection

### Error Responses

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": ["startDate must be a valid date string", "endDate is required"],
  "error": "Bad Request"
}
```

## 🛠️ Technical Details

### Timezone Handling
- Dates được parse với explicit timezone: `YYYY-MM-DDTHH:mm:ss`
- SQL queries sử dụng `DATE()` function để tránh timezone drift
- Growth calculations so sánh với same period trước đó

### Performance
- **Indexed queries**: BookingDate, Status columns có indexes
- **Efficient joins**: LEFT JOIN optimization cho missing data
- **Error handling**: Try-catch với fallback default values
- **Caching potential**: Redis có thể implement cho daily stats

### Data Consistency
- **Status filtering**: Chỉ count 'Confirmed' và 'Completed' bookings
- **NULL handling**: COALESCE() cho missing values
- **Growth calculations**: Handle division by zero cases

## 📊 Use Cases

### Dashboard Integration
```javascript
// Fetch dashboard data
const response = await fetch('/api/admin/statistics/dashboard?startDate=2025-11-01&endDate=2025-11-30', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});

const dashboardData = await response.json();

// Display in charts/tables
console.log(`Total Revenue: ${dashboardData.totalRevenue.toLocaleString()} VND`);
console.log(`Growth Rate: ${dashboardData.growth.revenue}%`);
```

### Multi-Theater Comparison
```javascript
// Theater performance comparison
const theaterStats = await fetch('/api/admin/statistics/revenue/by-theater?startDate=2025-11-01&endDate=2025-11-30', {
  headers: {
    'Authorization': `Bearer ${adminToken}`  
  }
});

const theaters = await theaterStats.json();

theaters.theaters.forEach(theater => {
  console.log(`${theater.name}: ${theater.totalRevenue.toLocaleString()} VND (${theater.occupancyRate}% occupancy)`);
});
```

## 🔄 Future Enhancements

### Planned Features:
- **Real-time analytics** với WebSocket updates
- **Export functionality** (PDF, Excel reports)  
- **Advanced filtering** (by movie genre, theater city)
- **Predictive analytics** với machine learning
- **Custom date ranges** và period comparisons
- **Email scheduled reports** cho management team

### API Versioning:
- Current: `/api/admin/statistics`
- Future: `/api/v2/admin/statistics` với enhanced features