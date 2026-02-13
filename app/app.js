// Configuration
const CONFIG = {
    // API endpoints now point to serverless functions (API key is secure on server)
    ANALYZE_URL: '/api/analyze',
    GENERATE_URL: '/api/generate',
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp']
};

// Analysis Prompt - Updated to request JSON for the new protocol
function getAnalysisPrompt(demographics) {
    const { age, gender, profession } = demographics;
    return `You are a world-class facial aesthetics expert. Analyze the uploaded image and provide a comprehensive, data-driven aesthetic protocol in JSON format.
    
    CLIENT INFORMATION:
    - Age: ${age}
    - Gender: ${gender}
    - Profession: ${profession}

    Provide the following data points in your JSON response:
    1. aestheticScore: A numeric score from 1-100 reflecting the subject's current aesthetic alignment.
    2. aestheticIntro: A 2-sentence professional explanation of the score.
    3. featureScores: An object containing current scores (0-10) for: Hair, Eyebrows, Eyes, Nose, Cheeks, Jaw, Lips, Chin, Skin, Neck, Ears.
    4. potentialScores: An object containing potential scores (0-10) for the same 11 features after following the protocol.
    5. norwoodStage: A number from 1 to 7 indicating the current hair loss stage (Norwood Scale).
    6. hairLossExplanation: A professional medical-style analysis of the hairline and density.
    7. hairStyleRecommendation: Detailed styling advice considering their ${profession} profession and age.
    8. hairHealth: Analysis of hair quality, texture, and density.
    9. hairSummary: A 1-sentence concise summary of the overall recommendation.

    JSON format example:
    {
      "aestheticScore": 62,
      "aestheticIntro": "...",
      "featureScores": {"Hair": 6.5, "Eyebrows": 7.2, ...},
      "potentialScores": {"Hair": 8.5, "Eyebrows": 7.8, ...},
      "norwoodStage": 2,
      "hairLossExplanation": "...",
      "hairStyleRecommendation": "...",
      "hairHealth": "...",
      "hairSummary": "..."
    }

    ONLY return the raw JSON object. NO markdown formatting.`;
}

// Image Generation Prompt - Focuses purely on the visual output
function getImageGenerationPrompt(demographics) {
    const { age, gender, profession } = demographics;
    return `Generate a vertical 9:16 4K 3x3 grid of hairstyle reference images directly on the user's face.

CLIENT DETAILS:
- Age: ${age} years old
- Gender: ${gender}
- Profession: ${profession}

CRITICAL REQUIREMENTS:
- **Identity Preservation**: Keep the face and features EXACTLY identical.
- **Hairline Coverage**: ALL hairstyles MUST completely cover the hairline. NO exposed hairline should be visible. Hair should start from the forehead and cover the hairline area.
- **Age-Appropriate**: Generate hairstyles suitable for a ${age}-year-old ${gender}.
- **Profession-Appropriate**: Include styles appropriate for ${profession} profession.
- **Style Variety**: Mix short, medium, and long professional hairstyles that cover the hairline.
- **Output**: Return ONLY the generated image grid.

REMEMBER: The hairline MUST be covered with hair in ALL generated hairstyles. This is non-negotiable.`;
}

// State Management
const state = {
    uploadedImage: null,
    uploadedImageBase64: null,
    transformedImage: null,
    analysisText: '',
    demographics: {
        age: '',
        gender: '',
        profession: ''
    }
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

    // Demographics
    ageInput: document.getElementById('ageInput'),
    genderInput: document.getElementById('genderInput'),
    professionInput: document.getElementById('professionInput'),

    // Loading/Assessment
    assessmentProgress: document.getElementById('assessmentProgress'),
    assessmentStatus: document.getElementById('assessmentStatus'),
    assessmentDetail: document.getElementById('assessmentDetail'),
    scanningImage: document.getElementById('scanningImage'),

    // Results Header/Score
    aestheticScoreValue: document.getElementById('aestheticScoreValue'),
    scoreBarFill: document.getElementById('scoreBarFill'),
    clientNameDisplay: document.getElementById('clientNameDisplay'),
    aestheticIntro: document.getElementById('aestheticIntro'),

    // Images
    beforeImage: document.getElementById('beforeImage'),
    afterImage: document.getElementById('afterImage'),

    // Report Content
    radarContainer: document.getElementById('radarContainer'),
    hairStyleContent: document.getElementById('hairStyleContent'),
    hairLossContent: document.getElementById('hairLossContent'),
    hairHealthContent: document.getElementById('hairHealthContent'),
    norwoodScale: document.getElementById('norwoodScale'),

    // Actions
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
    // Validate demographics
    const age = elements.ageInput.value.trim();
    const gender = elements.genderInput.value;
    const profession = elements.professionInput.value;

    if (!age || !gender || !profession) {
        showError('Please fill in all fields: Age, Gender, and Profession');
        return;
    }

    if (age < 5 || age > 100) {
        showError('Please enter a valid age between 5 and 100');
        return;
    }

    // Save demographics to state
    state.demographics = { age, gender, profession };

    // Show loading
    hideSection(elements.previewSection);
    showSection(elements.loadingSection);

    // Reset state
    state.analysisData = null;
    state.transformedImage = null;

    try {
        console.log('💇 Starting AI Makeover...');
        console.log('📊 Demographics:', state.demographics);

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

// Step 1: Perform Detailed Text Analysis (Updated for JSON)
async function performAnalysis() {
    console.log('📝 Analyzing face and hair features...');
    try {
        const response = await fetch(CONFIG.ANALYZE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                imageBase64: state.uploadedImageBase64,
                prompt: getAnalysisPrompt(state.demographics),
                demographics: state.demographics
            })
        });

        if (!response.ok) throw new Error('Analysis API failed');

        const data = await response.json();
        let content = data.choices[0]?.message?.content || '{}';

        // Strip code blocks if AI included them
        content = content.replace(/```json\n?|\n?```/g, '').trim();

        try {
            state.analysisData = JSON.parse(content);
            console.log('✅ Analysis complete (JSON parsed)');
        } catch (e) {
            console.error('JSON Parse error, fallback to raw text');
            state.analysisData = { hairSummary: content };
        }

    } catch (e) {
        console.error('Analysis failed:', e);
        state.analysisData = { hairSummary: 'Analysis unavailable.' };
    }
}

// Step 2: Perform Image Generation
async function performImageGeneration() {
    console.log('🎨 Generating hairstyle images...');
    try {
        const response = await fetch(CONFIG.GENERATE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                imageBase64: state.uploadedImageBase64,
                prompt: getImageGenerationPrompt(state.demographics),
                demographics: state.demographics
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

    const data = state.analysisData || {};

    // Set images
    elements.beforeImage.src = state.uploadedImageBase64;
    elements.afterImage.src = state.transformedImage;

    // Populate Report Header
    if (elements.clientNameDisplay) elements.clientNameDisplay.textContent = 'Client'; // Could use a name field if added
    if (elements.aestheticScoreValue) updateScoreBar(data.aestheticScore || 0);
    if (elements.aestheticIntro) elements.aestheticIntro.textContent = data.aestheticIntro || '';

    // Render Components
    if (data.featureScores && data.potentialScores) {
        renderRadarChart(data.featureScores, data.potentialScores);
    }

    if (data.norwoodStage) {
        renderNorwoodScale(data.norwoodStage);
    }

    // Populate Recommendations
    if (elements.hairStyleContent) elements.hairStyleContent.innerHTML = `<p>${data.hairStyleRecommendation || 'N/A'}</p>`;
    if (elements.hairLossContent) elements.hairLossContent.innerHTML = `<p>${data.hairLossExplanation || 'N/A'}</p>`;
    if (elements.hairHealthContent) elements.hairHealthContent.innerHTML = `<p>${data.hairHealth || 'N/A'}</p>`;

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

// Download Full Report (HTML format) - Updated for Qoves Protocol
function downloadFullReport() {
    if (!state.transformedImage || !state.uploadedImageBase64 || !state.analysisData) return;

    const data = state.analysisData;
    const radarSVG = elements.radarContainer.innerHTML;
    const norwoodHTML = elements.norwoodScale.innerHTML;

    const reportHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${state.demographics.gender}'s Protocol - Consultation Report</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-blue: #2c3e50;
            --accent-blue: #3498db;
            --text-main: #2d3436;
            --text-muted: #636e72;
            --text-light: #b2bec3;
            --bg-light: #f8f9fa;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', sans-serif;
            background: white;
            padding: 40px;
            color: var(--text-main);
            line-height: 1.6;
        }
        .container { max-width: 900px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 40px; }
        .logo { font-size: 1.5rem; font-weight: 700; color: var(--primary-blue); display: flex; align-items: center; gap: 10px; }
        .page-info { font-size: 0.8rem; color: var(--text-light); font-weight: 600; text-transform: uppercase; }
        
        h1 { font-size: 3rem; font-weight: 300; margin-bottom: 40px; color: var(--primary-blue); }
        h1 span { color: var(--text-light); }
        
        .score-section { margin-bottom: 40px; }
        .score-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 15px; }
        .score-title { font-size: 1.2rem; color: var(--text-muted); }
        .score-value { font-size: 4rem; font-weight: 300; color: var(--accent-blue); line-height: 1; }
        .score-bar { height: 12px; background: #eee; border-radius: 6px; overflow: hidden; }
        .score-fill { height: 100%; background: #7f8c8d; width: ${data.aestheticScore}%; }

        .comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
        .image-box { border-radius: 12px; overflow: hidden; background: var(--bg-light); padding: 10px; }
        .image-box img { width: 100%; border-radius: 8px; }
        .image-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: var(--text-light); margin-bottom: 5px; }

        .intro { font-size: 1.1rem; color: var(--text-muted); margin-bottom: 40px; max-width: 800px; }

        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-bottom: 60px; }
        .features-list { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; list-style: none; margin-top: 20px; }
        .feature-item { font-size: 0.9rem; display: flex; align-items: center; gap: 8px; }
        .dot { width: 6px; height: 6px; background: var(--text-light); border-radius: 50%; }

        .radar-svg { width: 100%; height: auto; }
        
        .recommendation-block { margin-bottom: 40px; }
        .rec-header { font-size: 2rem; font-weight: 300; color: var(--primary-blue); border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
        .rec-header span { color: var(--text-light); }
        .block-title { font-size: 1.2rem; font-weight: 600; margin-bottom: 10px; }
        .block-content { font-size: 1rem; color: var(--text-muted); }

        .norwood-scale { display: flex; justify-content: space-between; background: var(--bg-light); padding: 15px; border-radius: 8px; margin-top: 20px; }
        .loss-stage { opacity: 0.3; }
        .loss-stage.active { opacity: 1; }
        
        @media print {
            body { padding: 0; }
            .container { max-width: 100%; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <svg width="30" height="30" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" stroke="#2c3e50" stroke-width="3" fill="none"/></svg>
                QOVES ANALYTICS
            </div>
            <div class="page-info">PAGE / 01</div>
        </div>

        <h1>${state.demographics.gender}'s <span>Protocol</span></h1>

        <div class="score-section">
            <div class="score-header">
                <span class="score-title">Aesthetic Score</span>
                <span class="score-value">${data.aestheticScore}</span>
            </div>
            <div class="score-bar"><div class="score-fill"></div></div>
        </div>

        <div class="comparison">
            <div class="image-box">
                <div class="image-label">Before</div>
                <img src="${state.uploadedImageBase64}" alt="Before">
            </div>
            <div class="image-box">
                <div class="image-label">After</div>
                <img src="${state.transformedImage}" alt="After">
            </div>
        </div>

        <div class="intro">${data.aestheticIntro || 'Analysis generated based on professional facial anthropometric standards.'}</div>

        <div class="grid">
            <div class="features-column">
                <h2 style="font-weight: 300; color: var(--primary-blue);">Projected potential</h2>
                <p style="font-size: 0.9rem; margin-top: 10px;">Report organised around 11 key features.</p>
                <div class="features-list">
                    <div class="feature-item"><div class="dot"></div> Hair</div>
                    <div class="feature-item"><div class="dot"></div> Eyebrows</div>
                    <div class="feature-item"><div class="dot"></div> Eyes</div>
                    <div class="feature-item"><div class="dot"></div> Nose</div>
                    <div class="feature-item"><div class="dot"></div> Cheeks</div>
                    <div class="feature-item"><div class="dot"></div> Jaw</div>
                    <div class="feature-item"><div class="dot"></div> Lips</div>
                    <div class="feature-item"><div class="dot"></div> Chin</div>
                    <div class="feature-item"><div class="dot"></div> Skin</div>
                    <div class="feature-item"><div class="dot"></div> Neck</div>
                    <div class="feature-item"><div class="dot"></div> Ears</div>
                </div>
            </div>
            <div class="radar-column">
                ${radarSVG}
            </div>
        </div>

        <div class="recommendations">
            <div class="rec-header">Hair <span>Recommendations</span></div>
            
            <div class="recommendation-block">
                <div class="block-title">Hair Style</div>
                <div class="block-content">${data.hairStyleRecommendation || 'Detailed styling advice provided above.'}</div>
            </div>

            <div class="recommendation-block">
                <div class="block-title">Hair Loss</div>
                <div class="block-content">${data.hairLossExplanation || 'Analysis of hairline and density.'}</div>
                <div class="norwood-scale">${norwoodHTML}</div>
            </div>

            <div class="recommendation-block">
                <div class="block-title">Hair Health</div>
                <div class="block-content">${data.hairHealth || 'Analysis of hair quality.'}</div>
            </div>
        </div>

        <div style="text-align: center; margin-top: 60px; font-size: 0.8rem; color: var(--text-light); border-top: 1px solid #eee; padding-top: 20px;">
            Professional Protocol Generated by AI Analytics • ${new Date().toLocaleDateString()}
        </div>
    </div>
</body>
</html>`;

    // Create blob and download
    const blob = new Blob([reportHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aesthetic-protocol-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('📄 Professional Protocol Report downloaded');
}


// Reset App
function resetApp() {
    // Clear state
    state.uploadedImage = null;
    state.uploadedImageBase64 = null;
    state.transformedImage = null;
    state.analysisData = null;
    state.demographics = { age: '', gender: '', profession: '' };

    // Reset inputs
    elements.imageInput.value = '';
    if (elements.ageInput) elements.ageInput.value = '';
    if (elements.genderInput) elements.genderInput.value = '';
    if (elements.professionInput) elements.professionInput.value = '';

    // Clear report fields
    if (elements.aestheticScoreValue) elements.aestheticScoreValue.textContent = '--';
    if (elements.scoreBarFill) elements.scoreBarFill.style.width = '0%';
    if (elements.radarContainer) elements.radarContainer.innerHTML = '';
    if (elements.norwoodScale) elements.norwoodScale.innerHTML = '';

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
// Protocol Report Rendering Helpers
// ==========================================

function updateScoreBar(score) {
    const fill = elements.scoreBarFill;
    const value = elements.aestheticScoreValue;
    if (!fill || !value) return;

    value.textContent = score;
    setTimeout(() => {
        fill.style.width = `${score}%`;
    }, 100);
}

function renderRadarChart(featureScores, potentialScores) {
    const container = elements.radarContainer;
    if (!container) return;

    const features = Object.keys(featureScores);
    const numFeatures = features.length;
    const size = 300;
    const center = size / 2;
    const radius = size * 0.4;

    let svg = `<svg viewBox="0 0 ${size} ${size}" class="radar-svg">`;

    // Draw background circles
    for (let i = 1; i <= 5; i++) {
        const r = (radius / 5) * i;
        svg += `<circle cx="${center}" cy="${center}" r="${r}" fill="none" stroke="#dfe6e9" stroke-width="1" />`;
    }

    // Draw axis lines
    features.forEach((f, i) => {
        const angle = (Math.PI * 2 * i) / numFeatures - Math.PI / 2;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        svg += `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="#dfe6e9" stroke-width="1" />`;
    });

    // Draw Potential area (Blue)
    let potentialPoints = "";
    features.forEach((f, i) => {
        const angle = (Math.PI * 2 * i) / numFeatures - Math.PI / 2;
        const val = potentialScores[f] || 0;
        const r = (radius * val) / 10;
        const x = center + Math.cos(angle) * r;
        const y = center + Math.sin(angle) * r;
        potentialPoints += `${x},${y} `;
    });
    svg += `<polygon points="${potentialPoints}" fill="var(--radar-potential)" stroke="var(--radar-potential-stroke)" stroke-width="2" />`;

    // Draw Client area (Dark)
    let clientPoints = "";
    features.forEach((f, i) => {
        const angle = (Math.PI * 2 * i) / numFeatures - Math.PI / 2;
        const val = featureScores[f] || 0;
        const r = (radius * val) / 10;
        const x = center + Math.cos(angle) * r;
        const y = center + Math.sin(angle) * r;
        clientPoints += `${x},${y} `;
    });
    svg += `<polygon points="${clientPoints}" fill="var(--radar-client)" stroke="var(--radar-client-stroke)" stroke-width="2" />`;

    svg += `</svg>`;
    container.innerHTML = svg;
}

function renderNorwoodScale(activeStage) {
    const container = elements.norwoodScale;
    if (!container) return;

    let html = "";
    for (let i = 1; i <= 7; i++) {
        html += `
            <div class="loss-stage ${i === activeStage ? 'active' : ''}">
                <svg width="40" height="40" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#ccc" stroke-width="2"/>
                    <path d="M20 40 Q50 20 80 40" fill="none" stroke="${i >= activeStage ? '#34495e' : '#ccc'}" stroke-width="4"/>
                    ${i > 1 ? `<path d="M25 45 Q50 ${30 + i * 5} 75 45" fill="none" stroke="#34495e" stroke-width="3"/>` : ''}
                </svg>
                <span style="font-size: 0.7rem; color: #95a5a6;">${i}</span>
            </div>
        `;
    }
    container.innerHTML = html;
}

// Updated Sci-Fi Analysis Animation to Professional Assessment
let currentProgress = 0;
function animateAnalysis() {
    const status = elements.assessmentStatus;
    const detail = elements.assessmentDetail;
    const progress = elements.assessmentProgress;
    if (!status || !detail || !progress) return;

    const messages = [
        { s: 'Initializing Analysis', d: 'Establishing secure neural link...' },
        { s: 'Data Ingestion', d: 'Scanning facial geometry...' },
        { s: 'Anthropometric Mapping', d: 'Analyzing bone structure and ratios...' },
        { s: 'Feature Assessment', d: 'Measuring facial symmetry and proportions...' },
        { s: 'Symmetry Analysis', d: 'Calculating Golden Ratio alignment...' },
        { s: 'Texture Scan', d: 'Analyzing hair density and scalp health...' },
        { s: 'Pattern Recognition', d: 'Identifying current hair loss morphology...' },
        { s: 'Style Optimization', d: 'Generating personalized aesthetic protocol...' },
        { s: 'Finalizing Report', d: 'Synthesizing objective recommendations...' }
    ];

    let index = 0;
    currentProgress = 0;

    if (analysisInterval) clearInterval(analysisInterval);

    analysisInterval = setInterval(() => {
        if (index < messages.length) {
            status.textContent = messages[index].s;
            detail.textContent = messages[index].d;

            currentProgress += (100 / messages.length);
            progress.style.width = `${currentProgress}%`;

            index++;
        } else {
            index = 0; // Loop or just stay at 100%
            currentProgress = 100;
            progress.style.width = '100%';
        }
    }, 1500);
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
