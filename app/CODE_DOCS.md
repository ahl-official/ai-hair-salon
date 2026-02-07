# 📚 Code Documentation - AI Hair Salon

## Table of Contents
1. [File Structure](#file-structure)
2. [HTML Documentation](#html-documentation)
3. [CSS Documentation](#css-documentation)
4. [JavaScript Documentation](#javascript-documentation)
5. [Customization Guide](#customization-guide)
6. [Common Modifications](#common-modifications)

---

## File Structure

```
c:\Users\HP\Desktop\hair\app\
├── index.html          # Main HTML structure (9.4 KB)
├── styles.css          # All styling and animations (13.6 KB)
├── app.js              # JavaScript logic and API integration (17.7 KB)
├── README.md           # Project documentation
└── CODE_DOCS.md        # This file - detailed code documentation
```

**Total Project Size**: ~40 KB (very lightweight!)

---

## HTML Documentation

### File: `index.html`

#### Structure Overview
```
<!DOCTYPE html>
└── <html>
    ├── <head>
    │   ├── Meta tags
    │   ├── Title
    │   ├── Google Fonts (Inter)
    │   └── styles.css link
    └── <body>
        └── <div class="container">
            ├── <header> - Logo and title
            ├── <main>
            │   ├── Upload Section
            │   ├── Preview Section
            │   ├── Loading Section
            │   ├── Results Section
            │   └── Error Section
            ├── <footer>
            └── <script src="app.js">
```

#### Key Sections

**1. Header Section (Lines 17-23)**
- Logo with SVG scissors icon
- Salon name
- Subtitle

**2. Upload Section (Lines 27-47)**
- File input (hidden)
- Upload button
- Drag-and-drop area
- File format info

**3. Preview Section (Lines 50-67)**
- Image preview container
- Transform button
- Shows after upload

**4. Loading Section (Lines 70-80)**
- Animated loader
- Progress bar
- Loading message

**5. Results Section (Lines 83-167)**
- Before/after comparison grid
- AI analysis report
- Two download buttons
- "Try Another Style" button

**6. Error Section (Lines 170-183)**
- Error icon
- Error message display
- Retry button

#### Important IDs (for JavaScript)
```javascript
// Sections
#uploadSection
#previewSection
#loadingSection
#resultsSection
#errorSection

// Interactive Elements
#imageInput
#uploadBtn
#transformBtn
#downloadImageBtn
#downloadReportBtn
#newTransformBtn

// Display Elements
#previewImage
#beforeImage
#afterImage
#analysisContent
#errorMessage
```

---

## CSS Documentation

### File: `styles.css`

#### CSS Variables (Lines 8-24)
```css
:root {
    /* Colors - Blue Salon Theme */
    --primary-gradient: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
    --secondary-gradient: linear-gradient(135deg, #60A5FA 0%, #2563EB 100%);
    --success-gradient: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%);
    
    /* Background Colors */
    --bg-dark: #0a0e1a;
    --bg-card: rgba(59, 130, 246, 0.05);
    --bg-card-hover: rgba(59, 130, 246, 0.1);
    
    /* Text Colors */
    --text-primary: #ffffff;
    --text-secondary: #94a3b8;
    
    /* Borders & Shadows */
    --border-color: rgba(59, 130, 246, 0.15);
    --shadow-sm: 0 4px 6px rgba(0, 0, 0, 0.1);
    --shadow-md: 0 10px 25px rgba(0, 0, 0, 0.2);
    --shadow-lg: 0 20px 40px rgba(0, 0, 0, 0.3);
    --shadow-glow: 0 0 30px rgba(59, 130, 246, 0.3);
    
    /* Typography */
    --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    
    /* Transitions */
    --transition-fast: 0.2s ease;
    --transition-normal: 0.3s ease;
    --transition-slow: 0.5s ease;
}
```

#### Key Style Sections

**1. Global Styles (Lines 1-40)**
- Reset and box-sizing
- Body background with animated gradients
- Font settings

**2. Container & Layout (Lines 41-60)**
- Max-width: 1200px
- Centered layout
- Padding and spacing

**3. Header Styles (Lines 61-110)**
- Logo with floating animation
- Title gradients
- Responsive sizing

**4. Card Styles (Lines 111-180)**
- Glassmorphism effect
- Border and shadows
- Hover states

**5. Button Styles (Lines 181-260)**
- Primary button (blue gradient)
- Secondary button (light blue)
- Hover and active states
- Icon spacing

**6. Image Display (Lines 300-335)**
```css
.image-container,
.image-wrapper {
    width: 100%;
    min-height: 300px;
    max-height: none;          /* No cropping! */
    overflow: visible;          /* Show full image */
    padding: 1rem;
}

.image-container img,
.image-wrapper img {
    width: 100%;
    height: auto;              /* Maintain aspect ratio */
    object-fit: contain;       /* No cropping */
    border-radius: 12px;
}
```

**7. Analysis Report Styles (Lines 500-580)**
- Formatted sections
- Blue accent colors
- Checkmark bullets
- Responsive layout

**8. Animations (Lines 600-650)**
```css
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}
```

**9. Responsive Design (Lines 651-700)**
- Tablet breakpoint: 768px
- Mobile breakpoint: 480px
- Adjusted font sizes
- Stacked layouts

---

## JavaScript Documentation

### File: `app.js`

#### Configuration (Lines 1-8)
```javascript
const CONFIG = {
    API_KEY: 'sk-or-v1-...',           // OpenRouter API key
    API_URL: 'https://openrouter.ai/api/v1/chat/completions',
    MODEL: 'google/gemini-3-pro-image-preview',
    MAX_FILE_SIZE: 5 * 1024 * 1024,    // 5MB limit
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp']
};
```

#### AI Prompt (Lines 10-40)
The prompt is carefully engineered to:
1. **Preserve Identity**: Strict rules to keep face identical
2. **Analyze Face**: Face shape, features, skin tone
3. **Generate Hairstyle**: Professional recommendations
4. **Provide Analysis**: Detailed explanation text

#### State Management (Lines 42-48)
```javascript
const state = {
    uploadedImage: null,           // File object
    uploadedImageBase64: null,     // Base64 string for display/API
    transformedImage: null,        // Generated image URL
    analysisText: ''               // AI analysis text
};
```

#### DOM Elements (Lines 50-78)
All HTML elements are cached for performance:
- Sections (upload, preview, loading, results, error)
- Buttons (upload, transform, download, retry)
- Images (preview, before, after)
- Content areas (analysis, error message)

#### Key Functions

**1. `init()` - Lines 80-84**
```javascript
// Called when DOM is ready
// Sets up all event listeners
function init() {
    setupEventListeners();
    console.log('💇 AI Hair Salon initialized');
}
```

**2. `setupEventListeners()` - Lines 86-111**
```javascript
// Attaches all event handlers
// - Upload button click
// - File input change
// - Drag and drop events
// - Transform button
// - Download buttons
// - Error retry
```

**3. `handleFile(file)` - Lines 144-178**
```javascript
// Validates and processes uploaded image
// Steps:
// 1. Check file type (JPG, PNG, WebP)
// 2. Check file size (< 5MB)
// 3. Read file as base64
// 4. Store in state
// 5. Show preview section
```

**4. `handleTransform()` - Lines 180-261**
```javascript
// Main AI generation function
// Steps:
// 1. Show loading screen
// 2. Prepare API payload with image + prompt
// 3. Send POST request to OpenRouter
// 4. Extract image and analysis from response
// 5. Store in state
// 6. Show results
// 7. Handle errors
```

**API Payload Structure:**
```javascript
{
    model: "google/gemini-3-pro-image-preview",
    messages: [{
        role: "user",
        content: [
            { type: "text", text: HAIR_SALON_PROMPT },
            { type: "image_url", image_url: { url: base64Image } }
        ]
    }],
    modalities: ["image", "text"]
}
```

**5. `displayAnalysis(analysisText)` - Lines 277-289**
```javascript
// Formats and displays AI analysis
// - Checks if analysis exists
// - Calls formatAnalysisText()
// - Injects HTML into page
```

**6. `formatAnalysisText(text)` - Lines 291-327**
```javascript
// Converts plain text to formatted HTML
// Handles:
// - Headings (Face Shape Analysis:)
// - Sections with titles
// - Bullet lists (- or •)
// - Paragraphs
// Returns formatted HTML string
```

**7. `downloadImage()` - Lines 329-342**
```javascript
// Downloads just the hairstyle image
// - Creates temporary <a> element
// - Sets href to image URL
// - Triggers download
// - Cleans up element
```

**8. `downloadFullReport()` - Lines 344-488**
```javascript
// Creates and downloads complete HTML report
// Includes:
// - Professional header with salon branding
// - Both images (embedded as base64)
// - Complete AI analysis
// - Footer with disclaimer
// - Print-friendly CSS
// - Responsive layout
```

**Report HTML Structure:**
```html
<!DOCTYPE html>
<html>
  <head>
    <style>/* Embedded CSS */</style>
  </head>
  <body>
    <div class="container">
      <div class="header">Title + Date</div>
      <div class="comparison">Before + After Images</div>
      <div class="analysis">AI Analysis</div>
      <div class="footer">Branding</div>
    </div>
  </body>
</html>
```

**9. `resetApp()` - Lines 490-506**
```javascript
// Resets application to initial state
// - Clears all state variables
// - Resets file input
// - Shows upload section
```

**10. Helper Functions**
```javascript
showSection(section)    // Removes 'hidden' class, scrolls into view
hideSection(section)    // Adds 'hidden' class
showError(message)      // Displays error section with message
```

#### Initialization (Lines 532-537)
```javascript
// Waits for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init(); // DOM already loaded
}
```

#### Debug Exports (Lines 539-541)
```javascript
// Expose state and config for debugging in console
window.appState = state;
window.appConfig = CONFIG;

// Usage in browser console:
// console.log(window.appState);
// console.log(window.appConfig);
```

---

## Customization Guide

### Changing Salon Colors

**Option 1: Quick Color Swap**
Edit `styles.css` lines 8-18:
```css
/* Change from blue to purple */
--primary-gradient: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
--secondary-gradient: linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%);

/* Change from blue to green */
--primary-gradient: linear-gradient(135deg, #10B981 0%, #047857 100%);
--secondary-gradient: linear-gradient(135deg, #34D399 0%, #059669 100%);

/* Change from blue to pink */
--primary-gradient: linear-gradient(135deg, #EC4899 0%, #BE185D 100%);
--secondary-gradient: linear-gradient(135deg, #F472B6 0%, #DB2777 100%);
```

**Option 2: Complete Rebrand**
1. Update all color variables
2. Change logo SVG colors
3. Update background gradients
4. Modify button colors

### Modifying AI Behavior

**Make hairstyles more conservative:**
```javascript
const HAIR_SALON_PROMPT = `...
GENERATE:
A photorealistic image with a SUBTLE, CONSERVATIVE hairstyle that:
- Makes minimal changes
- Keeps similar length
- Uses natural colors only
...`;
```

**Focus on specific styles:**
```javascript
const HAIR_SALON_PROMPT = `...
GENERATE:
A photorealistic image with a MODERN BOB HAIRCUT that:
- Is shoulder-length or shorter
- Has clean lines
- Suits professional environments
...`;
```

**Add age-appropriate styling:**
```javascript
const HAIR_SALON_PROMPT = `...
Consider the person's age and recommend:
- Youthful styles for younger clients
- Sophisticated styles for mature clients
- Age-appropriate colors and lengths
...`;
```

### Adding New Features

**Example: Add a "Save to Gallery" feature**

1. **Update HTML** - Add button:
```html
<button class="save-btn" id="saveBtn">
    Save to Gallery
</button>
```

2. **Update CSS** - Style button:
```css
.save-btn {
    background: var(--success-gradient);
    /* ... other styles ... */
}
```

3. **Update JavaScript** - Add functionality:
```javascript
// In setupEventListeners()
elements.saveBtn = document.getElementById('saveBtn');
elements.saveBtn.addEventListener('click', saveToGallery);

// New function
function saveToGallery() {
    // Get saved items from localStorage
    let gallery = JSON.parse(localStorage.getItem('hairGallery') || '[]');
    
    // Add new item
    gallery.push({
        before: state.uploadedImageBase64,
        after: state.transformedImage,
        analysis: state.analysisText,
        date: new Date().toISOString()
    });
    
    // Save back to localStorage
    localStorage.setItem('hairGallery', JSON.stringify(gallery));
    
    alert('Saved to gallery!');
}
```

---

## Common Modifications

### 1. Change Maximum File Size

**File**: `app.js` line 6
```javascript
// Current: 5MB
MAX_FILE_SIZE: 5 * 1024 * 1024,

// Change to 10MB
MAX_FILE_SIZE: 10 * 1024 * 1024,

// Change to 2MB
MAX_FILE_SIZE: 2 * 1024 * 1024,
```

### 2. Add More File Types

**File**: `app.js` line 7
```javascript
// Current
ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp']

// Add GIF support
ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// Add BMP support
ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/bmp']
```

### 3. Change Loading Messages

**File**: `index.html` lines 73-75
```html
<!-- Current -->
<h2>Analyzing Your Face</h2>
<p>AI is finding the perfect hairstyle for you...</p>

<!-- Make it more exciting -->
<h2>Creating Your Perfect Look!</h2>
<p>Our AI stylist is working its magic...</p>

<!-- Make it more professional -->
<h2>Professional Analysis in Progress</h2>
<p>Analyzing facial features and generating recommendations...</p>
```

### 4. Customize Report Filename

**File**: `app.js` line 481
```javascript
// Current
link.download = `hair-salon-report-${Date.now()}.html`;

// Add customer name (if you collect it)
link.download = `${customerName}-hairstyle-${Date.now()}.html`;

// Add date in readable format
const date = new Date().toISOString().split('T')[0];
link.download = `hairstyle-report-${date}.html`;

// Use salon name
link.download = `YourSalon-Consultation-${Date.now()}.html`;
```

### 5. Change Font

**File**: `index.html` line 10
```html
<!-- Current: Inter -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap">

<!-- Change to Poppins -->
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap">

<!-- Change to Montserrat -->
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap">
```

**Then update CSS** line 23:
```css
/* Current */
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Change to match new font */
--font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### 6. Add Loading Time Estimate

**File**: `index.html` line 75
```html
<p>AI is finding the perfect hairstyle for you... This may take 10-30 seconds</p>
```

### 7. Customize Error Messages

**File**: `app.js` lines 148, 154, 174, etc.
```javascript
// Current
showError('Please upload a valid image file (JPG, PNG, or WebP)');

// More friendly
showError('Oops! We can only work with JPG, PNG, or WebP images. Please try another file!');

// More professional
showError('Invalid file format. Supported formats: JPEG, PNG, WebP');
```

---

## Code Quality Notes

### Best Practices Used

✅ **Separation of Concerns**
- HTML: Structure only
- CSS: All styling
- JS: All logic

✅ **DRY Principle**
- Reusable functions
- CSS variables for colors
- Centralized configuration

✅ **Clear Naming**
- Descriptive variable names
- Consistent naming conventions
- Semantic HTML

✅ **Error Handling**
- Try-catch blocks
- User-friendly error messages
- Graceful degradation

✅ **Performance**
- Cached DOM elements
- Efficient selectors
- Minimal reflows

✅ **Maintainability**
- Inline comments
- Logical organization
- Modular functions

---

## Debugging Tips

### Browser Console

**Check application state:**
```javascript
console.log(window.appState);
// Shows: uploadedImage, transformedImage, analysisText
```

**Check configuration:**
```javascript
console.log(window.appConfig);
// Shows: API_KEY, MODEL, file limits
```

**Test file validation:**
```javascript
// In console after upload attempt
console.log('File type:', state.uploadedImage.type);
console.log('File size:', state.uploadedImage.size);
```

### Common Issues

**Images not showing:**
- Check browser console for errors
- Verify image URLs are valid
- Check if API returned images

**API errors:**
- Verify API key is correct
- Check model name spelling
- Ensure internet connection
- Check OpenRouter status

**Styling issues:**
- Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- Check CSS file is loaded
- Inspect element in DevTools

---

**Last Updated**: February 2026  
**Version**: 1.0  
**Maintained by**: Development Team

For questions, check the README.md or inline code comments.
