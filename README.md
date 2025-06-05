# Warehouse Management System (WMS)

A modern, full-stack warehouse management system built with React, TypeScript, and Supabase. This application helps businesses manage inventory, track products, and gain insights through AI-powered analytics.

> **Note:** Currently, the Supabase integration is in progress. The application falls back to localStorage for data persistence until the Supabase connection is fully configured and operational.

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

### Backend
- Supabase (PostgreSQL) for database
- Express.js for AI Query backend
- OpenAI API for natural language processing

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

2. Install dependencies
```bash
npm install
```

3. Set up environment variables for Supabase (optional - currently using localStorage)
Create a `.env` file in the root directory with the following variables:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
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

### Database Setup

1. Create a new project in Supabase
2. Run the database schema script in `supabase_schema.sql`
3. Set up Row Level Security (RLS) policies as needed

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
The application currently uses two data storage mechanisms:

1. **localStorage**: Used as the primary fallback storage for:
   - Inventory data uploaded via CSV
   - SKU mappings
   - AI query history

2. **Supabase**: Integration in progress for:
   - Products table
   - Inventory table
   - Warehouses table

### Data Upload
1. Navigate to the Data Upload page
2. Upload a CSV file with inventory data
3. Review the data preview
4. Click "Save to Database" to persist the data (currently saves to localStorage with Supabase integration in progress)

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

### Supabase Connection Issues
- If the Dashboard is not showing any data, check that your Supabase credentials are correctly set in the `.env` file
- Currently, the application falls back to localStorage if Supabase connection fails
- Check browser console for any connection errors

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

## License

This project is licensed under the MIT License.
