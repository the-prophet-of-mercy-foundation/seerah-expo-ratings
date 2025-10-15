# Architecture Document: Art Model Rating & Real-time Dashboard

**Version:** 1.0

**Date:** October 26, 2023

**Project:** Exhibition Model Feedback System

**Status:** Final

---

## Table of Contents

- Introduction & Goals
- Clarifications & Assumptions
- High-Level Design (HLD)
- Low-Level Design (LLD)
- Implementation Steps
- Cost Analysis
- Risk Assessment & Mitigation
- Technical Specifications
- Appendices

---

## 1. Introduction & Goals

### Project Overview

This system provides a free, scalable solution for collecting visitor feedback on physical art models at an exhibition focused on the life of the Prophet Muhammad (peace be upon him). The solution enables real-time monitoring of visitor experiences.

### Primary Objectives

- Provide a simple, fast rating system for visitors (max. 5 categories)
- Display real-time aggregated ratings on the organizer dashboard
- Ensure zero operational costs for exhibition duration
- Maintain robustness during intermittent connectivity
- Require minimal technical setup and maintenance

### Scope

- Frontend: Mobile-optimized rating pages
- Backend: Cloud-based data storage and processing
- Dashboard: Real-time analytics display
- Integration: QR code-based stall identification

---

## 2. Clarifications & Assumptions

### Important Clarifications

- Ratings target the stall experience - physical models and volunteer explanations
- Feedback focuses on presentation quality, not sacred content
- System designed for temporary exhibition use (weeks to months)

### Technical Assumptions

- Visitors use personal smartphones to scan QR codes
- Volunteers/organizers have a tablet or screen for dashboard display
- Stable Wi-Fi available, but system handles brief outages
- No user authentication required for simplicity

---

## 3. High-Level Design (HLD)

### System Architecture

The high-level architecture is shown below:

```text
+----------------+      +-----------------+      +-------------------+
|                |      |                 |      |                   |
|  Visitor's     +----->+  Cloud Backend  +----->+  Organizer's      |
|  Smartphone    |      |  (Firebase)     |      |  Dashboard        |
|  (QR Client)   |      |                 |      |  (TV/Tablet)      |
|                |      |                 |      |                   |
#+----------------+      +-----------------+      +-------------------+
         ^                                                      |
         |                                                      |
         +------------------------------------------------------+
                  (Unique QR code per stall/room)
```

### Core Components

- **Rating Client** — Mobile web page reachable via QR codes
- **Data Backend** — Google Firebase cloud services (Firestore)
- **Real-time Dashboard** — Web-based analytics display (hosted on GitHub Pages or similar)

### Data Flow

1. Visitor scans stall-specific QR code
2. Rating page loads with pre-selected stall context
3. Visitor submits ratings (1–5 per category)
4. Data transmitted to Firebase backend
5. Dashboard updates in real-time and organizers monitor live feedback

---

## 4. Low-Level Design (LLD)

### 4.1 Technology Stack

| Component | Technology | Justification |
| --- | --- | --- |
| Frontend | HTML5, CSS3, Vanilla JavaScript | Lightweight, no framework dependencies |
| Hosting | GitHub Pages (Free) | Zero cost, simple deployment |
| Backend | Google Firebase (Spark Plan) | Free tier, real-time capabilities |
| Database | Firestore NoSQL | Real-time listeners, easy scalability |
| QR Codes | Free online generators | Simple integration, no cost |

### 4.2 Data Model

**Firestore Collection:** `stalls`

```javascript
{
  stallId: "stall_kaaba",           // Unique identifier
  name: "The Kaaba Model",          // Display name
  description: "Replica of the Holy Kaaba from the Prophet's time",
  createdAt: timestamp,             // Auto-generated
  updatedAt: timestamp              // Auto-updated
}
```

**Sub-collection:** `ratings` (under each stall)

```javascript
{
  ratingId: "auto_generated",       // Firestore auto-ID
  timestamp: timestamp,             // Submission time
  categories: {
    model_design: 5,                // 1-5 stars
    explanation_clarity: 4,         // 1-5 stars
    historical_significance: 5,     // 1-5 stars
    visual_impact: 4,               // 1-5 stars
    overall_experience: 5           // 1-5 stars
  }
}
```

### 4.3 Rating Categories

| Category | Description | Purpose |
| --- | --- | --- |
| Model Design & Detail | Craftsmanship, accuracy, physical beauty | Evaluate artistic quality |
| Explanation Clarity | Volunteer presentation effectiveness | Assess communication quality |
| Historical Significance | Educational value, importance conveyed | Measure learning impact |
| Visual Impact | Immediate "wow" factor, aesthetics | Gauge emotional response |
| Overall Experience | Holistic stall visit rating | Overall satisfaction |

### 4.4 User Interface Specifications

#### Rating Page Design

Example wireframe (text):

```text
+-----------------------------------+
|  Rate: The Kaaba Model Experience |
|                                   |
| [Model Design & Detail]           |
| ★ ★ ★ ★ ☆ (4/5)                   |
|                                   |
| [Explanation Clarity]             |
| ★ ★ ★ ☆ ☆ (3/5)                   |
|                                   |
| [Historical Significance]         |
| ★ ★ ★ ★ ★ (5/5)                   |
|                                   |
| [Visual Impact]                   |
| ★ ★ ★ ★ ☆ (4/5)                   |
|                                   |
| [Overall Experience]              |
| ★ ★ ★ ★ ☆ (4/5)                   |
|                                   |
|       [ SUBMIT RATING ]           |
#+-----------------------------------+
```

#### Dashboard Design

Example table (text):

```text
+---------+----------------+----------+---------+
| Stall   | Overall Rating | Votes    | Details |
+---------+----------------+----------+---------+
| Kaaba   |      4.6 ★     |   (142)  | [View]  |
| Mosque  |      4.2 ★     |   (98)   | [View]  |
| House   |      4.8 ★     |   (76)   | [View]  |
| Market  |      3.9 ★     |   (113)  | [View]  |
+---------+----------------+----------+---------+
```

---

## 5. Implementation Steps

### Phase 1: Setup & Configuration (Day 1)

1. Create Firebase Project

```bash
# Navigate to: https://console.firebase.google.com
# Create new project: "exhibition-feedback"
# Enable Firestore Database in "test mode"
```

1. Set Up GitHub Repository

```bash
# Create repo: "exhibition-rating-system"
# Enable GitHub Pages in settings
# Default branch: main, folder: /root
```

### Phase 2: Development (Days 2–3)

#### File Structure

```text
/exhibition-rating-system/
│
├── index.html              # Dashboard main page
├── rate.html               # Rating page template
├── css/
│   └── style.css          # Unified styling
├── js/
│   ├── firebase-config.js # Firebase initialization
│   ├── rating.js          # Rating page logic
│   └── dashboard.js       # Dashboard logic
└── assets/
    └── qr-codes/          # Generated QR codes
```

#### Firebase Configuration (`js/firebase-config.js`)

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
```

#### Rating Page Logic (Key Functions)

```javascript
// Get stall ID from URL parameters
function getStallIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('stallId');
}

// Submit rating to Firestore
async function submitRating(ratingData) {
  const stallId = getStallIdFromURL();
  try {
    await db.collection('stalls').doc(stallId)
            .collection('ratings').add(ratingData);
    showThankYouMessage();
  } catch (error) {
    handleSubmissionError(error);
  }
}
```

### Phase 3: Deployment & Setup (Day 4)

#### QR Code Generation

Example QR code URL structure:

```text
https://your-username.github.io/exhibition-rating-system/rate.html?stallId=stall_kaaba
```

#### Stall Setup Checklist

- Generate unique QR code for each stall
- Test QR code scanning with multiple devices
- Print QR codes with clear instructions
- Position codes at eye level for easy access
- Train volunteers on system purpose and use

#### Dashboard Setup

- Load dashboard URL on organizer tablet/TV
- Test real-time updates between multiple devices
- Verify data persistence after page refresh
- Confirm average calculations are accurate

---

## 6. Cost Analysis

| Component | Resource | Cost | Free Tier Limits |
| --- | --- | ---: | --- |
| Frontend Hosting | GitHub Pages | $0 | Unlimited sites, 100GB/month |
| Backend Services | Firebase Spark Plan | $0 | 1GB storage, 50K reads/day |
| Database | Firestore | $0 | 20K writes/day, 20K deletes/day |
| QR Codes | Online generators | $0 | Unlimited codes |
| **Total** | All Services | **$0.00** | Sufficient for exhibition |

### Usage Estimates

- Expected visitors: 2,000 over exhibition period
- Ratings per day: ~200–300 (10–15% participation rate)
- Daily database reads: ~5,000 (well within 50K limit)
- Storage requirement: ~100MB (well within 1GB limit)

---

## 7. Risk Assessment & Mitigation

### Technical Risks

| Risk | Probability | Impact | Mitigation Strategy |
| --- | --- | --- | --- |
| Internet outage | Medium | High | Implement offline storage with sync recovery |
| Low participation | High | Medium | Volunteer encouragement, clear signage |
| Duplicate submissions | Low | Low | Client-side rate limiting (1 submission per session) |
| Firestore quota exceeded | Low | High | Monitor usage, implement simple caching |

### Offline Functionality Plan

```javascript
// Offline submission handler
function submitRatingWithOfflineSupport(ratingData) {
  if (navigator.onLine) {
    submitToFirebase(ratingData);
  } else {
    // Store in localStorage for later sync
    const pendingRatings = JSON.parse(localStorage.getItem('pendingRatings') || '[]');
    pendingRatings.push({...ratingData, timestamp: new Date()});
    localStorage.setItem('pendingRatings', JSON.stringify(pendingRatings));
    showOfflineMessage();
  }
}

// Sync pending ratings when back online
function syncPendingRatings() {
  const pendingRatings = JSON.parse(localStorage.getItem('pendingRatings') || '[]');
  pendingRatings.forEach(rating => {
    submitToFirebase(rating);
  });
  localStorage.removeItem('pendingRatings');
}
```

---

## 8. Technical Specifications

### Performance Requirements

- Page Load Time: < 3 seconds on 3G connection
- Rating Submission: < 2 seconds processing time
- Dashboard Update: Real-time (< 1 second delay)
- Concurrent Users: Support 50+ simultaneous ratings

### Browser Compatibility

- Mobile: Chrome, Safari, Samsung Internet (iOS/Android)
- Desktop: Chrome, Firefox, Safari, Edge
- Fallback: Progressive enhancement for older browsers

### Security Measures

- Firestore rules to prevent data tampering
- Input validation on client side
- XSS protection through DOM sanitization
- CORS configuration for cross-origin protection

### Monitoring & Analytics

- Basic console logging for error tracking
- Firebase Analytics integration (optional)
- Daily export of ratings data for backup
- Simple participation rate calculation

---

## Appendix A: Firebase Security Rules

```javascript
// Firestore security rules (basic)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for all during exhibition (test mode)
    match /{document=**} {
      allow read, write: if true;
    }
    
    // Alternative: More restrictive rules
    // match /stalls/{stallId} {
    //   allow read: if true;
    //   allow write: if false; // Only via admin
    // }
    // match /stalls/{stallId}/ratings/{ratingId} {
    //   allow read: if true;
    //   allow create: if request.time < timestamp.date(2024, 1, 1);
    // }
  }
}
```

## Appendix B: Sample QR Code Implementation

```html
<!-- Sample stall signage -->
<div class="qr-signage">
  <h3>Help Us Improve!</h3>
  <p>Scan to rate your experience at this stall</p>
  <img src="assets/qr-codes/stall_kaaba.png" alt="QR Code">
  <p>Thank you for your feedback</p>
</div>
```

---

Document End

This architecture provides a complete, cost-free solution for exhibition model rating with real-time dashboard capabilities. The system is designed for easy implementation and maintenance while providing valuable visitor insights.
