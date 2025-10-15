
# Architecture Document: Real-Time Exhibition Feedback System

**Version:** 2.0

**Date:** 14 October 2025

**Purpose:** To provide a complete technical and implementation blueprint for a cost-free, real-time feedback and dashboard system for the physical art model exhibition

---

## Summary

This document defines a simple, serverless feedback loop using Google Forms (data capture), Google Sheets (storage), and Google Looker Studio (visualization). Visitors scan a QR code at each exhibit, submit quick ratings and optional comments, and organizers view near real-time results on a dashboard. The solution prioritizes zero cost, simplicity, and minimal maintenance.


## 1. Solution Definition

### 1.1. Problem Statement

The exhibition organizers require a modern, efficient, and data-driven method to gauge visitor satisfaction with each art model exhibit. Traditional methods like paper forms are inefficient, difficult to aggregate, and do not provide the real-time insights needed to address potential issues or identify standout successes during the event.

### 1.2. Proposed Solution

A fully digital, serverless feedback loop will be established. Visitors will use their smartphones to scan a QR code at each exhibit, which directs them to a simple, mobile-friendly rating form. Submissions are instantly stored and then visualized on a live, visually appealing dashboard accessible to organizers on any web-enabled device (laptop, tablet, large screen).

### 1.3. Key Features & Capabilities

- **Effortless Visitor Input:** QR code-based access to a clean, simple rating form.
- **Categorical Rating:** Visitors can rate exhibits across five predefined categories on a 1-5 scale.
- **Qualitative Feedback:** An optional text field allows visitors to provide specific comments or suggestions.
- **Centralized Data Aggregation:** All responses are automatically collected and structured in a single data source.
- **Live Dashboard Visualization:** A self-refreshing dashboard presents key metrics, charts, and trends in near real-time.
- **Drill-Down Analysis:** Organizers can filter the entire dashboard to view data for a specific model.

### 1.4. Guiding Principles & Constraints

- **Zero Cost:** The entire solution must be built and operated using free-tier services and tools. No subscriptions or hidden fees.
- **Serverless & Zero Maintenance:** The architecture must not require any server management, software updates, or database administration from the organizers.
- **Simplicity & Usability:** Both the visitor-facing form and the organizer-facing dashboard must be intuitive and require no technical training.
- **Near Real-Time:** The delay between a visitor submitting a rating and it being reflected on the dashboard should be minimal (under 15 minutes).

---

## 2. System Architecture (High-Level Design)

### 2.1. Chosen Technology Stack (3rd Party Tools)

| Component | Technology | Justification |
| :--- | :--- | :--- |
| **Data Collection (Frontend)** | **Google Forms** | **Cost-Free & Reliable:** A robust, free tool for creating intuitive forms. It is mobile-responsive by default and requires no coding. |
| **Data Storage (Database)** | **Google Sheets** | **Native Integration & Simplicity:** Acts as a free, powerful, serverless database. It connects natively to Google Forms, with each submission instantly populating a new row. |
| **Data Visualization (BI Tool)**| **Google Looker Studio** | **Powerful & Visually Appealing:** A free, enterprise-grade business intelligence tool for creating beautiful, interactive, and auto-refreshing dashboards. Its native Google Sheets connector is ideal for this use case. |
| **Visitor Access Point** | **QR Codes** | **Ubiquitous & Frictionless:** The standard for bridging the physical and digital worlds. Free generators are widely available, and all modern smartphones have built-in scanners. |

### 2.2. Architectural Diagram & Data Flow

The architecture is a linear, event-driven data pipeline.

```text
+------------------+     +-----------------+     +------------------+     +-----------------------+     +------------------------+
| Visitor's        |     |   Google Form   |     |   Google Sheet   |     | Google Looker Studio  |     | Organizer's Device     |
| Smartphone       |====>| (Data Entry UI) |====>|  (Database)      |====>| (BI & Visualization)  |====>| (Laptop/Tablet/Screen) |
+------------------+     +-----------------+     +------------------+     +-----------------------+     +------------------------+
(Scans QR Code)         (Submits Rating)       (Instant Row Entry)       (Data Fetched & Cached)         (Views Live Dashboard)
```

### 2.3. Data Flow Narrative

1. **Initiation:** The visitor, after experiencing an exhibit, scans a physical QR code with their smartphone.
2. **Data Collection:** The QR code resolves to a unique URL for a Google Form. The visitor fills out the rating categories and optional comments on the mobile-friendly web form and clicks "Submit."
3. **Data Persistence:** The submission is instantly and automatically sent from Google Forms to a linked Google Sheet. A new row is appended to the sheet containing the submission data and a timestamp. This step is instantaneous.
4. **Data Visualization:** Google Looker Studio is configured to use the Google Sheet as its data source. On a set schedule (minimum every 15 minutes), Looker Studio re-fetches the data from the sheet, updates its internal cache, and refreshes all visual components on the dashboard.
5. **Monitoring:** Organizers view the Looker Studio dashboard via its shareable URL. The dashboard automatically reflects the latest data after each refresh cycle, providing a near real-time view of visitor feedback.

---

## 3. Low-Level Design (LLD)

### 3.1. Google Form Specification

- **Title:** Exhibition Model Feedback

- **Description:** "Thank you for visiting! Your valuable feedback helps us improve. Please rate the exhibit you just experienced."

- **Fields:**

| # | Question Title | Question Type | Options/Details | Required? |
| :- | :--- | :--- | :--- | :--- |
| 1 | **Which model are you rating?** | Dropdown | List of all official model names. (e.g., "Model of the Kaaba", "Prophet's Mosque in Medina", etc.) | Yes |
| 2 | **Model Craftsmanship & Detail** | Linear Scale | 1 to 5. Label 1: `Needs Improvement`, Label 5: `Excellent`. | Yes |
| 3 | **Historical Accuracy & Context**| Linear Scale | 1 to 5. Label 1: `Needs Improvement`, Label 5: `Excellent`. | Yes |
| 4 | **Volunteer's Explanation** | Linear Scale | 1 to 5. Label 1: `Needs Improvement`, Label 5: `Excellent`. | Yes |
| 5 | **Visitor Engagement & Impact** | Linear Scale | 1 to 5. Label 1: `Needs Improvement`, Label 5: `Excellent`. | Yes |
| 6 | **Overall Stall Experience** | Linear Scale | 1 to 5. Label 1: `Poor`, Label 5: `Outstanding`. | Yes |
| 7 | **Any additional comments?** | Paragraph | Long answer text field. | No |

### 3.2. Google Sheets Data Schema

The linked Google Sheet will automatically have the following schema:

| Column Header | Data Type | Description |
| :--- | :--- | :--- |
| `Timestamp` | Datetime | The exact date and time the form was submitted. |
| `Which model are you rating?`| String | The name of the exhibit selected from the dropdown. |
| `Model Craftsmanship & Detail`| Number (1-5) | The numerical rating for the first category. |
| `Historical Accuracy & Context`| Number (1-5) | The numerical rating for the second category. |
| `Volunteer's Explanation` | Number (1-5) | The numerical rating for the third category. |
| `Visitor Engagement & Impact` | Number (1-5) | The numerical rating for the fourth category. |
| `Overall Stall Experience` | Number (1-5) | The numerical rating for the fifth category. |
| `Any additional comments?` | String | The visitor's optional text feedback. |

### 3.3. Google Looker Studio Dashboard Specification

- **Theme:** Dark theme for visual appeal and better contrast on screens.

- **Data Freshness:** Set to refresh every 15 minutes (the most frequent free option).

- **Layout:** A 3-section layout (Header KPIs, Main Body, Right Sidebar).

#### Dashboard Components

| Section | Component Type | Metric / Dimension | Description & Visual Goal |
| :--- | :--- | :--- | :--- |
| **Header** | **Scorecard** | `Overall Stall Experience` (Average) | A large, prominent number showing the overall event average score. |
| **Header** | **Scorecard** | `Record Count` | A smaller scorecard showing the total number of ratings received. |
| **Header** | **Date Range Filter** | `Timestamp` | Allows organizers to filter the dashboard for a specific day or time range. |
| **Right Sidebar**| **Filter Control** | `Which model are you rating?` | A dropdown filter that allows the user to select one or more models, filtering the entire dashboard. **This is the key interactive element.** |
| **Main Body (Top)**| **Bar Chart** | Dim: `Model Name`, Metric: Avg(`Overall Stall Experience`) | A horizontal bar chart ranking the models from highest to lowest average score. Provides a quick "at-a-glance" performance comparison. Sorted descending. |
| **Main Body (Bottom-Left)**| **Gauge Charts (x5)** | Avg(`Category Score`) | Five separate gauge charts, one for each rating category. Provides a visually appealing way to see the performance of each specific aspect of the exhibits. |
| **Main Body (Bottom-Right)**| **Table** | Dim: `Model Name`, `Comments` | A scrollable table showing the qualitative feedback. Filtered by the sidebar selection. |

---

## 4. Implementation & Deployment Plan

### Phase 1: Setup (1-2 Hours)

1. **Create Google Form:** Create the form as specified in LLD 3.1.
2. **Link to Google Sheet:** In the "Responses" tab of the form, link it to a new Google Sheet.
3. **Submit Test Data:** Submit 5-10 fake responses for all models to populate the sheet with data. This is crucial for building the dashboard.
4. **Create Looker Studio Dashboard:**
    - Go to [lookerstudio.google.com](https://lookerstudio.google.com).
    - Create a new report and connect it to the Google Sheet from the previous step.
    - Build the dashboard by adding the charts, scorecards, and filters as specified in LLD 3.3.
    - Set data freshness to 15 minutes (**Resource > Manage added data sources > Edit > Data freshness**).
5. **Generate QR Code:** Copy the public share link from the Google Form and use a free online tool (like QR Code Monkey) to generate a high-resolution QR code.

### Phase 2: Pre-Exhibition

1. **Print Materials:** Print the QR code on small posters or cards with a clear call-to-action: "Scan to Rate This Exhibit!"
2. **Placement:** Place one printed QR code at each exhibit stall in a visible, easily accessible location.
3. **Final Test:** Conduct an end-to-end test by scanning the printed QR code, submitting a form, and verifying the data appears on the dashboard after the refresh interval.
4. **Brief Volunteers:** Instruct the volunteers at each stall to politely encourage visitors to provide feedback using the QR code after their presentation.

### Phase 3: During Exhibition

1. **Display Dashboard:** Dedicate a screen (laptop, TV) in the organizers' room to display the Looker Studio dashboard in full-screen mode.
2. **Monitor Feedback:** Periodically check the dashboard for trends, low-scoring areas that might need attention, and positive written comments that can be shared with volunteers to boost morale.

### Phase 4: Post-Exhibition

1. **Data Export:** The raw data in Google Sheets can be easily exported as a CSV or Excel file for further analysis or archiving.
2. **Final Report:** The Looker Studio dashboard can be exported as a PDF to be included in a final event report, summarizing the visitor feedback.


