# Warehouse Management System (WMS)

A modern, full-stack warehouse management system built with React, TypeScript, and Node.js. This application helps businesses manage inventory, track products, and gain insights through AI-powered analytics.

## Submission Package

This project is submitted with the following components:

- **GitHub Repository**: [https://github.com/iamvikrammishra/wms-system/tree/main]
- **LOOM Video Presentation**: [https://www.loom.com/share/d7217efbc48d49d6be2f4f5355599f2d?sid=f070703a-a33d-42fb-b571-32b9679504d6]
- **Deployed Frontend**: [https://elaborate-cobbler-6b1c6b.netlify.app/]
- **Deployed Backend**: [https://wms-system.onrender.com]

> **Note:** The application uses localStorage for data persistence with backend integration for AI functionality.

## Features

- **Dashboard**: Real-time inventory metrics and visualizations
- **Data Upload**: CSV import functionality for bulk inventory updates
- **SKU Mapping**: Map generic SKUs to Master SKUs (MSKUs) for better organization
- **Analytics**: Detailed inventory analysis and reporting
- **AI Query**: Natural language interface to query inventory data using OpenAI

## Tech Stack

### Frontend
- React + TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- Recharts for data visualization
- React Router for navigation
- Netlify for deployment

### Backend
- Node.js with Express.js for AI Query backend
- OpenAI API for natural language processing
- Render for backend deployment

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Supabase account
- OpenAI API key (for AI Query feature)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd wms-system
```

2. Install frontend dependencies
```bash
npm install
```

3. Set up environment variables for the frontend
Create a `.env` file in the root directory with the following variables:
```
VITE_API_URL=http://localhost:10000 # URL for the backend server
```

4. Set up the Express server for AI Query
```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```
OPENAI_API_KEY=your-openai-api-key
```

> **Note:** The AI Query feature requires a valid OpenAI API key to function properly.

### Backend Setup

1. Navigate to the server directory
```bash
cd server
```

2. Install backend dependencies
```bash
npm install
```

3. Set up environment variables for the backend
Create a `.env` file in the server directory:
```
OPENAI_API_KEY=your-openai-api-key
PORT=10000
```

### Running the Application

1. Start the frontend
```bash
npm run dev
```

2. Start the backend (for AI Query)
```bash
cd server
node server.js
```

## Usage Guide

### Current Data Storage
The application currently uses localStorage as the primary storage mechanism for:

1. **Inventory Data**: Data uploaded via CSV files
2. **SKU Mappings**: Relationships between SKUs and MSKUs
3. **AI Query History**: Previous natural language queries and their results

### Data Upload
1. Navigate to the Data Upload page
2. Upload a CSV file with inventory data
3. Review the data preview
4. Click "Save to Database" to persist the data to localStorage

### Dashboard
The Dashboard provides an overview of your inventory:
- Total products and unique MSKUs
- Total inventory quantity
- Top MSKU by quantity
- Inventory distribution chart
- 7-day inventory trend

### SKU Mapping
1. Navigate to the SKU Mapping page
2. Map individual SKUs to Master SKUs (MSKUs)
3. Apply mappings to organize your inventory

### AI Query
1. Navigate to the AI Query page
2. Upload a CSV file or use existing inventory data
3. Ask natural language questions about your inventory
4. View the AI-generated responses and visualizations

## Architecture and Logic

### System Architecture

The WMS is built using a modern frontend architecture with localStorage for data persistence and an Express.js server for AI functionality:

```
┌─────────────────┐                           ┌─────────────────┐
│                 │                           │                 │
│  React Frontend ├───────────────────────────►  Express Server │
│                 │                           │   (AI Query)    │
│                 │                           │                 │
└────────┬────────┘                           └────────┬────────┘
         │                                             │
         │                                             │
         ▼                                             ▼
┌─────────────────┐                           ┌─────────────────┐
│                 │                           │                 │
│   localStorage   │                           │    OpenAI API   │
│  (Data Storage) │                           │                 │
│                 │                           │                 │
└─────────────────┘                           └─────────────────┘
```

### Core Logic Components

1. **Data Management Logic**
   - CSV parsing using PapaParse
   - Data validation and transformation
   - Persistence to Supabase/localStorage
   - Data retrieval and caching strategies

2. **Business Logic**
   - Inventory tracking and quantity management
   - SKU to MSKU mapping relationships
   - Warehouse location management
   - Sales and returns processing

3. **Visualization Logic**
   - Data aggregation for charts
   - Time-series trend generation
   - Metric calculations (totals, averages, etc.)
   - Dynamic chart rendering with Recharts

4. **AI Query Logic**
   - Natural language processing with OpenAI
   - Context preparation and prompt engineering
   - Response parsing and formatting
   - Result visualization (tables, charts)

### Data Flow

1. **Data Upload Flow**
   ```
   CSV File → Parse with PapaParse → Validate → Transform → Save to Supabase/localStorage
   ```

2. **Dashboard Data Flow**
   ```
   Fetch from Supabase/localStorage → Process Data → Calculate Metrics → Render Charts
   ```

3. **AI Query Flow**
   ```
   User Question + CSV Data → Express Server → OpenAI API → Parse Response → Render Results
   ```

### State Management

The application uses React's built-in state management with hooks:
- `useState` for component-level state
- `useEffect` for side effects and data fetching
- `useContext` for sharing state across components (where needed)

## Project Structure

```
wms-system/
├── src/
│   ├── components/       # Reusable UI components
│   ├── lib/              # Utilities and configurations
│   ├── pages/            # Page components
│   ├── services/         # API services for Supabase
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── server/               # Express server for AI Query
├── public/               # Static assets
├── .env                  # Environment variables
└── supabase_schema.sql   # Database schema
```

## Troubleshooting

### Data Persistence Issues
- If the Dashboard is not showing any data, check that localStorage is enabled in your browser
- Clear browser cache if you encounter data inconsistencies
- Check browser console for any JavaScript errors

### AI Query Not Working
- Ensure the Express server is running (`node server/server.js`)
- Verify your OpenAI API key is valid and has sufficient credits
- Check that the server is running on the expected port (default: 4000)

### Data Upload Issues
- Make sure your CSV file has the expected column headers
- Check for any validation errors in the preview
- If using Supabase, verify that your database schema matches the expected structure

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request


