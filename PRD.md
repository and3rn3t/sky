# Planning Guide

A personalized celestial event discovery platform that reveals what's happening in the night sky above you right now and in the coming days, bringing astronomy to life with location-aware recommendations and educational context.

**Experience Qualities**:
1. **Wonder-filled** - The interface should evoke the awe of stargazing, making users feel connected to the vastness of space through rich visuals and engaging content.
2. **Approachable** - Complex astronomical concepts presented in digestible, educational formats that welcome both beginners and enthusiasts.
3. **Timely** - Information feels urgent and relevant, emphasizing "tonight" and "soon" to inspire immediate action.

**Complexity Level**: Light Application (multiple features with basic state)
This app combines real-time location data, API integration for celestial events, and educational content presentation with state management for user location preferences and event tracking.

## Essential Features

### Location Detection & Management
- **Functionality**: Automatically detects user's geographic coordinates via browser geolocation API, with manual override option
- **Purpose**: Provides accurate, location-specific celestial event data
- **Trigger**: On first app load or when user clicks location settings
- **Progression**: App loads → Request location permission → Capture lat/lng → Store in KV → Display events for location
- **Success criteria**: Location accurately captured and displayed; events reflect local visibility conditions

### Tonight's Sky Overview
- **Functionality**: Displays celestial events visible tonight at user's location with visibility scores and timing
- **Purpose**: Answers "What should I look for in the sky tonight?"
- **Trigger**: Automatic on app load with valid location
- **Progression**: Location detected → Fetch current day events → Calculate visibility windows → Display prioritized list with best viewing times
- **Success criteria**: Events shown are actually visible from user's location tonight with accurate timing

### Upcoming Events Calendar
- **Functionality**: Shows significant celestial events in the next 7-30 days with countdowns
- **Purpose**: Helps users plan ahead for major astronomical phenomena
- **Trigger**: Automatic on app load; refreshable
- **Progression**: Fetch upcoming events → Filter by location visibility → Sort by significance and proximity → Display with dates and descriptions
- **Success criteria**: Events are chronologically ordered, properly dated, and include preparation tips

### Event Detail & Education
- **Functionality**: Detailed view for each celestial event with explanation, science, viewing tips, and optimal conditions
- **Purpose**: Educates users about what they're seeing and how to best observe it
- **Trigger**: User clicks on any event card
- **Progression**: Click event → Open detail modal/view → Display comprehensive info (what, when, where, how, why) → Show educational content
- **Success criteria**: Information is accurate, educational, and actionable with clear viewing guidance

### Real-time Event Status
- **Functionality**: Live indicators showing if events are currently visible or when they'll be visible next
- **Purpose**: Creates urgency and helps users know the optimal viewing window
- **Trigger**: Automatic updates based on current time and location
- **Progression**: Compare current time to event windows → Calculate "visible now" vs "visible in X hours" → Update UI indicators
- **Success criteria**: Status accurately reflects real-time visibility with helpful countdowns

### Light Pollution Map & Viewing Spots
- **Functionality**: Interactive map showing nearby locations with light pollution levels and recommended stargazing spots
- **Purpose**: Helps users find the best locations for viewing celestial events with minimal light interference
- **Trigger**: User clicks "Find Best Viewing Spots" button
- **Progression**: Location detected → Generate nearby viewing spots → Display interactive map with Bortle scale ratings → Show spot details with directions
- **Success criteria**: Map displays accurate light pollution zones, spots are realistically located nearby with useful information and navigation

## Edge Case Handling

- **Location Permission Denied**: Show manual location entry option with city search or lat/lng input
- **No Events Tonight**: Display encouraging message with next upcoming event and general stargazing tips
- **Poor Viewing Conditions**: Show weather/light pollution warnings when relevant
- **API Unavailable**: Graceful fallback with cached data or educational content about general celestial phenomena
- **Southern Hemisphere Users**: Ensure event data and descriptions work correctly for all latitudes
- **Urban Light Pollution**: Adjust recommendations based on typical urban viewing limitations; suggest darker viewing spots
- **No Viewing Spots Found**: Show fallback suggestions or general advice about finding dark sky locations

## Design Direction

The design should evoke the feeling of standing under a vast night sky - deep, mysterious, and filled with points of light. It should balance scientific credibility with accessible wonder, using cosmic imagery and gradients that suggest depth and space while maintaining excellent readability for educational content.

## Color Selection

A cosmic palette inspired by the night sky, aurora borealis, and deep space photography.

- **Primary Color**: Deep Space Navy `oklch(0.18 0.05 250)` - Communicates the depth and mystery of the night sky, grounding the interface in astronomical context
- **Secondary Colors**: 
  - Nebula Purple `oklch(0.35 0.15 290)` - For secondary actions and subtle highlights, suggesting cosmic phenomena
  - Midnight Blue `oklch(0.25 0.08 240)` - Card backgrounds that feel like looking into deep space
- **Accent Color**: Aurora Cyan `oklch(0.75 0.15 200)` - Attention-grabbing color for CTAs and "visible now" indicators, reminiscent of celestial phenomena and northern lights
- **Foreground/Background Pairings**:
  - Deep Space Navy (oklch(0.18 0.05 250)): White text (oklch(0.98 0 0)) - Ratio 9.2:1 ✓
  - Midnight Blue (oklch(0.25 0.08 240)): White text (oklch(0.98 0 0)) - Ratio 7.1:1 ✓
  - Aurora Cyan (oklch(0.75 0.15 200)): Deep Space Navy (oklch(0.18 0.05 250)) - Ratio 6.8:1 ✓
  - Background (oklch(0.12 0.03 250)): Light text (oklch(0.92 0.02 250)) - Ratio 13.5:1 ✓

## Font Selection

Typography should feel both scientific and approachable - clean enough for data presentation while having enough character to inspire wonder.

- **Primary Font**: Space Grotesk - A geometric typeface with a technical, space-age feel that balances scientific credibility with approachability
- **Secondary Font**: Inter - For body text and descriptions, ensuring excellent readability for educational content

- **Typographic Hierarchy**:
  - H1 (App Title): Space Grotesk Bold / 32px / tight letter-spacing (-0.02em) / line-height 1.1
  - H2 (Section Headers): Space Grotesk Bold / 24px / tight letter-spacing (-0.01em) / line-height 1.2
  - H3 (Event Names): Space Grotesk SemiBold / 18px / normal letter-spacing / line-height 1.3
  - Body (Descriptions): Inter Regular / 15px / normal letter-spacing / line-height 1.6
  - Small (Metadata): Inter Medium / 13px / normal letter-spacing / line-height 1.4
  - Caption (Times/Details): Inter Regular / 12px / slight letter-spacing (0.01em) / line-height 1.5

## Animations

Animations should evoke the slow, graceful movement of celestial bodies - nothing frantic or jarring. Use subtle fades and gentle floating effects to suggest objects moving through space. Key moments: entrance animations for event cards that fade and slide up like stars appearing at dusk, hover states that gently lift and glow, and smooth transitions when switching between views that feel like panning across the night sky.

## Component Selection

- **Components**:
  - **Card**: Primary container for each celestial event and viewing spot, using gradient backgrounds suggesting depth
  - **Dialog**: For detailed event information, viewing spot details, and educational content
  - **Badge**: For event categories (meteor shower, planet, aurora, etc.), visibility status, and Bortle scale ratings
  - **Tabs**: To switch between "Tonight", "This Week", "This Month" views
  - **Progress**: For countdown timers to upcoming events
  - **ScrollArea**: For long educational content within dialogs
  - **Skeleton**: For loading states while fetching API data
  - **Button**: For refresh, location settings, viewing spots, and "Learn More" actions
  - **Alert**: For location permission requests and viewing condition warnings
  - **Canvas**: For rendering the interactive light pollution map with color-coded zones

- **Customizations**:
  - **Event Cards**: Custom gradient overlays on Cards with glassmorphism effects (backdrop-blur, semi-transparent)
  - **Sky Background**: Custom gradient background using mesh gradients with multiple radial gradients creating a deep space atmosphere
  - **Visibility Indicator**: Custom animated badge showing pulse effect for "visible now" events
  - **Location Header**: Custom component showing coordinates with star icon and edit capability
  - **Light Pollution Map**: Custom canvas-based visualization showing Bortle scale zones with interactive viewing spot markers
  - **Viewing Spot Cards**: Compact cards with ratings, distance, and light pollution information

- **States**:
  - Buttons: Default has subtle glow, hover adds elevation with box-shadow and slight scale, active state dims glow
  - Event Cards: Default has soft border, hover elevates with stronger glow and scale transform, selected/active has bright accent border
  - Badges: "Visible Now" pulses gently, upcoming events have static styling, past events are muted

- **Icon Selection**:
  - Telescope/MagnifyingGlass for search/explore
  - MapPin for location and viewing spots
  - MapTrifold for light pollution map feature
  - Clock for timing information
  - Star for ratings and highlighting special events
  - CalendarBlank for upcoming events
  - Moon/MoonStars for night sky content
  - Sparkle for special/rare events
  - Info for educational content
  - NavigationArrow for directions to viewing spots
  - Path for distance/accessibility indicators

- **Spacing**:
  - Container padding: p-6 on desktop, p-4 on mobile
  - Card gaps: gap-4 for event grids
  - Section spacing: space-y-8 for major sections
  - Inner card spacing: p-5 for card content
  - Button padding: px-6 py-3 for primary, px-4 py-2 for secondary

- **Mobile**:
  - Stack event cards vertically on mobile (grid-cols-1) vs. 2-3 columns on desktop
  - Tabs become full-width on mobile with smaller text
  - Location header condenses to show only city/region, hide exact coordinates
  - Detail dialogs become full-screen sheets on mobile using Drawer component
  - Reduce font sizes: H1 to 24px, H2 to 20px, Body to 14px on mobile
  - Increase touch targets to minimum 44px for all interactive elements
