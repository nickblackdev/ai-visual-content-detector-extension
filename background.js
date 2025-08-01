// Background service worker for AI Content Detector
chrome.runtime.onInstalled.addListener(() => {
    console.log('AI Content Detector extension installed');
    
    // Set default settings
    chrome.storage.local.set({
        settings: {
            autoAnalyze: true,
            showNotifications: true,
            analysisThreshold: 0.7
        }
    });
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    // This will open the popup automatically due to manifest configuration
    console.log('Extension icon clicked on tab:', tab.id);
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSettings') {
        chrome.storage.local.get(['settings'], (result) => {
            sendResponse({ settings: result.settings || {} });
        });
        return true;
    }
    
    if (request.action === 'updateSettings') {
        chrome.storage.local.set({ settings: request.settings }, () => {
            sendResponse({ success: true });
        });
        return true;
    }
    
    if (request.action === 'showNotification') {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'AI Content Detector',
            message: request.message
        });
        sendResponse({ success: true });
        return true;
    }
});

// Handle tab updates to potentially auto-analyze
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
        // Check if auto-analyze is enabled
        chrome.storage.local.get(['settings'], (result) => {
            const settings = result.settings || {};
            if (settings.autoAnalyze) {
                // Auto-analyze could be triggered here if needed
                console.log('Page loaded, auto-analyze enabled');
            }
        });
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('AI Content Detector extension started');
}); 