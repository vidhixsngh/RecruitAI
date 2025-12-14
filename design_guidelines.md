# Recruit AI - Design Guidelines

## Design Approach
**Utility-Focused SaaS Application** - Following modern SaaS design patterns inspired by Linear, Notion, and modern B2B dashboards with emphasis on clarity, efficiency, and empowerment.

## Brand Identity
**Tone**: Agentic, innovative, calm, supportive, empowering
**Core Principle**: Users should feel in control and empowered with this automation tool

## Visual Design System

### Color Strategy
- **Base**: Pure white backgrounds (#FFFFFF)
- **Primary Accent**: Light maroon for CTAs, highlights, and key actions
- **Supporting Tones**: Pastel gray for secondary elements, neutral tones for text hierarchy
- **Status Colors**: Green (passed/approved), Yellow (on-hold), Red (rejected)
- **Glass Effect**: Subtle frosted glass overlays with soft backdrop blur

### Typography
- **Font Family**: Inter (sans-serif, modern rounded UI)
- **Hierarchy**:
  - H1: Large, bold headers for page titles
  - H2: Section headers, medium weight
  - Body: 14px minimum, regular weight
  - Labels: 12-13px, medium weight
- **Alignment**: Left-aligned text, right-aligned primary CTAs

### Component Design
- **Cards**: Rounded corners (8-12px radius), gentle shadows (subtle elevation)
- **Buttons**: Rounded rectangles with hover transitions, maroon primary buttons
- **Icons**: Clean, flat, minimal (Lucide or Material Icons)
- **Inputs**: Rounded borders, clear focus states, comfortable padding
- **Modals**: Liquid glass aesthetic with backdrop blur and soft shadows

### Layout System
**Spacing**: Use Tailwind spacing units: 2, 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
**Containers**: Max-width containers (max-w-7xl) with generous whitespace
**Grid**: Responsive grid layouts for card displays (1-2-3 column breakpoints)

## Screen-Specific Guidelines

### Login/Signup Page
- Clean, centered layout with one-click CTA
- Minimal form fields, emphasis on quick access
- Maroon CTA button prominent and inviting
- Supportive microcopy: "Join 1000+ teams automating their hiring"

### Main Dashboard
- **Header**: Company name prominently displayed, navigation to Settings top-right
- **Job Portal**: Card-based layout showing all job openings with JD summaries
- **Cards Include**: Job title, department, number of applicants, "Start Screening" CTA
- **Empty State**: "No job openings yet. Let's add your first one." with add button

### AI Analysis Dashboard
- **Table/Grid View**: Candidate list with columns: Name, Resume Score (visual gauge), Rationale (expandable), Recommended Action (badge)
- **Action Badges**: Color-coded (Green: Call for Interview, Yellow: On-Hold, Red: Reject)
- **Filters**: Quick filters for score ranges and recommendations
- **Sample Data**: Show "3 Passed, 5 On-Hold, 2 Rejected" with visual distribution

### Interview Scheduling Page
- **Dual Interface**: Email preview + WhatsApp message template side-by-side
- **Editable Fields**: Candidate name, date/time picker, customizable message
- **Batch Actions**: Select multiple candidates for bulk scheduling
- **Confirmation**: "Great! Interviews scheduled — kudos to team!"

### Pre-Screen Scheduling
- **HR Call Updates**: Simple form for scheduling HR screening calls
- **Calendar Integration**: Visual date/time selector
- **Template Messages**: Pre-filled supportive templates

### Rejection Email Composer
- **Empathetic Design**: Soft, supportive tone throughout
- **Template Library**: Multiple supportive rejection templates
- **Personalization Fields**: Merge fields for candidate name, role, feedback
- **Batch Send**: Send to multiple candidates with confirmation

### Excel-Like Dashboard
- **Data Table**: Real-time candidate status tracking
- **Columns**: Name, Email, Phone, Application Date, Score, Status, Last Updated
- **Interactive**: Sortable columns, inline editing, status updates
- **Export**: Download as CSV/Excel option

### Settings/Profile
- **Sections**: Company info, User profile, Notification preferences, Integration settings
- **Clean Layout**: Card-based sections with clear labels

## Navigation & Flow

### Navigation Structure
- **Side/Top Nav**: Dashboard, Job Openings, Candidates, Schedule, Settings
- **Back Buttons**: Consistent placement, clear navigation hierarchy
- **Breadcrumbs**: Show current location in multi-step flows

### Transitions
- **Between Screens**: Smooth fade or slide transitions (200-300ms)
- **Modals**: Fade in with backdrop blur
- **Success States**: Celebratory micro-animations (subtle)

## Microcopy & Messaging

### Tone Examples
- **Success**: "Great talent onboarding soon — kudos to team!"
- **Empty State**: "No job openings yet. Let's add your first one."
- **Loading**: "Fetching your data — one sec!"
- **Error**: "Oops, something went wrong. Let's try that again."

### CTA Labels
- "Start Screening" (not "Begin Analysis")
- "Schedule Interviews" (not "Set Up Meetings")
- "Send Updates" (not "Submit")
- "View Details" (not "More Info")

## Accessibility Standards
- **Contrast**: Minimum 4.5:1 for all text
- **Interactive Elements**: Clear focus states with visible outlines
- **Keyboard Navigation**: Full tab navigation support
- **Alt Text**: Descriptive labels for all icons and images
- **Font Size**: Never below 14px

## Images
No hero images required - this is a utility-focused dashboard application. Use:
- **Placeholder Avatars**: For candidate profiles
- **Empty State Illustrations**: Friendly, minimal illustrations for empty states
- **Icons**: Consistent icon set throughout for actions and status indicators

## Key Design Principles
1. **Clarity Over Complexity**: One primary action per screen
2. **Empowerment**: Users feel in control of automation
3. **Supportive Communication**: Human, warm microcopy
4. **Visual Hierarchy**: Clear information architecture with cards and spacing
5. **Liquid Glass Aesthetic**: Modern, professional, subtle depth with blur effects

**End Goal**: HR managers should feel this tool is their empowering copilot, not just another dashboard.