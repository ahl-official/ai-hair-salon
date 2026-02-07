const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    API_KEY: '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',
    API_URL: 'https://openrouter.ai/api/v1/chat/completions',
    IMAGE_MODEL: 'google/gemini-3-pro-image-preview',
    ANALYSIS_MODEL: 'google/gemini-2.0-flash-001',
};

// Prompts (Simplified for testing, preserving core logic)
const ANALYSIS_PROMPT = "Analyze the uploaded image to detect gender and provide a detailed consultation report. Determining if Male or Female. Provide EXACTLY ONE recommendation per scenario.";
const IMAGE_GENERATION_PROMPT = "Generate a photorealistic transformation of the user based on professional hair styling principles. Return ONLY the generated image url.";

async function testAPIs() {
    console.log('🚀 Starting API Tests...');

    // Read Image
    const imagePath = path.join(__dirname, 'test_image.png');
    if (!fs.existsSync(imagePath)) {
        console.error('❌ test_image.png not found! Run the python script first.');
        return;
    }
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;
    console.log('📸 Internal image loaded.');

    // Test Analysis
    console.log('\n--- Testing Analysis API ---');
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:8000',
                'X-Title': 'AI Hair Salon'
            },
            body: JSON.stringify({
                model: CONFIG.ANALYSIS_MODEL,
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'text', text: ANALYSIS_PROMPT },
                        { type: 'image_url', image_url: { url: base64Image } }
                    ]
                }]
            })
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('❌ Analysis Error:', data);
        } else {
            console.log('✅ Analysis Success!');
            const content = data.choices?.[0]?.message?.content;
            if (content) {
                console.log('Response Content Preview:', content.substring(0, 100) + '...');
            } else {
                console.log('⚠️ No content in analysis response.');
            }
        }
    } catch (error) {
        console.error('❌ Analysis Exception:', error);
    }


    // Test Image Generation
    console.log('\n--- Testing Image Generation API ---');
    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:8000',
                'X-Title': 'AI Hair Salon'
            },
            body: JSON.stringify({
                model: CONFIG.IMAGE_MODEL,
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'text', text: IMAGE_GENERATION_PROMPT },
                        { type: 'image_url', image_url: { url: base64Image } }
                    ]
                }]
            })
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('❌ Image Generation Error:', data);
        } else {
            console.log('✅ Image Generation Success? Checking content...');
            // Inspect response for image URL
            const message = data.choices?.[0]?.message;
            if (message?.images && message.images.length > 0) {
                console.log('✅ Found Image URL in message.images:', message.images[0].url || message.images[0]);
            } else if (message?.content) {
                console.log('⚠️ Found Content (Text):', message.content);
                if (message.content.includes('http')) {
                    console.log('✅ Content might contain URL.');
                } else {
                    console.log('❌ Content does NOT look like an image URL.');
                }
                // Check deep nested image struct if needed
                if (data.choices[0].message.images) {
                    console.log('✅ Found hidden images array:', data.choices[0].message.images);
                }
            } else {
                console.error('❌ No content or images found in response:', JSON.stringify(data, null, 2));
            }
        }

    } catch (error) {
        console.error('❌ Image Generation Exception:', error);
    }
}

testAPIs();
