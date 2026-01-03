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
- **Functionality**: Displays celestial events visible tonight at user's location with visibility scores and timing using NASA API data
- **Purpose**: Answers "What should I look for in the sky tonight?"
- **Trigger**: Automatic on app load with valid location
- **Progression**: Location detected → Fetch NASA DONKI solar events & calculate astronomical events → Calculate visibility windows → Display prioritized list with best viewing times
- **Success criteria**: Events shown are actually visible from user's location tonight with accurate timing based on real astronomical data

### Upcoming Events Calendar
- **Functionality**: Shows significant celestial events in the next 7-30 days with countdowns, including NASA solar events, meteor showers, moon phases, and visible planets
- **Purpose**: Helps users plan ahead for major astronomical phenomena
- **Trigger**: Automatic on app load; refreshable
- **Progression**: Fetch NASA API events & calculate astronomical phenomena → Filter by location visibility → Sort by significance and proximity → Display with dates and descriptions
- **Success criteria**: Events are chronologically ordered, properly dated, include real NASA data, and provide preparation tips

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

### Constellation Guide & Interactive Star Maps
- **Functionality**: Browse visible constellations with interactive star maps showing stars, constellation lines, and deep sky objects
- **Purpose**: Helps users identify and learn about constellations visible from their location
- **Trigger**: User switches to "Constellations" tab
- **Progression**: Show constellations visible this month → User selects constellation → Display interactive star map → Click stars and objects for details → Learn mythology and viewing tips
- **Success criteria**: Star maps are accurate and interactive, clicking reveals detailed information, constellations filtered by hemisphere and season

### Real-time Sky Compass Orientation
- **Functionality**: Uses device magnetometer and orientation sensors to provide real-time compass heading for accurate star finding and sky navigation
- **Purpose**: Helps users orient themselves to find specific celestial objects and constellations by showing which direction they're facing
- **Trigger**: User switches to "Compass" tab or opens compass view within constellation details
- **Progression**: User requests compass access → Device permission granted → Real-time heading displayed → User points device at sky → Compass shows cardinal direction and degree heading → User references constellation directions
- **Success criteria**: Compass accurately reflects device orientation, smoothly updates heading, provides calibration feedback, integrates with constellation finding guides

### Augmented Reality Constellation View
- **Functionality**: Overlays constellation patterns and star positions directly on the device camera feed using real-time device orientation and compass data, with photo capture capability to save AR overlays
- **Purpose**: Allows users to point their device at the sky and instantly identify constellations in their field of view with visual overlays, and capture memorable photos with constellation patterns overlaid
- **Trigger**: User clicks "Launch AR Sky View" button (available when location detected and constellations are visible)
- **Progression**: User launches AR → Request camera permission → Access device orientation & compass → Display live camera feed → Calculate visible constellations based on heading/tilt → Render constellation lines and stars on canvas overlay → User pans device to discover constellations → Tap constellation for details → Click "Capture" to save photo with AR overlays
- **Success criteria**: Camera feed displays smoothly, constellations accurately positioned based on device orientation, smooth overlay rendering, touch interactions reveal constellation information, constellations only shown when in device's field of view, photo capture combines video feed and overlay canvas with timestamp watermark and downloads automatically

## Edge Case Handling

- **Location Permission Denied**: Show manual location entry option with city search or lat/lng input
- **No Events Tonight**: Display encouraging message with next upcoming event and general stargazing tips
- **Poor Viewing Conditions**: Show weather/light pollution warnings when relevant
- **NASA API Unavailable**: Graceful fallback with calculated astronomical events (moon phases, planets, meteor showers) when NASA DONKI API is down
- **Southern Hemisphere Users**: Ensure event data and descriptions work correctly for all latitudes
- **Urban Light Pollution**: Adjust recommendations based on typical urban viewing limitations; suggest darker viewing spots
- **No Viewing Spots Found**: Show fallback suggestions or general advice about finding dark sky locations
- **API Rate Limits**: NASA DEMO_KEY has rate limits; handle gracefully with cached data and retry logic
- **No Visible Constellations**: Show message when no constellations match current month/location filters
- **Star Map Interaction**: Ensure touch targets are large enough on mobile for clicking individual stars and objects
- **Compass Not Supported**: Show helpful message when device doesn't have orientation sensors or is desktop browser
- **Compass Permission Denied**: Provide clear instructions on enabling device orientation in browser settings
- **Compass Calibration**: Display calibration prompt when device motion suggests inaccurate readings
- **Low Compass Accuracy**: Warn users when compass accuracy is low (iOS-specific feature)
- **Camera Permission Denied**: Show helpful message with instructions when AR view cannot access camera
- **AR on Desktop**: Gracefully handle AR requests on desktop browsers without camera, suggest mobile device
- **No Constellations in View**: Display helpful message when user points device at empty sky region in AR
- **AR Performance**: Optimize canvas rendering for smooth 30+ FPS on mobile devices, throttle updates if needed
- **Photo Capture Failure**: Handle canvas capture errors gracefully with toast notification, ensure capture canvas initialized
- **Low Storage**: Browser may block download if device storage full; show appropriate error message

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
  - **Card**: Primary container for each celestial event, viewing spot, and constellation, using gradient backgrounds suggesting depth
  - **Dialog**: For detailed event information, viewing spot details, constellation details, and educational content
  - **Badge**: For event categories (meteor shower, planet, aurora, etc.), visibility status, constellation difficulty, and Bortle scale ratings
  - **Tabs**: To switch between "Tonight", "This Week", "This Month" views and "Events" vs "Constellations" main views
  - **Progress**: For countdown timers to upcoming events
  - **ScrollArea**: For long educational content within dialogs
  - **Skeleton**: For loading states while fetching API data
  - **Button**: For refresh, location settings, viewing spots, and "Learn More" actions
  - **Alert**: For location permission requests and viewing condition warnings
  - **Canvas**: For rendering the interactive light pollution map with color-coded zones and interactive star maps with constellation patterns
  - **Video**: For displaying live camera feed in AR view with full-screen coverage

- **Customizations**:
  - **Event Cards**: Custom gradient overlays on Cards with glassmorphism effects (backdrop-blur, semi-transparent)
  - **Sky Background**: Custom gradient background using mesh gradients with multiple radial gradients creating a deep space atmosphere
  - **Visibility Indicator**: Custom animated badge showing pulse effect for "visible now" events
  - **Location Header**: Custom component showing coordinates with star icon and edit capability
  - **Light Pollution Map**: Custom canvas-based visualization showing Bortle scale zones with interactive viewing spot markers
  - **Viewing Spot Cards**: Compact cards with ratings, distance, and light pollution information
  - **Star Map**: Interactive canvas-based constellation visualization with clickable stars, constellation lines, and deep sky objects
  - **Constellation Cards**: Cards showing difficulty, hemisphere, and best viewing months
  - **Compass**: Custom animated compass rose with real-time heading display, cardinal directions, smooth rotation animations, and calibration indicators
  - **AR View**: Full-screen camera feed with transparent canvas overlay for constellation rendering, heads-up display with orientation info, interactive constellation selection by tapping overlays, real-time position tracking with smooth animations, photo capture button with success animation
  - **Photo Capture Overlay**: Animated preview flash and success badge when photo captured, watermark with app branding and timestamp on saved images

- **States**:
  - Buttons: Default has subtle glow, hover adds elevation with box-shadow and slight scale, active state dims glow
  - Event Cards: Default has soft border, hover elevates with stronger glow and scale transform, selected/active has bright accent border
  - Badges: "Visible Now" pulses gently, upcoming events have static styling, past events are muted
  - Compass: Inactive shows static rose with enable button, active shows smooth rotating cardinal directions with spring physics, calibrating displays overlay with rotation animation, low accuracy shows warning badge
  - AR View: Inactive shows camera feed only, active overlays constellation patterns with glow effects, selected constellation highlights with brighter accent color and thicker lines, info panels slide in/out smoothly
  - Capture Button: Default state with camera icon, disabled during capture with loading text, success state briefly shows checkmark, hover state with accent glow and scale
  - Photo Preview: Fades in with scale animation when captured, displays for 3 seconds with success badge, fades out gracefully

- **Icon Selection**:
  - Telescope/MagnifyingGlass for search/explore
  - MapPin for location and viewing spots
  - MapTrifold for light pollution map feature
  - Compass for device orientation and sky navigation
  - Clock for timing information
  - Star for ratings, highlighting special events, and constellations
  - CalendarBlank for upcoming events
  - Moon/MoonStars for night sky content
  - Sparkle for special/rare events and deep sky objects
  - Info for educational content
  - NavigationArrow for directions to viewing spots
  - Path for distance/accessibility indicators
  - Eye for visibility and observation
  - Binoculars for telescope/equipment requirements
  - Book for mythology and educational content
  - Warning for calibration alerts and accuracy warnings
  - Camera for AR view activation and photo capture button
  - Download for successful photo save confirmation
  - Images for photo gallery or capture preview
  - Crosshair/Target for AR reticle and constellation targeting
  - Circle for AR center point and field of view indicator

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
  - AR view optimized for mobile devices with portrait/landscape support
  - AR constellation overlays scale appropriately for different screen sizes
  - AR info panels positioned to avoid obstructing camera view on small screens
