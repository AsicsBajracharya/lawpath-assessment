# Lawpath Address Validation Application

A Next.js application for validating Australian addresses using the Australia Post API, with GraphQL integration, Elasticsearch logging, and Google Maps visualization.

## 🚀 Features

### **Verifier Tab**
- **Address Validation**: Validate postcode, suburb, and state combinations
- **Real-time Feedback**: Instant validation with detailed error messages
- **Google Maps Integration**: Visualize validated addresses on an interactive map
- **Form Persistence**: Form data persists across sessions and page refreshes

### **Source Tab**
- **Location Search**: Search for suburbs and postcodes across Australia
- **Category Filtering**: Filter results by location categories (Delivery Area, etc.)
- **Interactive Selection**: Click to select locations and view them on the map
- **Search Persistence**: Search queries and results persist across sessions

### **Technical Features**
- **GraphQL API**: Custom GraphQL proxy to Australia Post API
- **Elasticsearch Logging**: Comprehensive logging of all interactions
- **State Persistence**: Tab state and form data persist across browser sessions
- **Responsive Design**: Modern UI with Tailwind CSS
- **TypeScript**: Full type safety throughout the application

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Apollo Client (GraphQL)
- **Data Persistence**: localStorage with custom hooks
- **Maps**: Google Maps JavaScript API
- **Logging**: Elasticsearch
- **External API**: Australia Post Address Validation API

## 📋 Prerequisites

- Node.js 18+ 
- pnpm, npm, or yarn
- Google Maps API key (optional, for production)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd my-app
```

### 2. Install Dependencies
```bash
pnpm install
# or
npm install
# or
yarn install
```

### 3. Set Up Environment Variables
Create a `.env.local` file in the root directory:

```bash
# GraphQL endpoint (defaults to local API route)
NEXT_PUBLIC_GRAPHQL_ENDPOINT=/api/graphql

# Elasticsearch configuration
ELASTIC_NODE=https://lawpath-test-cluster-aba117.es.ap-southeast-1.aws.elastic.cloud:443
ELASTIC_API_KEY=VE9XcHhKZ0J4OExRWE1hZ0luMmI6amloV1pGWnFDVzJYWGRQVW92RjJ3UQ==
ELASTIC_INDEX=ashish-bajracharya-index

# Australia Post API
AUS_POST_BASE_URL=https://gavg8gilmf.execute-api.ap-southeast-2.amazonaws.com/staging/postcode/search.json
AUS_POST_TOKEN=7710a8c5-ccd1-160f-70cf03e8-b2bbaf01


### 4. Run the Development Server
```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

### 5. Open Your Browser
Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### **Verifier Tab**
1. Enter a suburb name (e.g., "Melbourne")
2. Enter a 4-digit postcode (e.g., "3000")
3. Select the state from the dropdown (e.g., "VIC")
4. Click "Verify" to validate the address
5. View the result and see the location on the map

### **Source Tab**
1. Enter a suburb or postcode in the search field
2. Click "Search" to find matching locations
3. Use the category filter to narrow down results
4. Click "Select" on any location to view it on the map

## 🧪 Test Cases

### **Valid Addresses**
- **VIC Melbourne 3000** ✅
- **VIC Ferntree Gully 3156** ✅
- **QLD Brisbane 4000** ✅
- **NSW Broadway 2007** ✅

### **Invalid Addresses**
- **NSW Ferntree Gully 3156** ❌ (Ferntree Gully is in VIC)
- **VIC Melbourne 3001** ❌ (Melbourne is 3000)
- **NSW FakeSuburb 2000** ❌ (Suburb doesn't exist)

## 🏗️ Architecture

### **Frontend Structure**
```
src/app/
├── components/
│   ├── Tabs.tsx              # Tab navigation component
│   ├── TabsWrapper.tsx       # Tab state management
│   ├── Verifier.tsx          # Address verification logic
│   ├── VerifierForm.tsx      # Verification form UI
│   ├── Source.tsx            # Location search logic
│   ├── LogsPanel.tsx         # Elasticsearch logs display
│   └── map/
│       └── Map.tsx           # Google Maps component
├── api/
│   ├── graphql/route.ts      # GraphQL proxy to Australia Post API
│   └── logs/route.ts         # Elasticsearch logging API
├── lib/
│   ├── apollo-client.ts      # Apollo Client configuration
│   ├── apollo-provider.tsx   # Apollo Provider wrapper
│   └── presistence.ts        # localStorage persistence hooks
└── page.tsx                  # Main application page
```

### **API Endpoints**
- **POST /api/graphql**: GraphQL proxy for address validation and search
- **GET /api/logs**: Retrieve logs from Elasticsearch
- **POST /api/logs**: Store logs to Elasticsearch

## 🔧 Configuration

### **Elasticsearch Setup**
The application uses Elasticsearch for logging. Update the `ELASTIC_INDEX` in your environment variables to use your own index name:

```bash
ELASTIC_INDEX=your-firstname-your-lastname-index
```

### **Google Maps API**
For production use, obtain a Google Maps API key and add it to your environment variables:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the "Maps JavaScript API"
3. Create credentials (API Key)
4. Add the key to `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

## 🚀 Deployment

### **Build for Production**
```bash
pnpm build
pnpm start
```

### **Environment Variables for Production**
Ensure all environment variables are set in your production environment:
- `ELASTIC_NODE`
- `ELASTIC_API_KEY`
- `ELASTIC_INDEX`
- `AUS_POST_BASE_URL`
- `AUS_POST_TOKEN`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (optional)

## 🐛 Troubleshooting

### **Common Issues**

1. **"Internal server error" on verification**
   - Check that Australia Post API credentials are correct
   - Verify network connectivity to the API endpoint

2. **Maps not loading**
   - Ensure Google Maps API key is valid (if provided)
   - Check browser console for API errors

3. **Elasticsearch logging failures**
   - Verify Elasticsearch credentials and endpoint
   - Check that the index name follows the required format

4. **Tab flickering on page load**
   - This is normal during hydration and should resolve quickly
   - The application shows a loading state during this process

## 📝 API Documentation

### **GraphQL Schema**
```graphql
type Query {
  verifyAddress(suburb: String!, postcode: String!, state: String!): VerifyResult
  searchLocations(q: String!, state: String): [Location]
}

type VerifyResult {
  isValid: Boolean!
  errors: [String!]!
  bestMatch: Location
}

type Location {
  id: Int!
  location: String!
  postcode: String!
  state: String!
  latitude: Float
  longitude: Float
  category: String
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is part of the Lawpath Engineering Assessment.

## 👨‍💻 Author

**Ashish Bajracharya**
- Built for Lawpath Engineering Assessment
- Next.js Developer Position
