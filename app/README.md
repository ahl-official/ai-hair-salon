# 💇 AI Hair Salon - Professional Hairstyle Recommendation System

An AI-powered web application that analyzes customer faces and generates personalized hairstyle recommendations while preserving their identity.

## 🎯 Features

- **Identity-Preserving AI**: Keeps the customer's face identical, changes only the hairstyle
- **Face Analysis**: AI analyzes face shape, features, and skin tone
- **Professional Recommendations**: Generates hairstyles based on professional styling principles
- **Detailed Reports**: Provides analysis explaining why the hairstyle works
- **Downloadable Results**: Download just the image or a complete HTML report
- **Blue Salon Branding**: Professional color scheme throughout

## 📁 Project Structure

```
app/
├── index.html          # Main HTML structure
├── styles.css          # Styling with blue salon theme
├── app.js              # JavaScript logic and API integration
└── README.md           # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.x (for local server)
- OpenRouter API key
- Modern web browser

### Running Locally

1. **Navigate to the app directory**:
   ```bash
   cd app
   ```

2. **Start the local server**:
   ```bash
   python -m http.server 8001
   ```

3. **Open in browser**:
   ```
   http://localhost:8001
   ```

## 🔧 Configuration

### API Settings

Edit `app.js` (lines 2-7) to configure:

```javascript
const CONFIG = {
    API_KEY: 'your-openrouter-api-key',
    API_URL: 'https://openrouter.ai/api/v1/chat/completions',
    MODEL: 'google/gemini-3-pro-image-preview',
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp']
};
```

### Color Customization

Edit `styles.css` (lines 8-18) to change salon colors:

```css
:root {
    --primary-gradient: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
    --secondary-gradient: linear-gradient(135deg, #60A5FA 0%, #2563EB 100%);
    /* ... more colors ... */
}
```

### AI Prompt Customization

Edit `app.js` (lines 10-40) to modify the AI behavior:

```javascript
const HAIR_SALON_PROMPT = `Your custom instructions...`;
```

## 📝 Code Overview

### HTML Structure (`index.html`)

- **Header**: Logo and title
- **Upload Section**: Photo upload interface
- **Preview Section**: Shows uploaded photo with generate button
- **Loading Section**: AI processing animation
- **Results Section**: Before/after comparison + AI analysis
- **Error Section**: Error handling display

### CSS Styling (`styles.css`)

- **Color Variables**: Easy theme customization
- **Glassmorphism Effects**: Modern card designs
- **Animations**: Smooth transitions and loading states
- **Responsive Design**: Works on all devices
- **Analysis Report Styling**: Professional formatted sections

### JavaScript Logic (`app.js`)

Key functions:

- `handleFile()`: Validates and processes uploaded images
- `handleTransform()`: Sends request to AI and handles response
- `displayAnalysis()`: Formats and displays AI analysis
- `downloadImage()`: Downloads just the hairstyle image
- `downloadFullReport()`: Creates and downloads HTML report

## 🤖 AI Integration

### Model Used
- **Google Gemini 3 Pro Image Preview** (Nano Banana Pro)
- Advanced identity preservation capabilities
- High-fidelity image generation

### API Flow

1. User uploads photo → Converted to base64
2. Photo + prompt sent to OpenRouter API
3. AI analyzes face and generates hairstyle
4. Response includes:
   - Generated image (base64)
   - Text analysis explaining the recommendation

### Identity Preservation

The AI prompt includes strict rules to:
- Keep face, eyes, nose, mouth identical
- Preserve facial structure 100%
- Maintain age and characteristics
- Change ONLY the hair

## 📊 Features Breakdown

### 1. Image Upload
- Drag-and-drop support
- File type validation (JPG, PNG, WebP)
- Size limit: 5MB
- Instant preview

### 2. AI Generation
- Face shape analysis
- Feature assessment
- Professional hairstyle recommendation
- 10-30 second processing time

### 3. Results Display
- Full before/after images (no cropping)
- Side-by-side comparison
- Formatted AI analysis report
- Professional presentation

### 4. Download Options

**Option 1: Image Only**
- PNG format
- Just the hairstyle result

**Option 2: Full Report**
- HTML document
- Both images embedded
- Complete analysis text
- Professional formatting
- Print-ready

## 🎨 Customization Guide

### Changing Colors

All colors are defined in CSS variables for easy customization:

```css
/* Primary blue gradient */
--primary-gradient: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);

/* Change to purple */
--primary-gradient: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
```

### Modifying AI Behavior

Edit the `HAIR_SALON_PROMPT` constant in `app.js`:

```javascript
// Add specific style preferences
const HAIR_SALON_PROMPT = `
You are an expert AI hair stylist specializing in [YOUR SPECIALTY].
Focus on [YOUR PREFERENCES]...
`;
```

### Adding New Features

1. **Add HTML elements** in `index.html`
2. **Style them** in `styles.css`
3. **Add logic** in `app.js`
4. **Update event listeners** in `setupEventListeners()`

## 🔒 Security Notes

### Current Setup
- API key is in client-side code
- Suitable for local/internal use
- Images processed via OpenRouter API

### For Production
Consider:
- Backend proxy to hide API key
- Environment variables
- Rate limiting
- User authentication
- HTTPS only

## 💰 Cost Information

### OpenRouter Pricing
- **Model**: Gemini 3 Pro Image Preview
- **Input**: $2/M tokens
- **Output**: $12/M tokens
- **Estimated**: ~$0.10-0.30 per generation

## 🐛 Troubleshooting

### Common Issues

**1. "No endpoints found for model"**
- Check model name in `CONFIG.MODEL`
- Verify model availability on OpenRouter

**2. Images not displaying**
- Check browser console for errors
- Verify API response format
- Check network connection

**3. Cropped images**
- Already fixed in current version
- Images use `object-fit: contain` with `height: auto`

**4. Analysis not showing**
- AI may not always return text
- Fallback message will display
- Check API response in console

## 📚 Code Comments

All code includes inline comments explaining:
- Function purposes
- Complex logic
- API interactions
- State management

## 🔄 Development Workflow

### Making Changes

1. **Edit files** in your code editor
2. **Save changes**
3. **Refresh browser** (Ctrl+F5 for hard refresh)
4. **Test thoroughly**

### Testing Checklist

- [ ] Upload different image types
- [ ] Test with various face shapes
- [ ] Verify analysis displays correctly
- [ ] Test both download options
- [ ] Check responsive design
- [ ] Test error handling

## 📱 Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

## 🤝 Contributing

### Code Style
- Use clear variable names
- Add comments for complex logic
- Follow existing formatting
- Test before committing

### File Organization
- HTML: Structure only
- CSS: All styling
- JS: All logic and interactions

## 📄 License

This is a custom salon application. Modify as needed for your business.

## 🆘 Support

### For Developers
- Check browser console for errors
- Review API documentation: https://openrouter.ai/docs
- Test with sample images first

### For Salon Staff
- Ensure good lighting for photos
- Use front-facing photos
- Allow 10-30 seconds for processing
- Download reports for customer records

## 🎯 Future Enhancements

Potential additions:
- Multiple hairstyle options per session
- Hair color variations
- Save customer history
- Email reports directly
- Mobile app version
- Offline mode

## 📞 Technical Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **AI**: Google Gemini 3 Pro via OpenRouter
- **Styling**: Custom CSS with CSS Variables
- **Fonts**: Inter (Google Fonts)
- **Server**: Python HTTP Server (development)

## 🔗 Resources

- [OpenRouter Documentation](https://openrouter.ai/docs)
- [Gemini Model Info](https://openrouter.ai/google/gemini-3-pro-image-preview)
- [CSS Variables Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

---

**Version**: 1.0  
**Last Updated**: February 2026  
**Status**: Production Ready ✅

For questions or issues, refer to the inline code comments or console logs.
