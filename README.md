#Production Support

A comprehensive React-based production support dashboard for tracking and monitoring the end-to-end prior authorization (PA) process. This application provides real-time visibility into API health, process workflows, and system performance for healthcare authorization operations.

## 🎯 Overview

The Production Support application is designed for production support teams to monitor and manage the complex prior authorization workflow. It integrates with multiple healthcare APIs and provides a unified interface for tracking packets through various stages of the authorization process.

### Key Audiences

- **Production Support Teams**: Monitor system health and troubleshoot issues in real-time
- **Technical Operations**: Track API performance and identify bottlenecks
- **Healthcare Operations Staff**: Monitor packet flow and process stages
- **Developers & Maintainers**: Understand system architecture and contribute to the codebase

## ✨ Features

### 1. API Health Dashboard
- **Real-time Monitoring**: Track the health status of critical healthcare APIs
- **Performance Metrics**: View latency measurements for each API endpoint
- **Status Indicators**: Visual indicators (🟢 Healthy, 🟠 Degraded, 🔴 Down) for quick assessment
- **Monitored APIs**:
  - HETS (Eligibility verification)
  - PECOS (Provider NPI validation)
  - WestFax (Fax communication)
  - OCR (Document digitization)
  - eSMD (Electronic submission)

### 2. Process Tracker
- **End-to-End Visibility**: Track authorization packets through the complete workflow
- **Stage Monitoring**: View current stage and progress for each packet
- **Multi-Channel Support**: Track packets from Fax, eSMD, and Provider Portal channels
- **Process Stages**:
  1. Packet Intake
  2. OCR & Digitization
  3. Manual Correction
  4. Eligibility Check (HETS)
  5. Provider NPI Check (PECOS)
  6. Medical Review Intake
  7. Medical Review
  8. Letter Generation
  9. Delivery (WestFax/Mailroom)

### 3. Navigation & Interface
- **Intuitive Navigation**: Easy-to-use tab-based interface
- **Future Modules**: Placeholders for Error Logs and Payload Inspector
- **Professional UI**: Clean, accessible design with consistent branding

## 🛠️ Technology Stack

- **Frontend Framework**: React 18.2.0
- **Build Tool**: Create React App (react-scripts 5.0.1)
- **Styling**: Inline CSS with modern design patterns
- **State Management**: React Hooks (useState, useEffect)

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Safari, or Edge)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/contactshobhit/wiser-production-support.git
   cd wiser-production-support
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- **`npm start`**: Runs the app in development mode
- **`npm test`**: Launches the test runner in interactive watch mode
- **`npm run build`**: Builds the app for production to the `build` folder
- **`npm run eject`**: Ejects from Create React App (one-way operation)

## 📁 Project Structure

```
wiser-production-support/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/
│   │   ├── ApiHealthDashboard.js       # API health monitoring
│   │   ├── ProcessTracker.js           # Packet workflow tracker
│   │   ├── Header.js                   # Application header
│   │   ├── NavBar.js                   # Navigation component
│   │   ├── OutboundCommunicationDashboard.js  # (Legacy)
│   │   └── PacketIntakeDashboard.js    # (Legacy)
│   ├── App.js              # Main application component
│   └── index.js            # Application entry point
├── Reference files/        # Design reference files
├── package.json           # Project dependencies
└── README.md             # This file
```

## 📊 Current Screens

### 1. API Health
The main dashboard showing real-time health status of all integrated APIs with performance metrics.

### 2. Process Tracker
Displays all active authorization packets with their current stage and progress indicators.

### 3. Error Logs (Coming Soon)
Future module for centralized error logging and troubleshooting.

### 4. Payload Inspector (Coming Soon)
Future module for inspecting API request/response payloads for debugging.

## 🔧 Development

### Component Overview

- **App.js**: Main application shell with routing logic
- **Header.js**: Displays application branding and title
- **NavBar.js**: Tab-based navigation between different screens
- **ApiHealthDashboard.js**: Monitors external API health with simulated polling
- **ProcessTracker.js**: Tracks packets through the authorization workflow

### Styling Approach

The application uses inline CSS for styling with a consistent design system:
- Primary color: `#003366` to `#005fa3` (gradient blue)
- Background: `#f5f7fa` (light gray)
- Accent colors: Status-based (green, orange, red)

### Data Flow

Currently, the application uses simulated data for demonstration purposes:
- API health data is generated with random status updates every 5 seconds
- Process tracker displays sample packets with mock data

**Future Enhancement**: Integration with real backend APIs for live data

## 🎨 Design Reference

The `Reference files/` directory contains HTML design references for various screens that informed the current implementation:
- Packet intake dashboard
- Outbound communication dashboard
- Clinical review interfaces
- Analytics dashboards

## 📝 Development Notes

### Recent Changes
- Removed packet intake and outbound communication screens from active navigation
- Streamlined to focus on core monitoring capabilities (API Health and Process Tracker)
- Maintained legacy components for potential future reactivation

### Code Quality
- Components follow React functional component patterns with hooks
- Accessible markup with ARIA labels and semantic HTML
- Responsive design considerations

## 🤝 Contributing

When contributing to this project:

1. Maintain the existing code style and component structure
2. Ensure components are accessible (ARIA labels, semantic HTML)
3. Test across different browsers
4. Update documentation for new features
5. Keep the UI consistent with the established design system

## 📄 License

This project is private and proprietary to Wiser/Genzeon organization.

## 🆘 Support & Contact

For production support issues, questions, or feature requests, please contact the development team.

---

**Built with ❤️ for Healthcare Operations**
