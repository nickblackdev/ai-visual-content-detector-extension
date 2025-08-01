# Installation Guide for AI Content Detector

## Prerequisites
- Google Chrome browser
- Basic knowledge of Chrome extensions

## Step-by-Step Installation

### 1. Download the Extension
- Download or clone this repository to your computer
- Extract the files if they're in a compressed format

### 2. Create Icon Files (Required)
Before loading the extension, you need to create icon files:

**Option A: Use Online Icon Generator**
1. Go to an online icon generator (like favicon.io, flaticon.com, or similar)
2. Create a simple robot or AI-themed icon
3. Download in PNG format
4. Create three versions:
   - 16x16 pixels → save as `icons/icon16.png`
   - 48x48 pixels → save as `icons/icon48.png`
   - 128x128 pixels → save as `icons/icon128.png`

**Option B: Use Simple Icons**
1. Find any simple PNG icon online
2. Resize it to the required dimensions
3. Save with the correct filenames in the `icons/` folder

### 3. Load the Extension in Chrome

1. **Open Chrome Extensions Page**
   - Open Google Chrome
   - Type `chrome://extensions/` in the address bar
   - Press Enter

2. **Enable Developer Mode**
   - Look for the "Developer mode" toggle in the top-right corner
   - Click it to enable developer mode

3. **Load the Extension**
   - Click the "Load unpacked" button
   - Navigate to the folder containing your extension files
   - Select the folder and click "Select Folder"

4. **Verify Installation**
   - The extension should now appear in your extensions list
   - You should see the AI Detector icon in your Chrome toolbar

### 4. Test the Extension

1. **Open the Test Page**
   - Open the `test-page.html` file in Chrome
   - Or navigate to any webpage with text content

2. **Run Analysis**
   - Click the AI Detector icon in your toolbar
   - Wait for the analysis to complete
   - View the results in the popup

## Troubleshooting

### Extension Won't Load
- **Check File Structure**: Ensure all files are in the correct locations
- **Verify Icons**: Make sure icon files exist and are valid PNG images
- **Check Manifest**: Verify `manifest.json` is properly formatted
- **Console Errors**: Open Chrome DevTools and check for error messages

### Analysis Not Working
- **Content Length**: Ensure the page has sufficient text content (500+ characters)
- **Page Type**: Works best on article pages, blog posts, or content-heavy sites
- **Refresh Page**: Try refreshing the page and clicking the extension again

### Icons Not Showing
- **File Names**: Ensure icon files are named exactly as specified
- **File Format**: Icons must be PNG format
- **File Sizes**: Icons must match the exact pixel dimensions
- **Reload Extension**: After adding icons, reload the extension

## File Structure Check

Ensure your extension folder contains these files:
```
ai-detector/
├── manifest.json
├── popup.html
├── popup.css
├── popup.js
├── content.js
├── background.js
├── options.html
├── options.js
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── README.md
├── test-page.html
└── install.md
```

## Next Steps

After successful installation:
1. Test the extension on various websites
2. Adjust settings in the options page
3. Explore different content types to see how the detection works
4. Share feedback or report issues

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all files are present and correctly named
3. Try reloading the extension
4. Check Chrome's developer console for error messages

## Privacy Note

This extension:
- Analyzes content locally in your browser
- Does not send data to external servers
- Does not collect or store personal information
- Respects your browsing privacy 