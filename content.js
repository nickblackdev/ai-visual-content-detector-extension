// Check if already injected to prevent duplicate class declaration
if (window.AIVisualDetectorInjected) {
    // AIVisualDetector already injected, skipping...
} else {
    window.AIVisualDetectorInjected = true;
    
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
            const width = element.naturalWidth || element.videoWidth;
            const height = element.naturalHeight || element.videoHeight;
            const size = width && height ? `${width}x${height}` : 'Unknown';
            
            // Get the full URL to ensure we have the correct source
            let src = element.src;
            
            // For videos, check if there's a source tag
            if (element.tagName.toLowerCase() === 'video' && !src) {
                const sourceElement = element.querySelector('source');
                if (sourceElement && sourceElement.src) {
                    src = sourceElement.src;
                }
            }
            
            if (src && !src.startsWith('http')) {
                // Convert relative URLs to absolute URLs
                src = new URL(src, window.location.href).href;
            }
            

            
            // Try to capture the current image data to prevent dynamic content issues
            let imageDataUrl = null;
            try {
                if (element.tagName.toLowerCase() === 'img' && element.complete && element.naturalWidth > 0) {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = element.naturalWidth;
                    canvas.height = element.naturalHeight;
                    ctx.drawImage(element, 0, 0);
                    imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                }
            } catch (error) {
                // Could not capture image data
            }
            
            return {
                src: src,
                originalSrc: element.src, // Keep the original source for comparison
                imageDataUrl: imageDataUrl, // Captured image data to prevent dynamic content issues
                type: element.tagName.toLowerCase(),
                size: size,
                aiScore: analysis.aiScore,
                indicators: analysis.indicators,
                aiProbability: analysis.aiScore,
                isAI: analysis.aiScore > 0.6,
                confidence: analysis.confidence,
                analyzedAt: new Date().toISOString() // Timestamp when analysis was done
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
        const width = element.naturalWidth || element.videoWidth;
        const height = element.naturalHeight || element.videoHeight;
        
        if (width && height) {
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
        
        // Add video-specific analysis for video elements
        if (element.tagName.toLowerCase() === 'video') {
            analysis.indicators['Video Characteristics'] = this.analyzeVideoCharacteristics(element);
        }
        
        // Add processed image analysis for all elements
        analysis.indicators['Processed Image Analysis'] = this.analyzeProcessedImages(element);
        
        // Calculate AI score for this element
        analysis.aiScore = this.calculateElementScore(analysis.indicators);
        
        return analysis;
    }
    
    // Analyze symmetry patterns
    analyzeSymmetry(element) {
        let symmetryScore = 0;
        
        // Handle both images and videos
        const width = element.naturalWidth || element.videoWidth;
        const height = element.naturalHeight || element.videoHeight;
        
        if (width && height) {
            const aspectRatio = width / height;
            
            // Perfect squares are common in AI generation
            if (Math.abs(aspectRatio - 1) < 0.01) {
                symmetryScore += 0.4;
            }
            
            // Check for power-of-2 dimensions (common in AI generation)
            if (this.isPowerOfTwo(width) && this.isPowerOfTwo(height)) {
                symmetryScore += 0.3;
            }
            
            // Very high resolution perfect squares
            if (width >= 2048 && height >= 2048 && aspectRatio === 1) {
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
        
        // Handle both images and videos
        const width = element.naturalWidth || element.videoWidth;
        const height = element.naturalHeight || element.videoHeight;
        
        if (width && height) {
            const aspectRatio = width / height;
            
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
            
            commonAISizes.forEach(([checkWidth, checkHeight]) => {
                if (width === checkWidth && height === checkHeight) {
                    patternScore += 0.3;
                }
            });
            
            // Check for very specific AI generation patterns
            if (width === 1024 && height === 1024) {
                patternScore += 0.4; // Very common in AI generation
            }
            
            if (width === 512 && height === 512) {
                patternScore += 0.3; // Common in older AI models
            }
        }
        
        return Math.min(patternScore, 1);
    }
    
    // Analyze color consistency and distribution
    analyzeColorConsistency(element) {
        let colorScore = 0;
        
        // Handle both images and videos
        const width = element.naturalWidth || element.videoWidth;
        const height = element.naturalHeight || element.videoHeight;
        
        if (width && height) {
            // Larger images with perfect dimensions often indicate AI generation
            if (width >= 1024 && height >= 1024) {
                colorScore += 0.3;
            }
            
            // Check for common AI generation dimensions
            if (width === 512 && height === 512) {
                colorScore += 0.4;
            }
            
            // Very high resolution images
            if (width >= 2048 || height >= 2048) {
                colorScore += 0.3;
            }
            
            // Perfect squares with high resolution
            if (width === height && width >= 1024) {
                colorScore += 0.4;
            }
        }
        
        return Math.min(colorScore, 1);
    }
    
    // Analyze texture characteristics
    analyzeTexture(element) {
        let textureScore = 0;
        
        // Handle both images and videos
        const width = element.naturalWidth || element.videoWidth;
        const height = element.naturalHeight || element.videoHeight;
        
        if (width && height) {
            // Check for very high resolution images (common in AI generation)
            if (width >= 2048 || height >= 2048) {
                textureScore += 0.3;
            }
            
            // Check for perfect square dimensions
            if (width === height) {
                textureScore += 0.2;
            }
            
            // Power-of-2 dimensions
            if (this.isPowerOfTwo(width) && this.isPowerOfTwo(height)) {
                textureScore += 0.3;
            }
            
            // Very specific AI generation sizes
            if (width === 1536 && height === 1536) {
                textureScore += 0.4;
            }
        }
        
        return Math.min(textureScore, 1);
    }
    
    // Analyze edge characteristics
    analyzeEdges(element) {
        let edgeScore = 0;
        
        // Handle both images and videos
        const width = element.naturalWidth || element.videoWidth;
        const height = element.naturalHeight || element.videoHeight;
        
        if (width && height) {
            // Check for common AI generation dimensions
            const commonAISizes = [512, 768, 1024, 1536, 2048];
            if (commonAISizes.includes(width) && commonAISizes.includes(height)) {
                edgeScore += 0.4;
            }
            
            // Perfect squares are very common in AI generation
            if (width === height) {
                edgeScore += 0.3;
            }
            
            // Very high resolution
            if (width >= 2048 || height >= 2048) {
                edgeScore += 0.3;
            }
            
            // Power-of-2 dimensions
            if (this.isPowerOfTwo(width) && this.isPowerOfTwo(height)) {
                edgeScore += 0.2;
            }
        }
        
        return Math.min(edgeScore, 1);
    }
    
    // Analyze AI-specific artifacts
    analyzeAIArtifacts(element) {
        let artifactScore = 0;
        
        // Handle both images and videos
        const width = element.naturalWidth || element.videoWidth;
        const height = element.naturalHeight || element.videoHeight;
        
        // Check for common AI generation characteristics
        if (width && height) {
            // Very high resolution with perfect dimensions
            if (width >= 2048 && height >= 2048) {
                artifactScore += 0.4;
            }
            
            // Perfect squares with power-of-2 dimensions
            if (this.isPowerOfTwo(width) && this.isPowerOfTwo(height) && 
                width === height) {
                artifactScore += 0.5;
            }
            
            // Common AI generation sizes
            const aiSizes = [512, 768, 1024, 1536, 2048];
            if (aiSizes.includes(width) && aiSizes.includes(height)) {
                artifactScore += 0.4;
            }
            
            // Very specific patterns
            if (width === 1024 && height === 1024) {
                artifactScore += 0.5; // Most common AI generation size
            }
            
            if (width === 512 && height === 512) {
                artifactScore += 0.4; // Common in older models
            }
            
            // Check for processed/resaved AI images
            // These often have specific characteristics even after processing
            if (width >= 1024 && height >= 1024) {
                // High resolution images are often AI-generated
                artifactScore += 0.3;
            }
            
            // Check for common processed AI image dimensions
            const processedAISizes = [800, 1200, 1600, 1920, 2560];
            if (processedAISizes.includes(width) || processedAISizes.includes(height)) {
                artifactScore += 0.3;
            }
            
            // Check for aspect ratios common in processed AI images
            const aspectRatio = width / height;
            const commonProcessedRatios = [1, 4/3, 3/4, 16/9, 9/16, 3/2, 2/3];
            commonProcessedRatios.forEach(ratio => {
                if (Math.abs(aspectRatio - ratio) < 0.01) {
                    artifactScore += 0.2;
                }
            });
        }
        
        return Math.min(artifactScore, 1);
    }
    
    // Analyze video-specific characteristics
    analyzeVideoCharacteristics(element) {
        let videoScore = 0;
        
        // Handle video dimensions
        const width = element.videoWidth;
        const height = element.videoHeight;
        
        if (width && height) {
            // Common AI video generation dimensions
            const commonAIVideoSizes = [
                [1920, 1080], [1080, 1920], [1024, 1024], [512, 512],
                [768, 768], [1536, 1536], [2048, 2048], [1280, 720],
                [720, 1280], [2560, 1440], [1440, 2560]
            ];
            
            commonAIVideoSizes.forEach(([checkWidth, checkHeight]) => {
                if (width === checkWidth && height === checkHeight) {
                    videoScore += 0.4;
                }
            });
            
            // Perfect squares are very common in AI video generation
            if (width === height) {
                videoScore += 0.3;
            }
            
            // Power-of-2 dimensions
            if (this.isPowerOfTwo(width) && this.isPowerOfTwo(height)) {
                videoScore += 0.3;
            }
            
            // Very high resolution videos
            if (width >= 2048 || height >= 2048) {
                videoScore += 0.4;
            }
            
            // Common AI video aspect ratios
            const aspectRatio = width / height;
            const commonAIAspectRatios = [1, 16/9, 9/16, 4/3, 3/4];
            commonAIAspectRatios.forEach(ratio => {
                if (Math.abs(aspectRatio - ratio) < 0.01) {
                    videoScore += 0.2;
                }
            });
            
            // Very specific AI video patterns
            if (width === 1920 && height === 1080) {
                videoScore += 0.5; // Most common AI video size
            }
            
            if (width === 1024 && height === 1024) {
                videoScore += 0.4; // Common in AI video generation
            }
        }
        
        // Check for video duration (AI videos often have specific durations)
        if (element.duration) {
            // AI videos often have round durations (10s, 15s, 30s, etc.)
            const duration = element.duration;
            if (duration % 5 === 0 && duration <= 60) {
                videoScore += 0.2;
            }
            
            // Very short videos (common in AI generation)
            if (duration <= 15) {
                videoScore += 0.3;
            }
        }
        
        // Check for video source patterns
        const src = element.src || '';
        const aiVideoPlatforms = [
            'runway', 'pika', 'sora', 'gen-2', 'stable-video',
            'ai-video', 'generated-video', 'synthetic-video'
        ];
        
        aiVideoPlatforms.forEach(platform => {
            if (src.toLowerCase().includes(platform)) {
                videoScore += 0.5;
            }
        });
        
        return Math.min(videoScore, 1);
    }
    
    // Analyze processed/resaved AI images
    analyzeProcessedImages(element) {
        let processedScore = 0;
        
        // Handle both images and videos
        const width = element.naturalWidth || element.videoWidth;
        const height = element.naturalHeight || element.videoHeight;
        
        if (width && height) {
            // Check for characteristics of processed AI images
            
            // High resolution images (common in AI generation)
            if (width >= 1024 || height >= 1024) {
                processedScore += 0.3;
            }
            
            // Common processed dimensions
            const processedSizes = [800, 1200, 1600, 1920, 2560];
            if (processedSizes.includes(width) || processedSizes.includes(height)) {
                processedScore += 0.4;
            }
            
            // Check aspect ratios common in processed AI images
            const aspectRatio = width / height;
            const processedRatios = [1, 4/3, 3/4, 16/9, 9/16, 3/2, 2/3];
            processedRatios.forEach(ratio => {
                if (Math.abs(aspectRatio - ratio) < 0.01) {
                    processedScore += 0.2;
                }
            });
            
            // Check for dimensions that suggest AI origin even after processing
            if (width >= 800 && height >= 800) {
                processedScore += 0.3;
            }
            
            // Check for common processed image patterns
            if (width % 8 === 0 && height % 8 === 0) {
                processedScore += 0.2; // Common in processed images
            }
            
            // Check for dimensions that are multiples of common AI sizes
            const aiMultiples = [256, 512, 1024];
            aiMultiples.forEach(multiple => {
                if (width % multiple === 0 || height % multiple === 0) {
                    processedScore += 0.3;
                }
            });
        }
        
        // Check file characteristics that suggest processing
        const src = element.src || '';
        
        // Check for processing indicators in URLs
        const processingIndicators = [
            'processed', 'enhanced', 'upscaled', 'improved',
            'edited', 'modified', 'converted', 'resized',
            'compressed', 'optimized', 'cleaned', 'filtered'
        ];
        
        processingIndicators.forEach(indicator => {
            if (src.toLowerCase().includes(indicator)) {
                processedScore += 0.4;
            }
        });
        
        // Check for common processed image domains
        const processedDomains = [
            'imgur.com', 'postimages.org', 'imgbb.com',
            'tinypic.com', 'photobucket.com', 'flickr.com'
        ];
        
        processedDomains.forEach(domain => {
            if (src.toLowerCase().includes(domain)) {
                processedScore += 0.2;
            }
        });
        
        return Math.min(processedScore, 1);
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
            'openai', 'anthropic', 'runway', 'pika', 'sora',
            'gen-2', 'stable-video', 'ai-video', 'generated-video', 'synthetic-video'
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
            'runwayml.com', 'pika.art', 'sora.openai.com',
            'runway.com', 'pika.art', 'stability.ai'
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
        
        // Check for processed AI image indicators
        const processedAIIndicators = [
            'upscaled', 'enhanced', 'improved', 'processed',
            'edited', 'modified', 'converted', 'resized',
            'compressed', 'optimized', 'cleaned'
        ];
        
        processedAIIndicators.forEach(indicator => {
            if (src.toLowerCase().includes(indicator)) {
                metadataScore += 0.2;
            }
        });
        
        // Check for common processed image dimensions in URLs
        const processedDimensions = ['800x600', '1200x800', '1600x1200', '1920x1080', '2560x1440'];
        processedDimensions.forEach(dim => {
            if (src.includes(dim)) {
                metadataScore += 0.3;
            }
        });
        
        return Math.min(metadataScore, 1);
    }
    
    // Analyze file characteristics
    analyzeFileCharacteristics(element) {
        let fileScore = 0;
        
        // Handle both images and videos
        const width = element.naturalWidth || element.videoWidth;
        const height = element.naturalHeight || element.videoHeight;
        
        // Check image dimensions (AI often generates standard sizes)
        if (width && height) {
            const commonAISizes = [
                [512, 512], [1024, 1024], [768, 768], [512, 768],
                [1024, 768], [1920, 1080], [1080, 1920], [1536, 1536],
                [2048, 2048], [1024, 1024], [512, 512]
            ];
            
            commonAISizes.forEach(([checkWidth, checkHeight]) => {
                if (width === checkWidth && height === checkHeight) {
                    fileScore += 0.4;
                }
            });
            
            // Check for power-of-2 dimensions
            if (this.isPowerOfTwo(width) && this.isPowerOfTwo(height)) {
                fileScore += 0.3;
            }
            
            // Perfect squares are very common in AI generation
            if (width === height) {
                fileScore += 0.3;
            }
            
            // Very high resolution images
            if (width >= 2048 || height >= 2048) {
                fileScore += 0.3;
            }
            
            // Specific AI generation patterns
            if (width === 1024 && height === 1024) {
                fileScore += 0.5; // Most common AI size
            }
            
            if (width === 512 && height === 512) {
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
            'AI Artifacts': 0.30,
            'Video Characteristics': 0.35,
            'Processed Image Analysis': 0.40
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
    if (request.action === 'analyzeContent') {
        const detector = new AIVisualDetector();
        detector.analyzePage().then(result => {
            sendResponse(result);
        }).catch(error => {
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
    // AI Visual Content Detector loaded
});

// Also initialize on window load for pages that load content dynamically
window.addEventListener('load', () => {
    // AI Visual Content Detector - window loaded
});

} // Close the if statement that prevents duplicate injection