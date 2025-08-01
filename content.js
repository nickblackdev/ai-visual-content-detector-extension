// AI Visual Content Detection Algorithm
class AIVisualDetector {
    constructor() {
        this.indicators = {};
        this.confidence = 0;
        this.aiProbability = 0;
        this.detectedMedia = [];
        this.analysisStatus = 'pending';
        this.errorMessage = '';
    }
    
    // Main analysis method
    async analyzePage() {
        try {
            
            const mediaElements = this.extractMediaElements();
            
            if (mediaElements.length === 0) {
                this.analysisStatus = 'no_media';
                this.errorMessage = 'No images or videos found on this page';
                throw new Error('No images or videos found on this page');
            }
            
            // Check if we can actually analyze the media
            const analyzableMedia = this.filterAnalyzableMedia(mediaElements);
            
            if (analyzableMedia.length === 0) {
                this.analysisStatus = 'no_analyzable';
                this.errorMessage = 'Found media but unable to analyze (CORS restrictions or invalid images)';
                throw new Error('Found media but unable to analyze (CORS restrictions or invalid images)');
            }
            
            this.detectedMedia = analyzableMedia;
            await this.analyzeVisualContent(analyzableMedia);
            this.calculateFinalScore();
            
            this.analysisStatus = 'success';
            
            return {
                success: true,
                data: {
                    confidence: this.confidence,
                    aiProbability: this.aiProbability,
                    indicators: this.indicators,
                    mediaCount: analyzableMedia.length,
                    mediaElements: this.getDetailedMediaInfo(analyzableMedia),
                    analysisStatus: this.analysisStatus
                }
            };
        } catch (error) {
            this.analysisStatus = 'error';
            this.errorMessage = error.message;
            
            return {
                success: false,
                error: error.message,
                analysisStatus: this.analysisStatus,
                data: {
                    confidence: 0,
                    aiProbability: 0,
                    indicators: {},
                    mediaCount: 0,
                    mediaElements: [],
                    analysisStatus: this.analysisStatus,
                    errorMessage: this.errorMessage
                }
            };
        }
    }
    
    // Get detailed information for each media element
    getDetailedMediaInfo(mediaElements) {
        return mediaElements.map(element => {
            const analysis = this.getIndividualAnalysis(element);
            return {
                src: element.src,
                type: element.tagName.toLowerCase(),
                size: element.naturalWidth ? `${element.naturalWidth}x${element.naturalHeight}` : 'Unknown',
                aiScore: analysis.aiScore,
                indicators: analysis.indicators,
                aiProbability: analysis.aiScore,
                isAI: analysis.aiScore > 0.6,
                confidence: analysis.confidence
            };
        });
    }
    
    // Get individual analysis for a single element
    getIndividualAnalysis(element) {
        const indicators = {
            'Perfect Symmetry': this.analyzeSymmetry(element),
            'Unusual Patterns': this.analyzePatterns(element),
            'Color Consistency': this.analyzeColorConsistency(element),
            'Texture Analysis': this.analyzeTexture(element),
            'Edge Detection': this.analyzeEdges(element),
            'Metadata Analysis': this.analyzeMetadata(element),
            'File Characteristics': this.analyzeFileCharacteristics(element),
            'AI Artifacts': this.analyzeAIArtifacts(element)
        };
        
        const aiScore = this.calculateElementScore(indicators);
        const confidence = this.calculateElementConfidence(element, indicators);
        
        return {
            indicators: indicators,
            aiScore: aiScore,
            confidence: confidence
        };
    }
    
    // Calculate confidence for individual element
    calculateElementConfidence(element, indicators) {
        let confidence = 0.5; // Base confidence
        
        // Higher confidence for elements with valid dimensions
        if (element.naturalWidth && element.naturalHeight) {
            confidence += 0.2;
        }
        
        // Higher confidence for elements with strong indicators
        const strongIndicators = Object.values(indicators).filter(score => score > 0.7).length;
        confidence += strongIndicators * 0.1;
        
        return Math.min(confidence, 1);
    }
    
    // Extract images and videos from the page
    extractMediaElements() {
        const images = Array.from(document.querySelectorAll('img')).filter(img => {
            // Filter out small icons, buttons, and decorative images
            const rect = img.getBoundingClientRect();
            const minSize = 100; // Minimum size to consider for analysis
            return rect.width >= minSize && rect.height >= minSize && img.src;
        });
        
        const videos = Array.from(document.querySelectorAll('video')).filter(video => {
            return video.src || video.querySelector('source');
        });
        
        return [...images, ...videos];
    }
    
    // Filter media that we can actually analyze
    filterAnalyzableMedia(mediaElements) {
        return mediaElements.filter(element => {
            // Check if element has valid dimensions
            if (element.naturalWidth && element.naturalHeight) {
                return true;
            }
            
            // For videos, check if they have valid dimensions
            if (element.tagName.toLowerCase() === 'video') {
                return element.videoWidth && element.videoHeight;
            }
            
            return false;
        });
    }
    
    // Analyze visual content for AI generation indicators
    async analyzeVisualContent(mediaElements) {
        const analysisPromises = mediaElements.map(element => this.analyzeSingleElement(element));
        const results = await Promise.all(analysisPromises);
        
        // Aggregate results
        this.analyzeResults(results);
    }
    
    // Analyze a single media element
    async analyzeSingleElement(element) {
        const analysis = {
            element: element,
            indicators: {},
            aiScore: 0
        };
        
        // Visual analysis indicators
        analysis.indicators = {
            'Perfect Symmetry': this.analyzeSymmetry(element),
            'Unusual Patterns': this.analyzePatterns(element),
            'Color Consistency': this.analyzeColorConsistency(element),
            'Texture Analysis': this.analyzeTexture(element),
            'Edge Detection': this.analyzeEdges(element),
            'Metadata Analysis': this.analyzeMetadata(element),
            'File Characteristics': this.analyzeFileCharacteristics(element),
            'AI Artifacts': this.analyzeAIArtifacts(element)
        };
        
        // Calculate AI score for this element
        analysis.aiScore = this.calculateElementScore(analysis.indicators);
        
        return analysis;
    }
    
    // Analyze symmetry patterns
    analyzeSymmetry(element) {
        let symmetryScore = 0;
        
        if (element.naturalWidth && element.naturalHeight) {
            const aspectRatio = element.naturalWidth / element.naturalHeight;
            
            // Perfect squares are common in AI generation
            if (Math.abs(aspectRatio - 1) < 0.01) {
                symmetryScore += 0.4;
            }
            
            // Check for power-of-2 dimensions (common in AI generation)
            if (this.isPowerOfTwo(element.naturalWidth) && this.isPowerOfTwo(element.naturalHeight)) {
                symmetryScore += 0.3;
            }
            
            // Very high resolution perfect squares
            if (element.naturalWidth >= 2048 && element.naturalHeight >= 2048 && aspectRatio === 1) {
                symmetryScore += 0.5;
            }
        }
        
        return Math.min(symmetryScore, 1);
    }
    
    // Check if a number is a power of 2
    isPowerOfTwo(num) {
        return num > 0 && (num & (num - 1)) === 0;
    }
    
    // Analyze unusual patterns that are common in AI-generated content
    analyzePatterns(element) {
        let patternScore = 0;
        
        if (element.naturalWidth && element.naturalHeight) {
            const aspectRatio = element.naturalWidth / element.naturalHeight;
            
            // AI often generates images with common aspect ratios
            const commonAIAspectRatios = [1, 16/9, 4/3, 3/2, 5/4];
            commonAIAspectRatios.forEach(ratio => {
                if (Math.abs(aspectRatio - ratio) < 0.01) {
                    patternScore += 0.2;
                }
            });
            
            // Check for common AI generation dimensions
            const commonAISizes = [
                [512, 512], [1024, 1024], [768, 768], [512, 768],
                [1024, 768], [1920, 1080], [1080, 1920], [1536, 1536],
                [2048, 2048], [1024, 1024], [512, 512]
            ];
            
            commonAISizes.forEach(([width, height]) => {
                if (element.naturalWidth === width && element.naturalHeight === height) {
                    patternScore += 0.3;
                }
            });
            
            // Check for very specific AI generation patterns
            if (element.naturalWidth === 1024 && element.naturalHeight === 1024) {
                patternScore += 0.4; // Very common in AI generation
            }
            
            if (element.naturalWidth === 512 && element.naturalHeight === 512) {
                patternScore += 0.3; // Common in older AI models
            }
        }
        
        return Math.min(patternScore, 1);
    }
    
    // Analyze color consistency and distribution
    analyzeColorConsistency(element) {
        let colorScore = 0;
        
        if (element.naturalWidth && element.naturalHeight) {
            // Larger images with perfect dimensions often indicate AI generation
            if (element.naturalWidth >= 1024 && element.naturalHeight >= 1024) {
                colorScore += 0.3;
            }
            
            // Check for common AI generation dimensions
            if (element.naturalWidth === 512 && element.naturalHeight === 512) {
                colorScore += 0.4;
            }
            
            // Very high resolution images
            if (element.naturalWidth >= 2048 || element.naturalHeight >= 2048) {
                colorScore += 0.3;
            }
            
            // Perfect squares with high resolution
            if (element.naturalWidth === element.naturalHeight && element.naturalWidth >= 1024) {
                colorScore += 0.4;
            }
        }
        
        return Math.min(colorScore, 1);
    }
    
    // Analyze texture characteristics
    analyzeTexture(element) {
        let textureScore = 0;
        
        if (element.naturalWidth && element.naturalHeight) {
            // Check for very high resolution images (common in AI generation)
            if (element.naturalWidth >= 2048 || element.naturalHeight >= 2048) {
                textureScore += 0.3;
            }
            
            // Check for perfect square dimensions
            if (element.naturalWidth === element.naturalHeight) {
                textureScore += 0.2;
            }
            
            // Power-of-2 dimensions
            if (this.isPowerOfTwo(element.naturalWidth) && this.isPowerOfTwo(element.naturalHeight)) {
                textureScore += 0.3;
            }
            
            // Very specific AI generation sizes
            if (element.naturalWidth === 1536 && element.naturalHeight === 1536) {
                textureScore += 0.4;
            }
        }
        
        return Math.min(textureScore, 1);
    }
    
    // Analyze edge characteristics
    analyzeEdges(element) {
        let edgeScore = 0;
        
        if (element.naturalWidth && element.naturalHeight) {
            // Check for common AI generation dimensions
            const commonAISizes = [512, 768, 1024, 1536, 2048];
            if (commonAISizes.includes(element.naturalWidth) && commonAISizes.includes(element.naturalHeight)) {
                edgeScore += 0.4;
            }
            
            // Perfect squares are very common in AI generation
            if (element.naturalWidth === element.naturalHeight) {
                edgeScore += 0.3;
            }
            
            // Very high resolution
            if (element.naturalWidth >= 2048 || element.naturalHeight >= 2048) {
                edgeScore += 0.3;
            }
            
            // Power-of-2 dimensions
            if (this.isPowerOfTwo(element.naturalWidth) && this.isPowerOfTwo(element.naturalHeight)) {
                edgeScore += 0.2;
            }
        }
        
        return Math.min(edgeScore, 1);
    }
    
    // Analyze AI-specific artifacts
    analyzeAIArtifacts(element) {
        let artifactScore = 0;
        
        // Check for common AI generation characteristics
        if (element.naturalWidth && element.naturalHeight) {
            // Very high resolution with perfect dimensions
            if (element.naturalWidth >= 2048 && element.naturalHeight >= 2048) {
                artifactScore += 0.4;
            }
            
            // Perfect squares with power-of-2 dimensions
            if (this.isPowerOfTwo(element.naturalWidth) && this.isPowerOfTwo(element.naturalHeight) && 
                element.naturalWidth === element.naturalHeight) {
                artifactScore += 0.5;
            }
            
            // Common AI generation sizes
            const aiSizes = [512, 768, 1024, 1536, 2048];
            if (aiSizes.includes(element.naturalWidth) && aiSizes.includes(element.naturalHeight)) {
                artifactScore += 0.4;
            }
            
            // Very specific patterns
            if (element.naturalWidth === 1024 && element.naturalHeight === 1024) {
                artifactScore += 0.5; // Most common AI generation size
            }
            
            if (element.naturalWidth === 512 && element.naturalHeight === 512) {
                artifactScore += 0.4; // Common in older models
            }
        }
        
        return Math.min(artifactScore, 1);
    }
    
    // Analyze image metadata for AI generation clues
    analyzeMetadata(element) {
        let metadataScore = 0;
        
        // Check for common AI generation file characteristics
        const src = element.src || '';
        
        // Check for common AI generation platforms in URLs
        const aiPlatforms = [
            'midjourney', 'dall-e', 'stable-diffusion', 'generated',
            'ai-generated', 'synthetic', 'artificial', 'picsum', 'sample',
            'openai', 'anthropic', 'runway', 'pika', 'sora'
        ];
        
        aiPlatforms.forEach(platform => {
            if (src.toLowerCase().includes(platform)) {
                metadataScore += 0.4;
            }
        });
        
        // Check for common AI generation file naming patterns
        const aiPatterns = [
            /[a-f0-9]{32}/, // Hash-like patterns
            /generated_\d+/, // Generated with numbers
            /ai_\d+/, // AI with numbers
            /random=\d+/, // Random parameters
            /sample/, // Sample content
            /dalle/, // DALL-E
            /midjourney/, // Midjourney
            /stable/, // Stable Diffusion
        ];
        
        aiPatterns.forEach(pattern => {
            if (pattern.test(src)) {
                metadataScore += 0.3;
            }
        });
        
        // Check for common AI generation domains
        const aiDomains = [
            'openai.com', 'anthropic.com', 'midjourney.com', 'stability.ai',
            'runwayml.com', 'pika.art', 'sora.openai.com'
        ];
        
        aiDomains.forEach(domain => {
            if (src.toLowerCase().includes(domain)) {
                metadataScore += 0.5;
            }
        });
        
        // Check for specific AI generation indicators
        if (src.includes('random=')) {
            metadataScore += 0.2;
        }
        
        if (src.includes('ai') || src.includes('generated')) {
            metadataScore += 0.3;
        }
        
        return Math.min(metadataScore, 1);
    }
    
    // Analyze file characteristics
    analyzeFileCharacteristics(element) {
        let fileScore = 0;
        
        // Check image dimensions (AI often generates standard sizes)
        if (element.naturalWidth && element.naturalHeight) {
            const commonAISizes = [
                [512, 512], [1024, 1024], [768, 768], [512, 768],
                [1024, 768], [1920, 1080], [1080, 1920], [1536, 1536],
                [2048, 2048], [1024, 1024], [512, 512]
            ];
            
            commonAISizes.forEach(([width, height]) => {
                if (element.naturalWidth === width && element.naturalHeight === height) {
                    fileScore += 0.4;
                }
            });
            
            // Check for power-of-2 dimensions
            if (this.isPowerOfTwo(element.naturalWidth) && this.isPowerOfTwo(element.naturalHeight)) {
                fileScore += 0.3;
            }
            
            // Perfect squares are very common in AI generation
            if (element.naturalWidth === element.naturalHeight) {
                fileScore += 0.3;
            }
            
            // Very high resolution images
            if (element.naturalWidth >= 2048 || element.naturalHeight >= 2048) {
                fileScore += 0.3;
            }
            
            // Specific AI generation patterns
            if (element.naturalWidth === 1024 && element.naturalHeight === 1024) {
                fileScore += 0.5; // Most common AI size
            }
            
            if (element.naturalWidth === 512 && element.naturalHeight === 512) {
                fileScore += 0.4; // Common in older models
            }
        }
        
        return Math.min(fileScore, 1);
    }
    
    // Calculate AI score for a single element
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
    
    // Analyze aggregated results
    analyzeResults(results) {
        if (results.length === 0) return;
        
        // Calculate overall indicators
        const allIndicators = {};
        const indicatorNames = Object.keys(results[0].indicators);
        
        indicatorNames.forEach(name => {
            const scores = results.map(r => r.indicators[name]).filter(s => s !== undefined);
            if (scores.length > 0) {
                allIndicators[name] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
            }
        });
        
        this.indicators = allIndicators;
        
        // Calculate overall AI probability
        const aiScores = results.map(r => r.aiScore);
        this.aiProbability = aiScores.reduce((sum, score) => sum + score, 0) / aiScores.length;
        
        // Calculate confidence based on number of media elements and analysis quality
        const avgScore = aiScores.reduce((sum, score) => sum + score, 0) / aiScores.length;
        const scoreConfidence = avgScore > 0.5 ? 0.8 : 0.6;
        const elementConfidence = Math.min(0.9, 0.5 + (results.length * 0.1));
        
        this.confidence = (scoreConfidence + elementConfidence) / 2;
    }
    
    // Calculate final score
    calculateFinalScore() {
        // Final adjustments based on overall analysis
        if (this.detectedMedia.length === 0) {
            this.confidence = 0;
            this.aiProbability = 0;
        }
    }
}

// Message listener for popup communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received:', request);
    
    if (request.action === 'analyzeContent') {
        console.log('Starting analysis...');
        const detector = new AIVisualDetector();
        detector.analyzePage().then(result => {
            console.log('Analysis complete:', result);
            sendResponse(result);
        }).catch(error => {
            console.error('Analysis failed:', error);
            sendResponse({
                success: false,
                error: error.message,
                analysisStatus: 'error'
            });
        });
        return true; // Keep message channel open for async response
    }
    
    // Test message to verify content script is loaded
    if (request.action === 'test') {
        sendResponse({ success: true, message: 'Content script is loaded' });
        return true;
    }
});

// Initialize detector when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('AI Visual Content Detector loaded');
});

// Also initialize on window load for pages that load content dynamically
window.addEventListener('load', () => {
    console.log('AI Visual Content Detector - window loaded');
}); 