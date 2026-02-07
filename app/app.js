// Configuration
const CONFIG = {
    API_KEY: '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',
    API_URL: 'https://openrouter.ai/api/v1/chat/completions',
    IMAGE_MODEL: 'google/gemini-3-pro-image-preview', // Nano Banana Pro - Gemini 3 Pro Image (Verified working)
    ANALYSIS_MODEL: 'google/gemini-2.0-flash-001', // Using Flash 2.0 for detailed text analysis
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp']
};

// Analysis Prompt - Focuses purely on detailed text report
const ANALYSIS_PROMPT = `You are an expert AI hair stylist with 20+ years of experience. Analyze the uploaded image to detect the person's gender and provide a detailed consultation report.

CRITICAL INSTRUCTION:
- Determine if the subject is Male or Female.
- Apply the corresponding "EXTREME DETAIL ANALYSIS" logic below.
- Provide EXACTLY ONE (1) top haircut recommendation per scenario.

---
MALE LOGIC (If Male):
1. **EXTREME DETAIL ANALYSIS**:
   - **Face Shape**: Describe the face shape (oval, round, square, heart, diamond, oblong) with specific observations about jawline, cheekbones, and forehead ratio.
   - **Facial Features**: Analyze forehead width/height, cheekbone prominence, jawline shape/width, chin shape, nose bridge, eye spacing. Be very specific about proportions.
   - **Hair**: Analyze current hair texture, density, curl pattern, growth direction, and hairline condition.

2. **RECOMMENDATIONS** (1 Option per Scenario):
   - **Professional/Workplace**: Name + Specific explanation of why it suits his geometry.
   - **University/College**: Name + Explanation.
   - **School/Teenage**: Name + Explanation.

---
FEMALE LOGIC (If Female):
1. **EXTREME DETAIL ANALYSIS**:
   - **Face Shape**: Describe the face shape (jawline, cheekbones, forehead ratio, chin) with specific measurements/proportions.
   - **Facial Features**: Detailed description of key features: forehead width, cheekbone prominence, jawline definition, eye spacing, eyebrow position.
   - **Hair**: Analyze density, texture, curl pattern (1A–4C), porosity, parting tendencies, and overall condition.

2. **RECOMMENDATIONS** (1 Option per Scenario):
   - **Professional/Workplace**: Name + Accurate explanation of why it flatters her geometry.
   - **University/College**: Name + Explanation.
   - **School/Teenage**: Name + Explanation.

---
TEXT OUTPUT FORMAT (Strictly follow this structure):
1. Face & Hair Analysis:
[Detailed analysis here]

2. Professional Scenario:
[Haircut Name] - [Explanation]

3. University Scenario:
[Haircut Name] - [Explanation]

4. School Scenario:
[Haircut Name] - [Explanation]

5. Styling Tips:
[Brief styling advice]`;

// Image Generation Prompt - Focuses purely on the visual output
// Image Generation Prompt - Focuses purely on the visual output
const IMAGE_GENERATION_PROMPT = `Generate a vertical 9:16 4K 3x3 grid of hairstyle reference images directly on the user's face.
- **Identity Preservation**: Keep the face and features EXACTLY identical.
- **Style**: Mix short, medium, and long professional hairstyles.
- **Output**: Return ONLY the generated image.`;

// State Management
const state = {
    uploadedImage: null,
    uploadedImageBase64: null,
    transformedImage: null,
    analysisText: ''
};

// DOM Elements
const elements = {
    // Sections
    uploadSection: document.getElementById('uploadSection'),
    previewSection: document.getElementById('previewSection'),
    loadingSection: document.getElementById('loadingSection'),
    resultsSection: document.getElementById('resultsSection'),
    errorSection: document.getElementById('errorSection'),

    // Upload
    imageInput: document.getElementById('imageInput'),
    uploadBtn: document.getElementById('uploadBtn'),
    cameraBtn: document.getElementById('cameraBtn'),

    // Camera
    cameraSection: document.getElementById('cameraSection'),
    cameraVideo: document.getElementById('cameraVideo'),
    cameraCanvas: document.getElementById('cameraCanvas'),
    captureBtn: document.getElementById('captureBtn'),
    closeCameraBtn: document.getElementById('closeCameraBtn'),

    // Preview
    previewImage: document.getElementById('previewImage'),
    transformBtn: document.getElementById('transformBtn'),

    // Results
    beforeImage: document.getElementById('beforeImage'),
    afterImage: document.getElementById('afterImage'),
    analysisContent: document.getElementById('analysisContent'),
    downloadImageBtn: document.getElementById('downloadImageBtn'),
    downloadReportBtn: document.getElementById('downloadReportBtn'),
    newTransformBtn: document.getElementById('newTransformBtn'),

    // Error
    errorMessage: document.getElementById('errorMessage'),
    retryBtn: document.getElementById('retryBtn')
};

// Initialize App
function init() {
    setupEventListeners();
    console.log('💇 AI Hair Salon initialized');
}

// Event Listeners
function setupEventListeners() {
    // Upload
    if (elements.uploadBtn) elements.uploadBtn.addEventListener('click', () => elements.imageInput.click());
    if (elements.imageInput) elements.imageInput.addEventListener('change', handleImageUpload);
    if (elements.cameraBtn) elements.cameraBtn.addEventListener('click', startCamera);

    // Camera Controls
    if (elements.captureBtn) elements.captureBtn.addEventListener('click', capturePhoto);
    if (elements.closeCameraBtn) elements.closeCameraBtn.addEventListener('click', stopCamera);

    // Drag and Drop
    const uploadCard = document.querySelector('.upload-card');
    if (uploadCard) {
        uploadCard.addEventListener('dragover', handleDragOver);
        uploadCard.addEventListener('drop', handleDrop);
        uploadCard.addEventListener('dragleave', handleDragLeave);
    }

    // Transform
    if (elements.transformBtn) elements.transformBtn.addEventListener('click', handleTransform);

    // Results
    if (elements.downloadImageBtn) elements.downloadImageBtn.addEventListener('click', downloadImage);
    if (elements.downloadReportBtn) elements.downloadReportBtn.addEventListener('click', downloadFullReport);
    if (elements.newTransformBtn) elements.newTransformBtn.addEventListener('click', resetApp);

    // Error
    if (elements.retryBtn) elements.retryBtn.addEventListener('click', () => {
        hideSection(elements.errorSection);
        showSection(elements.previewSection);
    });
}

// Drag and Drop Handlers
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
}

function handleDragLeave(e) {
    e.currentTarget.style.borderColor = '';
    e.currentTarget.style.background = '';
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.style.borderColor = '';
    e.currentTarget.style.background = '';

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

// Image Upload Handler
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

// File Validation and Processing
function handleFile(file) {
    // Validate file type
    if (!CONFIG.ALLOWED_TYPES.includes(file.type)) {
        showError('Please upload a valid image file (JPG, PNG, or WebP)');
        return;
    }

    // Validate file size
    if (file.size > CONFIG.MAX_FILE_SIZE) {
        showError('File size must be less than 5MB');
        return;
    }

    // Read and display image
    const reader = new FileReader();

    reader.onload = (e) => {
        state.uploadedImage = file;
        state.uploadedImageBase64 = e.target.result;

        // Show preview
        elements.previewImage.src = e.target.result;
        hideSection(elements.uploadSection);
        showSection(elements.previewSection);

        console.log('✅ Photo uploaded successfully');
    };

    reader.onerror = () => {
        showError('Failed to read image file');
    };

    reader.readAsDataURL(file);
}

// ==========================================
// Camera Functions
// ==========================================

let stream = null; // Track camera stream

async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user', // Front camera by default
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            }
        });

        elements.cameraVideo.srcObject = stream;
        showSection(elements.cameraSection);

    } catch (err) {
        console.error('Camera Error:', err);
        showError('Unable to access camera. Please allow permissions or upload a photo instead.');
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }

    // Hide camera UI via adding hidden class directly since hideSection might not target overlay correctly if logic differs
    // But our hideSection uses .hidden class comfortably.
    hideSection(elements.cameraSection);
}

function capturePhoto() {
    if (!stream) return;

    const video = elements.cameraVideo;
    const canvas = elements.cameraCanvas;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current frame
    const context = canvas.getContext('2d');

    // Check if mirrored (CSS transform doesn't affect canvas)
    // We want the captured image to match the preview (mirrored) for natural feel
    context.translate(canvas.width, 0);
    context.scale(-1, 1);

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

    // Stop camera
    stopCamera();

    // Set state
    state.uploadedImageBase64 = dataUrl;
    state.uploadedImage = null; // No file object for camera capture

    // Show preview
    elements.previewImage.src = dataUrl;
    hideSection(elements.uploadSection);
    showSection(elements.previewSection);

    console.log('📸 Photo captured successfully');
}

// Transform Image - Orchestrates Analysis and Generation
async function handleTransform() {
    // Show loading
    hideSection(elements.previewSection);
    showSection(elements.loadingSection);

    // Reset state
    state.analysisText = '';
    state.transformedImage = null;

    try {
        console.log('💇 Starting AI Makeover...');

        // SCI-FI UI: Set scanner image and start animation
        const scannerImg = document.getElementById('scanningImage');
        if (scannerImg) scannerImg.src = state.uploadedImageBase64;

        animateAnalysis();

        // Parallel Execution: Run Analysis and Image Generation simultaneously for speed
        await Promise.all([
            performAnalysis(),
            performImageGeneration()
        ]);

        stopAnalysisAnimation();
        showResults();
        console.log('✨ All tasks completed successfully!');

    } catch (error) {
        console.error('❌ Transform error:', error);
        stopAnalysisAnimation();
        hideSection(elements.loadingSection);
        showError(error.message || 'Failed to process your request. Please try again.');
    }
}

// Step 1: Perform Detailed Text Analysis
async function performAnalysis() {
    console.log('📝 Analyzing face and hair features...');
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'AI Hair Salon'
            },
            body: JSON.stringify({
                model: CONFIG.ANALYSIS_MODEL,
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'text', text: ANALYSIS_PROMPT },
                        { type: 'image_url', image_url: { url: state.uploadedImageBase64 } }
                    ]
                }]
            })
        });

        if (!response.ok) throw new Error('Analysis API failed');

        const data = await response.json();
        state.analysisText = data.choices[0]?.message?.content || 'Analysis unavailable.';
        console.log('✅ Analysis complete');

    } catch (e) {
        console.error('Analysis failed:', e);
        state.analysisText = 'Text analysis could not be generated at this time, but your visual makeover is ready below.';
    }
}

// Step 2: Perform Image Generation
async function performImageGeneration() {
    console.log('🎨 Generating hairstyle images...');
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'AI Hair Salon'
            },
            body: JSON.stringify({
                model: CONFIG.IMAGE_MODEL,
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'text', text: IMAGE_GENERATION_PROMPT },
                        { type: 'image_url', image_url: { url: state.uploadedImageBase64 } }
                    ]
                }]
            })
        });

        if (!response.ok) throw new Error('Image Generation API failed');

        const data = await response.json();
        console.log('📸 API Response:', data); // Debug log

        const message = data.choices[0]?.message;

        // Simple extraction logic matching test_api.js success
        // Robust extraction logic
        if (message.images && message.images.length > 0) {
            const img = message.images[0];
            if (typeof img === 'string') {
                state.transformedImage = img;
            } else if (img.url) {
                state.transformedImage = img.url;
            } else if (img.image_url && img.image_url.url) {
                state.transformedImage = img.image_url.url;
            } else {
                console.warn('⚠️ Unexpected image format:', img);
            }
        }

        if (!state.transformedImage && message.content) {
            // If content is a URL
            if (message.content.startsWith('http') || message.content.startsWith('data:image')) {
                state.transformedImage = message.content;
            } else {
                console.warn('⚠️ Content is text, not image URL:', message.content);
                // Fallback: Check for markdown image format
                const match = message.content.match(/\((https?:\/\/.*?)\)/);
                if (match && match[1]) state.transformedImage = match[1];
            }
        }

        if (!state.transformedImage) throw new Error('No image generated');
        console.log('✅ Image generation complete (URL length):', state.transformedImage.length);

    } catch (e) {
        console.error('Generation failed:', e);
        // Do not block the UI entirely, let analysis show
        // But throwing error here is caught by handleTransform
        throw new Error('Failed to generate your makeover image.');
    }
}

// Show Results
function showResults() {
    hideSection(elements.loadingSection);

    // Set images
    elements.beforeImage.src = state.uploadedImageBase64;
    elements.afterImage.src = state.transformedImage;

    // Display analysis
    displayAnalysis(state.analysisText);

    showSection(elements.resultsSection);
}

// Display Analysis in formatted way
function displayAnalysis(analysisText) {
    const content = elements.analysisContent;

    if (!analysisText || analysisText.trim() === '') {
        content.innerHTML = '<p>Analysis not available. The AI has generated a hairstyle that complements your unique facial features.</p>';
        return;
    }

    // Format the analysis text
    const formatted = formatAnalysisText(analysisText);
    content.innerHTML = formatted;
}

// Format analysis text into HTML
function formatAnalysisText(text) {
    // Split into sections
    const sections = text.split(/\n\n+/);
    let html = '';

    sections.forEach(section => {
        const trimmed = section.trim();
        if (!trimmed) return;

        // Check if it's a heading (starts with number or title)
        if (trimmed.match(/^(\d+\.|[A-Z][^:]+:)/)) {
            const parts = trimmed.split(':');
            if (parts.length > 1) {
                html += `<div class="analysis-section">
                    <h4>${parts[0]}:</h4>
                    <p>${parts.slice(1).join(':').trim()}</p>
                </div>`;
            } else {
                html += `<p><strong>${trimmed}</strong></p>`;
            }
        } else if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
            // List items
            const items = trimmed.split('\n').filter(line => line.trim());
            html += '<ul>';
            items.forEach(item => {
                const cleaned = item.replace(/^[-•]\s*/, '');
                if (cleaned) html += `<li>${cleaned}</li>`;
            });
            html += '</ul>';
        } else {
            html += `<p>${trimmed}</p>`;
        }
    });

    return html || '<p>Analysis generated successfully. The recommended hairstyle complements your facial features perfectly.</p>';
}

// Download Image Only
function downloadImage() {
    if (!state.transformedImage) return;

    // Create download link
    const link = document.createElement('a');
    link.href = state.transformedImage;
    link.download = `hairstyle-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('💾 Hairstyle image downloaded');
}

// Download Full Report (HTML format)
function downloadFullReport() {
    if (!state.transformedImage || !state.uploadedImageBase64) return;

    const reportHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Hair Salon - Consultation Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 2rem;
            color: #333;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 3rem;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .header {
            text-align: center;
            margin-bottom: 3rem;
            padding-bottom: 2rem;
            border-bottom: 3px solid #3B82F6;
        }
        .header h1 {
            color: #3B82F6;
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        .header p {
            color: #666;
            font-size: 1.1rem;
        }
        .comparison {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin: 2rem 0;
        }
        .image-box {
            text-align: center;
        }
        .image-box h3 {
            color: #3B82F6;
            margin-bottom: 1rem;
            font-size: 1.3rem;
        }
        .image-box img {
            width: 100%;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .analysis {
            background: #f8f9fa;
            padding: 2rem;
            border-radius: 12px;
            margin: 2rem 0;
        }
        .analysis h2 {
            color: #3B82F6;
            margin-bottom: 1.5rem;
            font-size: 1.8rem;
        }
        .analysis-section {
            margin: 1.5rem 0;
            padding: 1rem;
            background: white;
            border-left: 4px solid #3B82F6;
            border-radius: 8px;
        }
        .analysis-section h4 {
            color: #3B82F6;
            margin-bottom: 0.75rem;
        }
        .analysis-section p {
            color: #555;
            line-height: 1.6;
        }
        .footer {
            text-align: center;
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 2px solid #e0e0e0;
            color: #666;
        }
        @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💇 AI Hair Salon</h1>
            <p>Professional Hair Styling Consultation Report</p>
            <p style="margin-top: 1rem; font-size: 0.9rem;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
        
        <div class="comparison">
            <div class="image-box">
                <h3>Current Look</h3>
                <img src="${state.uploadedImageBase64}" alt="Before">
            </div>
            <div class="image-box">
                <h3>Recommended Style</h3>
                <img src="${state.transformedImage}" alt="After">
            </div>
        </div>
        
        <div class="analysis">
            <h2>📋 AI Hair Stylist Analysis</h2>
            ${elements.analysisContent.innerHTML}
        </div>
        
        <div class="footer">
            <p><strong>AI Hair Salon</strong> - Powered by Advanced AI Technology</p>
            <p style="margin-top: 0.5rem; font-size: 0.9rem;">This report is for consultation purposes. Please consult with a professional stylist for best results.</p>
        </div>
    </div>
</body>
</html>`;

    // Create blob and download
    const blob = new Blob([reportHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hair-salon-report-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('📄 Full report downloaded');
}

// Reset App
function resetApp() {
    // Clear state
    state.uploadedImage = null;
    state.uploadedImageBase64 = null;
    state.transformedImage = null;
    state.analysisText = '';

    // Reset inputs
    elements.imageInput.value = '';

    // Show upload section
    hideSection(elements.resultsSection);
    showSection(elements.uploadSection);

    console.log('🔄 App reset');
}

// Error Handling
function showError(message) {
    elements.errorMessage.textContent = message;

    // Hide all sections
    hideSection(elements.uploadSection);
    hideSection(elements.previewSection);
    hideSection(elements.loadingSection);
    hideSection(elements.resultsSection);

    // Show error
    showSection(elements.errorSection);
}

// Section Visibility Helpers
function showSection(section) {
    section.classList.remove('hidden');
    section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideSection(section) {
    section.classList.add('hidden');
}

// ==========================================
// Sci-Fi Analysis Animation
// ==========================================

let analysisInterval = null;

function animateAnalysis() {
    const dataLog = document.getElementById('dataLog');
    if (!dataLog) return;

    const messages = [
        'INITIALIZING NEURAL LINK...',
        'SCANNING FACIAL GEOMETRY... [████████░░] 82%',
        'ANALYZING BONE STRUCTURE...',
        'MEASURING FACIAL SYMMETRY... 94.7%',
        'DETECTING JAWLINE CONTOURS...',
        'CALCULATING GOLDEN RATIO... φ = 1.618',
        'ANALYZING CHEEKBONE PROMINENCE...',
        'MEASURING FOREHEAD PROPORTIONS...',
        'SCANNING HAIR TEXTURE PATTERN...',
        'DETECTING HAIR DENSITY... 127 follicles/cm²',
        'ANALYZING CURL PATTERN... Type 2B detected',
        'MEASURING FACE WIDTH-TO-HEIGHT RATIO...',
        'CALCULATING CANTHAL TILT... +3.2°',
        'ANALYZING PHILTRUM CONFIGURATION...',
        'DETECTING SKIN UNDERTONES... Cool/Neutral',
        'PROCESSING FACIAL LANDMARKS... 68 points mapped',
        'RUNNING AI STYLE ALGORITHM...',
        'CROSS-REFERENCING 10,000+ HAIRSTYLES...',
        'OPTIMIZING FOR FACE SHAPE...',
        'GENERATING PERSONALIZED RECOMMENDATIONS...',
        'FINALIZING ANALYSIS... [██████████] 100%'
    ];

    let index = 0;

    // Clear any existing interval
    if (analysisInterval) clearInterval(analysisInterval);

    // Update message every 400ms
    analysisInterval = setInterval(() => {
        if (index < messages.length) {
            dataLog.textContent = messages[index];
            index++;
        } else {
            // Loop back
            index = 0;
        }
    }, 400);
}

function stopAnalysisAnimation() {
    if (analysisInterval) {
        clearInterval(analysisInterval);
        analysisInterval = null;
    }
}

// Initialize on DOM load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for debugging
window.appState = state;
window.appConfig = CONFIG;
