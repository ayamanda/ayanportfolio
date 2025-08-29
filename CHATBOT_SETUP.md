# Enhanced Chatbot Setup Guide

## Overview
The chatbot has been upgraded from Groq SDK to Google's Gemini AI for better performance, reliability, and advanced features.

## Key Improvements

### 🚀 **Enhanced AI Performance**
- **Google Gemini 2.0 Flash**: Latest AI model with improved reasoning and faster responses
- **Better Context Understanding**: More accurate and contextual responses
- **Optimized Token Usage**: Efficient token management for cost-effective operations

### 📱 **Mobile-First Design**
- **Full-Screen Mobile Experience**: Takes full screen on mobile devices instead of overlay
- **Desktop Overlay**: Maintains overlay behavior on desktop for better UX
- **Safe Area Support**: Proper handling of iPhone notches and Android navigation bars
- **Keyboard-Aware Interface**: Smart input positioning when mobile keyboard appears

### ✨ **Enhanced Features**
- **Improved System Prompts**: More detailed and structured AI instructions
- **Better Suggested Questions**: More engaging and emoji-enhanced suggestions
- **Enhanced Animations**: Smoother transitions and micro-interactions
- **Improved Error Handling**: Better error messages and fallback mechanisms

## Setup Instructions

### 1. Get Google Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Update Environment Variables
Replace the placeholder in your `.env` file:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Install Dependencies
The required dependencies are already installed:
```bash
npm install @google/genai
```

### 4. Test the Chatbot
1. Start your development server: `npm run dev`
2. Click the chat button in the bottom-right corner
3. Enter your name when prompted
4. Test with sample questions

## Mobile Experience

### Desktop Behavior
- Appears as an overlay window in bottom-right corner
- Click outside to close
- Maintains website visibility in background

### Mobile Behavior
- Takes full screen for better usability
- Smooth slide-up animation from bottom
- No background website visibility (prevents confusion)
- Proper safe area handling for modern phones

## API Configuration

### Available Models
- **Default**: `gemini-2.0-flash-exp` (Fast and efficient)
- **Premium**: `gemini-1.5-pro` (More capable for complex queries)

### Request Parameters
```typescript
{
  temperature: 0.7,        // Creativity level (0-1)
  maxOutputTokens: 1024,   // Response length limit
  topP: 1,                 // Nucleus sampling
  thinkingBudget: 0        // Disabled for faster responses
}
```

## Troubleshooting

### Common Issues

1. **API Key Error**
   - Ensure `GEMINI_API_KEY` is set in your `.env` file
   - Verify the API key is valid and active

2. **Mobile Layout Issues**
   - Clear browser cache
   - Test on actual mobile device (not just browser dev tools)

3. **Slow Responses**
   - Check your internet connection
   - Verify API quota limits

### Error Codes
- `CONFIG_ERROR`: API key configuration issue
- `TIMEOUT`: Request took too long (30s limit)
- `RATE_LIMIT`: API quota exceeded
- `VALIDATION_ERROR`: Invalid request format

## Performance Optimizations

### Implemented Optimizations
- **Thinking Disabled**: Faster response times by disabling internal reasoning
- **Token Optimization**: Efficient prompt engineering
- **Caching**: Message history stored locally
- **Error Recovery**: Graceful fallbacks for API failures

### Monitoring
- Response times logged in browser console
- Token usage tracked for optimization
- Error rates monitored for reliability

## Future Enhancements

### Planned Features
- **Voice Input**: Speech-to-text integration
- **File Uploads**: Document and image analysis
- **Multi-language**: Support for multiple languages
- **Analytics**: Conversation insights and metrics

### Customization Options
- **Themes**: Light/dark mode support
- **Personalities**: Different AI assistant personalities
- **Custom Prompts**: Industry-specific conversation styles

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify environment variables are set correctly
3. Test with a fresh browser session
4. Contact the development team with specific error details

---

**Note**: The old Groq SDK integration is still available as fallback if needed, but the new Gemini integration is recommended for production use.