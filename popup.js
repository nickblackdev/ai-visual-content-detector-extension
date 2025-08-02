document.addEventListener('DOMContentLoaded', function() {
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const error = document.getElementById('error');
    const analyzeBtn = document.getElementById('analyze-btn');
    const retryBtn = document.getElementById('retry-btn');
    const buyCoffeeBtn = document.getElementById('buy-coffee-btn');
    const indicatorsHeader = document.getElementById('indicators-header');
    
    // Initialize the popup
    initPopup();
    
    // Event listeners
    analyzeBtn.addEventListener('click', analyzeCurrentPage);
    retryBtn.addEventListener('click', analyzeCurrentPage);
    buyCoffeeBtn.addEventListener('click', openBuyMeACoffee);
    indicatorsHeader.addEventListener('click', toggleIndicators);
    
    function initPopup() {
        // Show loading initially
        showLoading();
        
        // Analyze the current page
        analyzeCurrentPage();
    }
    
    function showLoading() {
        loading.style.display = 'block';
        results.style.display = 'none';
        error.style.display = 'none';
    }
    
    function showResults(data) {
        loading.style.display = 'none';
        results.style.display = 'block';
        error.style.display = 'none';
        
        updateResults(data);
    }
    
    function showError(message, status = 'error') {
        loading.style.display = 'none';
        results.style.display = 'none';
        error.style.display = 'block';
        
        const errorMessage = document.getElementById('error-message');
        
        // Show different messages based on analysis status
        switch (status) {
            case 'no_media':
                errorMessage.textContent = 'No images or videos found on this page. Try navigating to a page with more visual content.';
                break;
            case 'no_analyzable':
                errorMessage.textContent = 'Found media but unable to analyze due to browser restrictions. This often happens with images from external domains.';
                break;
            case 'cors_error':
                errorMessage.textContent = 'Cannot analyze images due to cross-origin restrictions. This is a browser security feature.';
                break;
            case 'connection_error':
                errorMessage.textContent = 'Cannot connect to the page. Try refreshing the page and clicking the extension again.';
                break;
            default:
                errorMessage.textContent = message || 'Failed to analyze the current page';
        }
    }
    
    function updateResults(data) {
        const confidenceScore = document.getElementById('confidence-score');
        const probabilityFill = document.getElementById('probability-fill');
        const indicatorList = document.getElementById('indicator-list');
        const mediaCount = document.getElementById('media-count');
        const mediaList = document.getElementById('media-list');
        
        // Update confidence score
        const confidence = Math.round(data.confidence * 100);
        confidenceScore.textContent = `${confidence}%`;
        
        // Update media count
        mediaCount.textContent = data.mediaCount || 0;
        
        // Update probability bar
        const aiProbability = data.aiProbability;
        probabilityFill.style.width = `${aiProbability * 100}%`;
        
        // Update confidence badge color
        const confidenceBadge = document.getElementById('confidence-badge');
        if (aiProbability >= 0.7) {
            confidenceBadge.style.background = '#dc3545';
        } else if (aiProbability >= 0.5) {
            confidenceBadge.style.background = '#ffc107';
        } else {
            confidenceBadge.style.background = '#28a745';
        }
        
        // Update indicators
        indicatorList.innerHTML = '';
        
        if (data.indicators && Object.keys(data.indicators).length > 0) {
            Object.entries(data.indicators).forEach(([name, value]) => {
                const indicatorItem = document.createElement('div');
                indicatorItem.className = 'indicator-item';
                
                const indicatorName = document.createElement('span');
                indicatorName.className = 'indicator-name';
                indicatorName.textContent = name;
                
                const indicatorValue = document.createElement('span');
                indicatorValue.className = 'indicator-value';
                
                // Determine indicator level
                let level = 'low';
                if (value > 0.7) level = 'high';
                else if (value > 0.4) level = 'medium';
                
                indicatorValue.classList.add(level);
                indicatorValue.textContent = `${Math.round(value * 100)}%`;
                
                indicatorItem.appendChild(indicatorName);
                indicatorItem.appendChild(indicatorValue);
                indicatorList.appendChild(indicatorItem);
            });
        } else {
            // Show message when no indicators are available
            const noIndicators = document.createElement('div');
            noIndicators.className = 'indicator-item';
            noIndicators.innerHTML = '<span class="indicator-name">No analysis data available</span>';
            indicatorList.appendChild(noIndicators);
        }
        
        // Update media list with individual analysis
        mediaList.innerHTML = '';
        
        if (data.mediaElements && data.mediaElements.length > 0) {
            data.mediaElements.forEach((media, index) => {
                const mediaItem = document.createElement('div');
                mediaItem.className = 'media-item';
                
                // Create media header
                const mediaHeader = document.createElement('div');
                mediaHeader.className = 'media-header';
                
                const mediaInfo = document.createElement('div');
                mediaInfo.className = 'media-info';
                
                // Create thumbnail
                const thumbnail = document.createElement('div');
                thumbnail.className = 'media-thumbnail';
                
                if (media.type === 'video') {
                    // Create a very simple video thumbnail that will definitely work
                    thumbnail.innerHTML = '🎥';
                    thumbnail.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
                    thumbnail.style.display = 'flex';
                    thumbnail.style.alignItems = 'center';
                    thumbnail.style.justifyContent = 'center';
                    thumbnail.style.fontSize = '16px';
                    thumbnail.style.color = 'white';
                    thumbnail.style.cursor = 'pointer';
                    thumbnail.style.borderRadius = '4px';
                    thumbnail.title = 'Click to open video';
                    
                    // Add click handler
                    thumbnail.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        if (media.src) {
                            try {
                                window.open(media.src, '_blank');
                            } catch (error) {
                                // Failed to open video
                            }
                        }
                    });
                    
                    // Add visual feedback
                    thumbnail.addEventListener('mousedown', () => {
                        thumbnail.style.transform = 'scale(0.95)';
                    });
                    
                    thumbnail.addEventListener('mouseup', () => {
                        thumbnail.style.transform = 'scale(1)';
                    });
                    
                } else {
                    // Create image thumbnail
                    const img = document.createElement('img');
                    
                    // Use captured image data if available to prevent dynamic content issues
                    if (media.imageDataUrl) {
                        img.src = media.imageDataUrl;
                    } else {
                        img.src = media.src;
                    }
                    
                    img.alt = `Preview of ${media.type}`;
                    img.style.cursor = 'pointer';
                    img.onerror = () => {
                        thumbnail.textContent = '🖼️';
                        thumbnail.style.background = '#f8f9fa';
                        thumbnail.style.cursor = 'pointer';
                    };
                    
                                        // Add click handler to open image in new tab
                    img.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Use the media.src from analysis, not the img.src to ensure we get the correct URL
                        const targetUrl = media.src || img.src;
                        
                        if (targetUrl) {
                            try {
                                window.open(targetUrl, '_blank');
                            } catch (error) {
                                // Failed to open image
                            }
                        }
                    });
                    
                    // Add visual feedback on click
                    img.addEventListener('mousedown', () => {
                        img.style.transform = 'scale(0.95)';
                    });
                    
                    img.addEventListener('mouseup', () => {
                        img.style.transform = 'scale(1)';
                    });
                    
                    // Add tooltip with more information
                    const tooltipText = `Click to open image\nAnalyzed: ${media.analyzedAt ? new Date(media.analyzedAt).toLocaleTimeString() : 'Unknown'}`;
                    img.title = tooltipText;
                    
                    // Add a small indicator if the image might be dynamic
                    if (media.originalSrc && media.originalSrc !== media.src) {
                        const dynamicIndicator = document.createElement('div');
                        dynamicIndicator.style.cssText = `
                            position: absolute;
                            top: 2px;
                            left: 2px;
                            background: rgba(255, 193, 7, 0.9);
                            color: #333;
                            padding: 1px 4px;
                            border-radius: 2px;
                            font-size: 8px;
                            font-weight: 600;
                            z-index: 2;
                        `;
                        dynamicIndicator.textContent = 'DYNAMIC';
                        dynamicIndicator.title = 'This image source may have changed since analysis';
                        thumbnail.appendChild(dynamicIndicator);
                    }
                    
                    thumbnail.appendChild(img);
                }
                
                const mediaDetailsInfo = document.createElement('div');
                mediaDetailsInfo.className = 'media-details-info';
                
                const mediaType = document.createElement('span');
                mediaType.className = 'media-type';
                mediaType.textContent = media.type;
                
                const mediaSize = document.createElement('span');
                mediaSize.className = 'media-size';
                mediaSize.textContent = media.size;
                
                mediaDetailsInfo.appendChild(mediaType);
                mediaDetailsInfo.appendChild(mediaSize);
                
                mediaInfo.appendChild(thumbnail);
                mediaInfo.appendChild(mediaDetailsInfo);
                
                // Create AI score badge
                const aiScore = document.createElement('span');
                aiScore.className = 'ai-score';
                const aiScorePercent = Math.round(media.aiScore * 100);
                
                if (aiScorePercent > 60) {
                    aiScore.classList.add('high');
                    aiScore.textContent = `AI: ${aiScorePercent}%`;
                } else if (aiScorePercent > 30) {
                    aiScore.classList.add('medium');
                    aiScore.textContent = `AI: ${aiScorePercent}%`;
                } else {
                    aiScore.classList.add('low');
                    aiScore.textContent = `Human: ${aiScorePercent}%`;
                }
                
                mediaHeader.appendChild(mediaInfo);
                mediaHeader.appendChild(aiScore);
                mediaItem.appendChild(mediaHeader);
                
                // Create indicators for this media element
                if (media.indicators) {
                    const mediaIndicators = document.createElement('div');
                    mediaIndicators.className = 'media-indicators';
                    
                    Object.entries(media.indicators).forEach(([name, value]) => {
                        if (value > 0.3) { // Only show significant indicators
                            const indicator = document.createElement('span');
                            indicator.className = 'media-indicator';
                            
                            if (value > 0.6) {
                                indicator.classList.add('ai');
                                indicator.textContent = `${name}: ${Math.round(value * 100)}%`;
                            } else {
                                indicator.classList.add('human');
                                indicator.textContent = `${name}: ${Math.round(value * 100)}%`;
                            }
                            
                            mediaIndicators.appendChild(indicator);
                        }
                    });
                    
                    mediaItem.appendChild(mediaIndicators);
                }
                
                // Add source URL (truncated)
                if (media.src) {
                    const mediaSrc = document.createElement('div');
                    mediaSrc.className = 'media-src';
                    const truncatedSrc = media.src.length > 50 ? media.src.substring(0, 50) + '...' : media.src;
                    mediaSrc.textContent = truncatedSrc;
                    mediaItem.appendChild(mediaSrc);
                }
                
                mediaList.appendChild(mediaItem);
            });
        } else {
            const noMediaItem = document.createElement('div');
            noMediaItem.className = 'media-item';
            noMediaItem.textContent = 'No media elements found';
            noMediaItem.style.textAlign = 'center';
            noMediaItem.style.color = '#666';
            mediaList.appendChild(noMediaItem);
        }
    }
    
    async function analyzeCurrentPage() {
        showLoading();
        
        try {
            // Get the active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab) {
                throw new Error('No active tab found');
            }
            
            // Check if we can inject the content script
            if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
                showError('Cannot analyze this type of page. Try a regular website.', 'connection_error');
                return;
            }
            
            // Try to inject the content script if it's not already loaded
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js']
                });
            } catch (injectionError) {
                // Content script already loaded or injection failed
            }
            
            // Send message to content script to analyze the page
            const response = await chrome.tabs.sendMessage(tab.id, {
                action: 'analyzeContent'
            });
            
            if (response && response.success) {
                showResults(response.data);
            } else {
                // Handle different error states
                const status = response?.data?.analysisStatus || 'error';
                const errorMsg = response?.error || 'Failed to analyze visual content';
                showError(errorMsg, status);
            }
            
        } catch (error) {
            // Handle specific connection errors
            if (error.message.includes('Could not establish connection') || 
                error.message.includes('Receiving end does not exist')) {
                showError('Cannot connect to the page. Try refreshing the page and clicking the extension again.', 'connection_error');
            } else {
                showError(error.message || 'Failed to analyze the current page');
            }
        }
    }
    
    function openBuyMeACoffee() {
        // Open Buy Me a Coffee link in a new tab
        chrome.tabs.create({
            url: 'https://buymeacoffee.com/nickblack'
        });
    }
    
    function toggleIndicators() {
        const indicatorList = document.getElementById('indicator-list');
        const collapseIcon = document.querySelector('.collapse-icon');
        
        if (indicatorList.classList.contains('collapsed')) {
            // Expand
            indicatorList.classList.remove('collapsed');
            indicatorList.classList.add('expanded');
            collapseIcon.classList.remove('collapsed');
            collapseIcon.textContent = '▲';
        } else {
            // Collapse
            indicatorList.classList.remove('expanded');
            indicatorList.classList.add('collapsed');
            collapseIcon.classList.add('collapsed');
            collapseIcon.textContent = '▼';
        }
    }
}); 