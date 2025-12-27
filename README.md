# 🔍 Swagger API Validator

A powerful Vue.js application that automatically tests API endpoint validations by analyzing Swagger/OpenAPI documentation and finding security vulnerabilities and missing validations.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Vue](https://img.shields.io/badge/vue-3.4-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Features

### Core Functionality
- 🔄 **Automatic Swagger Import** - Import from URL with auto-detected base URL
- 🎯 **10 Validation Types** - Comprehensive validation testing
- 🤖 **Smart Suggestions** - AI-powered validation recommendations
- 📊 **Detailed Reporting** - Export results in JSON format
- 🎨 **Modern UI** - Beautiful dark mode interface with breadcrumb navigation
- 💾 **Persistent Storage** - LocalStorage for projects and results
- ⚡ **Real-time Testing** - Live progress tracking and results

### Validation Types
1. **WHITESPACE** - Detects whitespace-only values
2. **NO_STRING** - Tests numeric parameters with string values
3. **MAX_STRING** - Validates maximum length constraints
4. **MIN_STRING** - Validates minimum length constraints
5. **MAX_NUMBER** - Tests maximum value constraints
6. **MIN_NUMBER** - Tests minimum value constraints
7. **MAX_DATE** - Validates future date constraints
8. **MIN_DATE** - Validates past date constraints
9. **EMAIL_CHECK** - Tests email format validation
10. **PHONE_CHECK** - Tests phone format validation

### Advanced Features
- ✅ **False Positive Management** - Mark and filter false positives
- 🔍 **Smart Filtering** - Search and filter endpoints
- 📈 **Statistics Dashboard** - Project overview and test metrics
- 🎨 **Breadcrumb Navigation** - Easy navigation across all pages
- 🏷️ **Project Context** - Always know which project you're working on

## 🚀 Quick Start

### Prerequisites
- Node.js 16.x or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd Validator

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## 📖 Usage Guide

### 1. Import Swagger Documentation

On the Dashboard:
1. Enter your Swagger/OpenAPI URL
2. Click "Import"
3. Base URL is automatically detected from the spec

**Example URLs:**
- Test API: `http://localhost:4000/api-docs-json`
- Swagger Petstore: `https://petstore.swagger.io/v2/swagger.json`

### 2. Select Endpoints

Browse endpoints by tags:
- Filter using search
- See parameter counts
- View test status

### 3. Configure Validations

For each endpoint:
1. Click "Configure"
2. Use "Smart Suggestions" for automatic recommendations
3. Base URL is auto-filled from Swagger
4. Select validation types
5. Click "Run Tests"

### 4. View Results

Test results include:
- ✅ Passed tests (correct validation)
- ❌ Failed tests (missing validation)
- 📊 Summary statistics
- 💡 Fix recommendations

### 5. Manage False Positives

Mark tests as false positive:
- Add reason/notes
- Automatically filtered in future runs
- Export and manage all false positives

## 🧪 Test API

A sample API with intentional validation gaps is included for testing:

### Starting the Test API

```bash
cd test-api
npm install
npm start
```

Test API will run on `http://localhost:4000`

**Swagger Documentation:**
- UI: `http://localhost:4000/api-docs`
- JSON: `http://localhost:4000/api-docs-json`

### Test API Endpoints

**Users** (`/api/users`)
- GET, POST, PUT, DELETE
- Intentional gaps: email format, phone format, whitespace, max length

**Products** (`/api/products`)
- GET, POST, PUT, DELETE
- Intentional gaps: price range, string length, type validation

**Orders** (`/api/orders`)
- GET, POST, PUT, DELETE
- Intentional gaps: enum validation, type checking, array validation

### Expected Validation Issues

The test API intentionally has ~10-15 validation issues:
- ❌ No whitespace trimming
- ❌ No email format validation
- ❌ No phone format validation
- ❌ No max length checks
- ❌ No min/max number validation
- ❌ No type checking (string vs number)

See `test-api/README.md` for detailed test scenarios.

## 🏗️ Project Structure

```
Validator/
├── src/
│   ├── components/       # Reusable Vue components
│   │   ├── Breadcrumb.vue
│   │   ├── PageHeader.vue
│   │   ├── Button.vue
│   │   ├── Modal.vue
│   │   └── ...
│   ├── pages/           # Page components
│   │   ├── Dashboard.vue
│   │   ├── EndpointList.vue
│   │   ├── ValidationConfig.vue
│   │   ├── TestRunner.vue
│   │   └── Results.vue
│   ├── services/        # Business logic
│   │   ├── swaggerService.js
│   │   ├── validationService.js
│   │   └── storageService.js
│   ├── stores/          # Pinia state management
│   │   ├── swaggerStore.js
│   │   ├── validationStore.js
│   │   └── testStore.js
│   └── router/          # Vue Router configuration
├── test-api/            # Sample test API
│   ├── src/
│   │   ├── server.js
│   │   └── routes/
│   ├── README.md
│   └── TEST-GUIDE.md
├── docs/                # Documentation
│   ├── architecture/
│   ├── validation/
│   ├── ui/
│   └── api/
└── README.md
```

## 🛠️ Technology Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **Vite 4** - Next generation frontend tooling
- **Pinia** - State management
- **Vue Router** - Official routing
- **TailwindCSS** - Utility-first CSS
- **Axios** - HTTP client
- **js-yaml** - YAML parser

### Test API
- **Express** - Web framework
- **Swagger UI Express** - API documentation
- **Swagger JSDoc** - Generate OpenAPI spec from JSDoc

## 📚 Documentation

Comprehensive documentation is available in the `docs/` folder:

- [System Overview](docs/architecture/system-overview.md)
- [Validation Rules](docs/validation/rules.md)
- [UI/UX Design](docs/ui/wireframes.md)
- [API Integration](docs/api/swagger-integration.md)

## 🔧 Configuration

### Dark Mode
- Automatically enabled by default
- Toggle in settings (coming soon)

### Test Settings
- Concurrent tests: 5 (default)
- Test delay: 100ms (default)
- Timeout: 10s (default)

### Storage
All data is stored in browser LocalStorage:
- Projects and configurations
- Test results
- False positives
- User preferences

## 🐛 Troubleshooting

### Common Issues

**Issue:** `extractBaseUrl is not a function`
- **Solution:** Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+F5)

**Issue:** Duplicate projects appearing
- **Solution:** Use `cleanup-duplicates.html` utility

**Issue:** Tests not running
- **Solution:** Ensure base URL is correct and API is accessible

**Issue:** CORS errors
- **Solution:** Ensure API has CORS enabled or use a proxy

### Cleanup Utilities

**Remove duplicate projects:**
Open `cleanup-duplicates.html` in browser and follow instructions.

**Debug LocalStorage:**
Run script in `debug-storage.js` in browser console.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Swagger/OpenAPI specification
- Vue.js community
- TailwindCSS team
- All contributors and testers

---

**Happy Testing! 🎉**

For questions or issues, please open an issue on the repository.
