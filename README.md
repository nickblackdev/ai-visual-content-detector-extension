# AI Visual Content Detector

A Chrome extension that analyzes web pages to detect AI-generated images and videos using advanced visual analysis algorithms.

## 🚀 Features

### Core Functionality
- **Real-time Analysis**: Instantly analyzes images and videos on any web page
- **AI Detection**: Uses multiple indicators to identify AI-generated content
- **Visual Results**: Beautiful, intuitive interface showing analysis results
- **Detailed Breakdown**: Shows individual analysis for each media element
- **Confidence Scoring**: Provides confidence levels for each detection

### Analysis Indicators
The extension analyzes content using multiple indicators:

1. **Perfect Symmetry** - Detects unnaturally perfect symmetrical patterns
2. **Unusual Patterns** - Identifies common AI generation patterns and dimensions
3. **Color Consistency** - Analyzes color distribution and consistency
4. **Texture Analysis** - Examines texture characteristics typical of AI generation
5. **Edge Detection** - Analyzes edge patterns and sharpness
6. **Metadata Analysis** - Checks file names, URLs, and metadata for AI indicators
7. **File Characteristics** - Examines file dimensions and properties
8. **AI Artifacts** - Detects specific artifacts common in AI-generated content

### Supported Content Types
- **Images**: JPG, PNG, WebP, and other common formats
- **Videos**: MP4, WebM, and other video formats
- **Minimum Size**: 100x100 pixels (filters out small icons and buttons)

## 📦 Installation

### Method 1: Load from Source (Recommended for Development)
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension icon should appear in your toolbar

### Method 2: Install from Chrome Web Store
*Coming soon - extension will be published to the Chrome Web Store*

## 🎯 Usage

### Basic Usage
1. **Navigate** to any webpage with images or videos
2. **Click** the AI Detector extension icon in your toolbar
3. **Wait** for the analysis to complete (usually 2-5 seconds)
4. **Review** the results showing AI probability and confidence

### Understanding Results

#### Overall Analysis
- **AI Probability Bar**: Visual representation of AI generation likelihood
- **Confidence Score**: How reliable the analysis is (0-100%)
- **Media Count**: Number of images/videos analyzed

#### Individual Media Analysis
Each image/video shows:
- **Thumbnail**: Visual preview of the media
- **Type**: Image or video indicator
- **Size**: Dimensions of the media
- **AI Score**: Individual AI probability for that element
- **Indicators**: Specific analysis results for that media

#### Confidence Levels
- **🟢 Green (Low)**: Likely human-generated content
- **🟡 Yellow (Medium)**: Mixed indicators
- **🔴 Red (High)**: Likely AI-generated content

### Re-analyzing
- Click the **"Re-analyze"** button to run a fresh analysis
- Useful for pages with dynamic content or after page updates

## 🔧 Technical Details

### Architecture
- **Popup Interface**: Reacts to user interaction and displays results
- **Content Script**: Analyzes page content and media elements
- **Background Service**: Handles extension lifecycle and messaging
- **Storage**: Uses Chrome's local storage for data persistence

### Analysis Algorithm
The extension uses a sophisticated multi-indicator approach:

1. **Media Extraction**: Identifies and filters relevant media elements
2. **Individual Analysis**: Analyzes each element using 8 different indicators
3. **Score Calculation**: Weighted combination of all indicators
4. **Confidence Assessment**: Evaluates analysis reliability
5. **Result Aggregation**: Combines individual results into overall assessment

### Performance
- **Fast Analysis**: Typically completes in 2-5 seconds
- **Efficient Filtering**: Only analyzes media larger than 100x100 pixels
- **CORS Handling**: Gracefully handles cross-origin restrictions
- **Memory Efficient**: Processes media in batches to avoid memory issues

## 🛠️ Development

### Project Structure
```
ai-detector/
├── manifest.json          # Extension configuration
├── popup.html            # Main popup interface
├── popup.js              # Popup functionality
├── popup.css             # Popup styling
├── content.js            # Content analysis script
├── background.js         # Background service worker
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── install.md            # Installation instructions
└── README.md            # This documentation
```

### Key Files
- **`manifest.json`**: Extension configuration and permissions
- **`popup.html/js/css`**: User interface and interaction logic
- **`content.js`**: Core analysis algorithm and media detection
- **`background.js`**: Extension lifecycle and message handling

### Development Setup
1. Clone the repository
2. Load as unpacked extension in Chrome
3. Make changes to source files
4. Click "Reload" in chrome://extensions/ to apply changes
5. Test by clicking the extension icon on any webpage

### Debugging
- **Console Logs**: Check browser console for detailed logs
- **Extension Page**: Use chrome://extensions/ for debugging
- **Content Script**: Logs appear in the webpage's console
- **Background**: Logs appear in the extension's service worker console

## 🎨 Customization

### Styling
The extension uses a modern, gradient-based design:
- **Primary Colors**: Purple gradient (#667eea to #764ba2)
- **Support Section**: Orange gradient for Buy Me a Coffee
- **Responsive Design**: Adapts to different screen sizes

### Analysis Sensitivity
The algorithm uses fixed thresholds:
- **High AI Probability**: ≥70% (Red indicator)
- **Medium AI Probability**: ≥50% (Yellow indicator)
- **Low AI Probability**: <50% (Green indicator)

## 🤝 Contributing

### How to Contribute
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Areas for Improvement
- **Additional Indicators**: New analysis methods
- **UI Enhancements**: Better visual feedback
- **Performance**: Faster analysis algorithms
- **Accuracy**: Improved detection rates

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Support

If you find this extension useful, consider supporting the developer:

[☕ Buy me a coffee](https://buymeacoffee.com/nickblack)

## 🔄 Version History

### v1.0.0
- Initial release
- Core AI detection functionality
- Visual analysis interface
- Multi-indicator analysis algorithm
- Support for images and videos

## 📞 Contact

For questions, issues, or feature requests:
- **GitHub Issues**: Report bugs or request features
- **Email**: Contact through GitHub profile
- **Support**: Buy me a coffee for priority support

---

**Note**: This extension analyzes visual patterns and characteristics commonly associated with AI-generated content. While it uses sophisticated algorithms, it should not be considered 100% accurate. Always use critical thinking and additional verification when important decisions depend on content authenticity. 