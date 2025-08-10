# 📦 Asset Inventory Management System

A professional, mobile-first Progressive Web App (PWA) for comprehensive asset inventory management with advanced features including camera capture, VIN decoding, and QR code scanning.

## 🚀 Live Demo

**Access the app:** [https://mcdougaj.github.io/AssetInventorey/](https://mcdougaj.github.io/AssetInventorey/)

## ✨ Features

### 📱 Mobile-First Design
- **Progressive Web App (PWA)** - Install on mobile devices like a native app
- **Responsive design** - Works seamlessly on phones, tablets, and desktops
- **Touch-optimized interface** - Designed for mobile interaction

### 📸 Advanced Photo Management
- **Camera capture** - Take photos directly within the app
- **File upload** - Upload existing photos from device
- **Multiple photo types** - Asset photos and nameplate photos
- **Photo preview** - View and manage captured images
- **Bulk download** - Download all photos as ZIP files

### 🚗 VIN Decoding
- **NHTSA API integration** - Automatic vehicle information lookup
- **Comprehensive data** - Make, model, year, engine, transmission details
- **Error handling** - Smart validation and user feedback
- **Data persistence** - Saves decoded information for future reference

### 📋 QR Code Scanning
- **Real-time scanning** - Instant QR code recognition
- **Camera switching** - Front/back camera support
- **Asset lookup** - Quick asset identification via QR codes

### 🔒 Security & Performance
- **Content Security Policy** - Protection against XSS attacks
- **Input sanitization** - DOMPurify integration
- **HTTPS ready** - Secure hosting on GitHub Pages
- **Offline capability** - PWA caching for offline use

## 🛠️ Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Backend:** Supabase (PostgreSQL)
- **APIs:** NHTSA VIN Decoder API
- **Libraries:**
  - Supabase JS Client
  - jsQR (QR code detection)
  - DOMPurify (XSS protection)
  - JSZip (File compression)
  - Chart.js (Analytics)

## 📱 Installation as PWA

### Mobile (iOS/Android)
1. Open the app in your mobile browser
2. Look for "Add to Home Screen" prompt
3. Tap "Add" to install as a native-like app
4. Access from your home screen with full camera permissions

### Desktop
1. Open the app in Chrome/Edge
2. Look for the install icon in the address bar
3. Click "Install" to add to your desktop
4. Launch like any other desktop application

## 🚀 Quick Start

1. **Access the app** at the live demo URL
2. **Create an account** or sign in
3. **Add your first asset** using the "+" button
4. **Take photos** using the camera feature
5. **Decode VINs** for vehicles (17-character VIN required)
6. **Scan QR codes** for quick asset lookup

## 🔧 Local Development

```bash
# Clone the repository
git clone https://github.com/mcdougaj/AssetInventorey.git

# Navigate to project directory
cd AssetInventorey

# Open in your preferred web server
# (Live Server extension in VS Code recommended)
```

### Environment Setup
- Requires HTTPS for camera access (GitHub Pages provides this)
- Supabase project configured for backend operations
- No build process required - pure HTML/JS/CSS

## 📊 Database Schema

The app uses Supabase with the following main tables:
- `assets` - Core asset information
- `vehicle_attributes` - Detailed VIN-decoded vehicle data
- Row-Level Security (RLS) enabled for data protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NHTSA** for providing the free VIN decoder API
- **Supabase** for the backend-as-a-service platform
- **jsQR** library for QR code detection
- **DOMPurify** for security sanitization

## 📞 Support

For support, feature requests, or bug reports, please open an issue in this repository.

---

**Built with ❤️ for efficient asset management**
