# AI Visual Content Detector - Developer Documentation

## 🏗️ Architecture Overview

### Extension Structure
The extension follows Chrome Extension Manifest V3 architecture with these key components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Popup UI      │    │  Content Script │    │ Background SW   │
│                 │    │                 │    │                 │
│ • User Interface│◄──►│ • Page Analysis │◄──►│ • Lifecycle     │
│ • Results Display│    │ • Media Detection│   │ • Message Relay │
│ • Interactions  │    │ • AI Detection  │    │ • Storage       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow
1. **User clicks extension icon** → Popup opens
2. **Popup requests analysis** → Content script receives message
3. **Content script analyzes page** → Extracts and analyzes media
4. **Results sent back** → Popup displays analysis
5. **User can re-analyze** → Process repeats

## 🔍 Core Analysis Algorithm

### AIVisualDetector Class
The main analysis engine is implemented in `content.js` as the `AIVisualDetector` class.

#### Key Methods:
- `analyzePage()`: Main entry point for analysis
- `extractMediaElements()`: Finds images/videos on page
- `analyzeSingleElement()`: Analyzes individual media
- `calculateElementScore()`: Computes AI probability

#### Analysis Indicators:
```javascript
const indicators = {
    'Perfect Symmetry': analyzeSymmetry(element),
    'Unusual Patterns': analyzePatterns(element),
    'Color Consistency': analyzeColorConsistency(element),
    'Texture Analysis': analyzeTexture(element),
    'Edge Detection': analyzeEdges(element),
    'Metadata Analysis': analyzeMetadata(element),
    'File Characteristics': analyzeFileCharacteristics(element),
    'AI Artifacts': analyzeAIArtifacts(element)
};
```

### Detection Logic

#### 1. Media Extraction
```javascript
extractMediaElements() {
    const images = Array.from(document.querySelectorAll('img'))
        .filter(img => {
            const rect = img.getBoundingClientRect();
            return rect.width >= 100 && rect.height >= 100 && img.src;
        });
    
    const videos = Array.from(document.querySelectorAll('video'))
        .filter(video => video.src || video.querySelector('source'));
    
    return [...images, ...videos];
}
```

#### 2. Individual Analysis
Each media element is analyzed using 8 different indicators:

**Perfect Symmetry Detection:**
```javascript
analyzeSymmetry(element) {
    let symmetryScore = 0;
    
    if (element.naturalWidth && element.naturalHeight) {
        const aspectRatio = element.naturalWidth / element.naturalHeight;
        
        // Perfect squares are common in AI generation
        if (Math.abs(aspectRatio - 1) < 0.01) {
            symmetryScore += 0.4;
        }
        
        // Check for power-of-2 dimensions
        if (this.isPowerOfTwo(element.naturalWidth) && 
            this.isPowerOfTwo(element.naturalHeight)) {
            symmetryScore += 0.3;
        }
    }
    
    return Math.min(symmetryScore, 1);
}
```

**Pattern Detection:**
```javascript
analyzePatterns(element) {
    let patternScore = 0;
    
    // Common AI generation dimensions
    const commonAISizes = [
        [512, 512], [1024, 1024], [768, 768], [512, 768],
        [1024, 768], [1920, 1080], [1080, 1920], [1536, 1536],
        [2048, 2048]
    ];
    
    commonAISizes.forEach(([width, height]) => {
        if (element.naturalWidth === width && 
            element.naturalHeight === height) {
            patternScore += 0.3;
        }
    });
    
    return Math.min(patternScore, 1);
}
```

#### 3. Score Calculation
```javascript
calculateElementScore(indicators) {
    const weights = {
        'Perfect Symmetry': 0.15,
        'Unusual Patterns': 0.20,
        'Color Consistency': 0.15,
        'Texture Analysis': 0.15,
        'Edge Detection': 0.15,
        'Metadata Analysis': 0.25,
        'File Characteristics': 0.20,
        'AI Artifacts': 0.30
    };
    
    let weightedScore = 0;
    let totalWeight = 0;
    
    Object.entries(indicators).forEach(([name, score]) => {
        const weight = weights[name] || 0.1;
        weightedScore += score * weight;
        totalWeight += weight;
    });
    
    return weightedScore / totalWeight;
}
```

## 🎨 UI Components

### Popup Interface
The popup uses a modern, gradient-based design with these key sections:

#### 1. Header Section
```html
<div class="header">
    <h1>🤖 AI Visual Detector</h1>
    <p class="subtitle">Analyzing images and videos...</p>
</div>
```

#### 2. Results Card
```html
<div class="result-card">
    <div class="result-header">
        <h2>Visual Analysis Results</h2>
        <div class="confidence-badge" id="confidence-badge">
            <span id="confidence-score">0%</span>
        </div>
    </div>
    
    <div class="ai-probability">
        <div class="probability-bar">
            <div class="probability-fill" id="probability-fill"></div>
        </div>
        <div class="probability-labels">
            <span>Human</span>
            <span>AI Generated</span>
        </div>
    </div>
</div>
```

#### 3. Media List
```html
<div class="media-list" id="media-list">
    <!-- Dynamically populated -->
</div>
```

### CSS Architecture
The styling uses a modular approach with these key classes:

```css
/* Container and Layout */
.container { width: 450px; min-height: 600px; }
.result-card { background: #f8f9fa; border-radius: 8px; }

/* Interactive Elements */
.btn { transition: all 0.2s ease; }
.btn.primary { background: #667eea; color: white; }

/* Visual Indicators */
.confidence-badge { background: #667eea; color: white; }
.probability-fill { background: linear-gradient(90deg, #28a745, #ffc107, #dc3545); }
```

## 🔧 Message Passing

### Popup to Content Script
```javascript
// In popup.js
const response = await chrome.tabs.sendMessage(tab.id, {
    action: 'analyzeContent'
});
```

### Content Script Response
```javascript
// In content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'analyzeContent') {
        const detector = new AIVisualDetector();
        detector.analyzePage().then(result => {
            sendResponse(result);
        });
        return true; // Keep message channel open
    }
});
```

## 📊 Data Structures

### Analysis Result Format
```javascript
{
    success: true,
    data: {
        confidence: 0.85,           // Overall confidence (0-1)
        aiProbability: 0.72,        // AI generation probability (0-1)
        indicators: {               // Individual indicator scores
            'Perfect Symmetry': 0.8,
            'Unusual Patterns': 0.6,
            // ... other indicators
        },
        mediaCount: 5,              // Number of media elements
        mediaElements: [            // Individual media analysis
            {
                src: 'image.jpg',
                type: 'img',
                size: '1024x1024',
                aiScore: 0.75,
                indicators: { /* individual indicators */ },
                confidence: 0.8
            }
        ],
        analysisStatus: 'success'
    }
}
```

### Error Response Format
```javascript
{
    success: false,
    error: 'Error message',
    analysisStatus: 'error',
    data: {
        confidence: 0,
        aiProbability: 0,
        indicators: {},
        mediaCount: 0,
        mediaElements: [],
        analysisStatus: 'error',
        errorMessage: 'Detailed error message'
    }
}
```

## 🚀 Performance Optimization

### 1. Efficient Media Filtering
```javascript
// Only analyze media larger than 100x100 pixels
.filter(img => {
    const rect = img.getBoundingClientRect();
    return rect.width >= 100 && rect.height >= 100;
})
```

### 2. Batch Processing
```javascript
// Process media elements in parallel
const analysisPromises = mediaElements.map(element => 
    this.analyzeSingleElement(element)
);
const results = await Promise.all(analysisPromises);
```

### 3. Memory Management
```javascript
// Clean up large objects after analysis
this.detectedMedia = [];
this.indicators = {};
```

## 🐛 Debugging Guide

### Console Logging
```javascript
// In content.js
console.log('Analysis complete:', result);

// In popup.js
console.error('Analysis error:', error);
```

### Error Handling
```javascript
try {
    const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'analyzeContent'
    });
} catch (error) {
    if (error.message.includes('Could not establish connection')) {
        showError('Cannot connect to the page. Try refreshing.');
    }
}
```

### Testing
1. **Load extension** in developer mode
2. **Open test page** with known AI/human images
3. **Click extension icon** and check console
4. **Verify results** match expectations

## 🔄 Extension Lifecycle

### Installation
```javascript
// In background.js
chrome.runtime.onInstalled.addListener(() => {
    console.log('AI Content Detector extension installed');
});
```

### Tab Updates
```javascript
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url.startsWith('http')) {
        // Could trigger auto-analysis here
    }
});
```

### Message Handling
```javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'getSettings':
            // Handle settings request
            break;
        case 'showNotification':
            // Handle notification request
            break;
    }
    return true; // Keep message channel open
});
```

## 🎯 Future Enhancements

### Potential Improvements
1. **Machine Learning Integration**: Use TensorFlow.js for more accurate detection
2. **Real-time Analysis**: Analyze content as it loads
3. **Batch Processing**: Analyze multiple pages simultaneously
4. **Export Results**: Save analysis results to file
5. **API Integration**: Connect to external AI detection services

### Code Structure Improvements
1. **Modular Architecture**: Split analysis into separate modules
2. **Plugin System**: Allow custom analysis indicators
3. **Configuration API**: Dynamic threshold adjustment
4. **Performance Monitoring**: Track analysis speed and accuracy

## 📝 Code Standards

### JavaScript
- Use ES6+ features (async/await, arrow functions)
- Follow consistent naming conventions
- Add comprehensive error handling
- Include JSDoc comments for complex functions

### CSS
- Use BEM methodology for class naming
- Implement responsive design principles
- Optimize for performance (avoid expensive properties)
- Maintain consistent color scheme

### HTML
- Use semantic HTML elements
- Ensure accessibility compliance
- Keep structure clean and readable
- Validate markup

## 🔒 Security Considerations

### Content Security
- All analysis happens locally in browser
- No external API calls for analysis
- No data collection or storage
- Respects user privacy

### Permission Usage
```json
{
    "permissions": [
        "activeTab",      // Access current tab
        "storage",        // Store settings
        "scripting"       // Inject content scripts
    ]
}
```

### Data Handling
- No sensitive data is transmitted
- Analysis results are temporary
- No user data is stored permanently
- Respects CORS policies

---

This documentation provides a comprehensive overview for developers working with or contributing to the AI Visual Content Detector extension. For specific implementation details, refer to the individual source files. 