import { GoogleGenerativeAI } from '@google/generative-ai';

class AIService {
  constructor() {
    this.genAI = null;
    this.apiKey = null;
    this.defaultModel = null;
    this.maxTokens = null;
  }

  _initialize() {
    if (!this.genAI) {
      this.apiKey = process.env.GOOGLE_API_KEY;
      this.defaultModel = process.env.AI_MODEL || 'gemini-2.0-flash-lite';
      this.maxTokens = parseInt(process.env.AI_MAX_TOKENS) || 4096;
      
      if (!this.apiKey) {
        throw new Error('GOOGLE_API_KEY is required');
      }
      
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    }
  }

  async generateComponent(prompt, model = null, context = null) {
    this._initialize();
    
    try {
      const systemPrompt = `You are an expert React component generator. Your task is to create high-quality, functional React components based on user requirements.

Guidelines:
1. Generate clean, modern React functional components using hooks
2. Use CSS modules or inline styles for styling
3. Make components responsive and accessible
4. Include PropTypes or TypeScript types when appropriate
5. Follow React best practices and conventions
6. Make the component self-contained and reusable
7. Use semantic HTML elements
8. Include proper ARIA attributes for accessibility

Response format:
Return a JSON object with the following structure:
{
  "jsx": "// The complete React component code",
  "css": "/* The CSS styles for the component */",
  "props": {
    "// Example props object - use strings for function props like 'onClick': 'function'"
  },
  "description": "Brief description of what the component does",
  "componentName": "ComponentName"
}

Important:
- JSX should be a complete, functional React component
- CSS should be valid CSS that styles the component
- Props should be an example object showing how to use the component (use string values for functions)
- Component should be named appropriately and use PascalCase
- For function props in the example, use string descriptions like "onClick": "function"
`;

      let fullPrompt = systemPrompt + '\n\n';

      // Add context if provided (previous components/conversation)
      if (context && context.previousComponents) {
        fullPrompt += `Previous component context:\n${JSON.stringify(context.previousComponents, null, 2)}\n\n`;
      }

      if (context && context.chatHistory) {
        // Add recent chat history for context
        const recentMessages = context.chatHistory.slice(-3); // Last 3 messages
        fullPrompt += 'Recent conversation:\n';
        recentMessages.forEach(msg => {
          fullPrompt += `${msg.role}: ${msg.content}\n`;
        });
        fullPrompt += '\n';
      }

      // Add the current prompt
      fullPrompt += `User Request: ${prompt}`;

      const modelInstance = this.genAI.getGenerativeModel({ 
        model: model || this.defaultModel,
        generationConfig: {
          maxOutputTokens: this.maxTokens,
          temperature: 0.7,
        }
      });

      const result = await modelInstance.generateContent(fullPrompt);
      const response = await result.response;
      const aiResponse = response.text();
      
      // Try to parse JSON response
      let componentData;
      try {
        // First, try to find JSON in the response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          let jsonText = jsonMatch[0];
          
          // Clean up function props that break JSON parsing
          jsonText = jsonText.replace(/:\s*\(\)\s*=>\s*\{[^}]*\}/g, ': "function() { ... }"');
          jsonText = jsonText.replace(/:\s*function\s*\([^)]*\)\s*\{[^}]*\}/g, ': "function() { ... }"');
          
          componentData = JSON.parse(jsonText);
        } else {
          throw new Error('No JSON found in response');
        }
        
        // If the JSX is wrapped in markdown, extract it
        if (componentData.jsx && componentData.jsx.includes('```')) {
          const jsxMatch = componentData.jsx.match(/```(?:jsx|tsx|javascript|js)?\n?([\s\S]*?)\n?```/);
          if (jsxMatch) {
            componentData.jsx = jsxMatch[1].trim();
          }
        }
        
        // If the CSS is wrapped in markdown, extract it
        if (componentData.css && componentData.css.includes('```')) {
          const cssMatch = componentData.css.match(/```css\n?([\s\S]*?)\n?```/);
          if (cssMatch) {
            componentData.css = cssMatch[1].trim();
          }
        }
        
      } catch (parseError) {
        console.log('Parse error, trying fallback:', parseError.message);
        // Fallback: extract code blocks manually
        const jsxMatch = aiResponse.match(/```(?:jsx|tsx|javascript|js)\n([\s\S]*?)\n```/);
        const cssMatch = aiResponse.match(/```css\n([\s\S]*?)\n```/);
        
        componentData = {
          jsx: jsxMatch ? jsxMatch[1] : aiResponse,
          css: cssMatch ? cssMatch[1] : '',
          props: {},
          description: 'Generated React component',
          componentName: 'GeneratedComponent'
        };
      }

      return {
        success: true,
        data: componentData,
        metadata: {
          model: model || this.defaultModel,
          tokens: this.estimateTokens(fullPrompt + aiResponse),
          processingTime: Date.now()
        }
      };

    } catch (error) {
      console.error('AI Service Error:', error);
      
      if (error.message.includes('API key')) {
        throw new Error('Invalid Google API key');
      } else if (error.message.includes('quota')) {
        throw new Error('Google API quota exceeded');
      } else {
        throw new Error(`AI Service Error: ${error.message}`);
      }
    }
  }

  async refineComponent(originalComponent, refinementPrompt, model = null) {
    this._initialize();
    
    try {
      const systemPrompt = `You are an expert React component refiner. Your task is to modify an existing React component based on user feedback while maintaining its core functionality.

Guidelines:
1. Keep the existing component structure when possible
2. Apply only the requested changes
3. Maintain React best practices
4. Ensure the component remains functional and accessible
5. Preserve working features unless specifically asked to change them

Current component:
JSX: ${originalComponent.jsx}
CSS: ${originalComponent.css}

User refinement request: ${refinementPrompt}

Return the refined component in the same JSON format:
{
  "jsx": "// The refined React component code",
  "css": "/* The refined CSS styles */",
  "props": {
    "// Updated example props"
  },
  "description": "Description of changes made",
  "componentName": "ComponentName"
}`;

      const modelInstance = this.genAI.getGenerativeModel({ 
        model: model || this.defaultModel,
        generationConfig: {
          maxOutputTokens: this.maxTokens,
          temperature: 0.7,
        }
      });

      const result = await modelInstance.generateContent(systemPrompt);
      const response = await result.response;
      const aiResponse = response.text();
      
      let componentData;
      try {
        // First, try to find JSON in the response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          let jsonText = jsonMatch[0];
          
          // Clean up function props that break JSON parsing
          jsonText = jsonText.replace(/:\s*\(\)\s*=>\s*\{[^}]*\}/g, ': "function() { ... }"');
          jsonText = jsonText.replace(/:\s*function\s*\([^)]*\)\s*\{[^}]*\}/g, ': "function() { ... }"');
          
          componentData = JSON.parse(jsonText);
        } else {
          throw new Error('No JSON found in response');
        }
        
        // If the JSX is wrapped in markdown, extract it
        if (componentData.jsx && componentData.jsx.includes('```')) {
          const jsxMatch = componentData.jsx.match(/```(?:jsx|tsx|javascript|js)?\n?([\s\S]*?)\n?```/);
          if (jsxMatch) {
            componentData.jsx = jsxMatch[1].trim();
          }
        }
        
        // If the CSS is wrapped in markdown, extract it
        if (componentData.css && componentData.css.includes('```')) {
          const cssMatch = componentData.css.match(/```css\n?([\s\S]*?)\n?```/);
          if (cssMatch) {
            componentData.css = cssMatch[1].trim();
          }
        }
        
      } catch (parseError) {
        console.log('Parse error in refinement, trying fallback:', parseError.message);
        // Fallback for refinement
        componentData = {
          jsx: originalComponent.jsx,
          css: originalComponent.css,
          props: originalComponent.props,
          description: 'Component refinement failed, returned original',
          componentName: originalComponent.componentName || 'Component'
        };
      }

      return {
        success: true,
        data: componentData,
        metadata: {
          model: model || this.defaultModel,
          tokens: this.estimateTokens(systemPrompt + aiResponse),
          processingTime: Date.now()
        }
      };

    } catch (error) {
      console.error('AI Refinement Error:', error);
      throw new Error(`AI Refinement Error: ${error.message}`);
    }
  }

  async chatResponse(message, context = null, model = null) {
    this._initialize();
    
    try {
      const systemPrompt = `You are a helpful AI assistant for a React component generator platform. 
      
You can help users with:
- Understanding React concepts
- Explaining component code
- Suggesting improvements
- Answering questions about the platform
- Providing coding tips and best practices

Keep responses concise but helpful. If users ask for component generation or modification, acknowledge their request and suggest they use the appropriate generation tools.`;

      let fullPrompt = systemPrompt + '\n\n';

      // Add context if provided
      if (context && context.chatHistory) {
        const recentMessages = context.chatHistory.slice(-3);
        fullPrompt += 'Recent conversation:\n';
        recentMessages.forEach(msg => {
          fullPrompt += `${msg.role}: ${msg.content}\n`;
        });
        fullPrompt += '\n';
      }

      fullPrompt += `User: ${message}`;

      const modelInstance = this.genAI.getGenerativeModel({ 
        model: model || this.defaultModel,
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.8,
        }
      });

      const result = await modelInstance.generateContent(fullPrompt);
      const response = await result.response;
      const aiResponse = response.text();

      return {
        success: true,
        data: {
          message: aiResponse
        },
        metadata: {
          model: model || this.defaultModel,
          tokens: this.estimateTokens(fullPrompt + aiResponse),
          processingTime: Date.now()
        }
      };

    } catch (error) {
      console.error('AI Chat Error:', error);
      throw new Error(`AI Chat Error: ${error.message}`);
    }
  }

  // Get available models (simplified for Gemini)
  async getAvailableModels() {
    this._initialize();
    
    try {
      return {
        success: true,
        data: [
          {
            id: 'gemini-2.0-flash-lite',
            name: 'Gemini 2.0 Flash Lite',
            description: 'Lightweight and fast multimodal model'
          },
          {
            id: 'gemini-1.5-flash',
            name: 'Gemini 1.5 Flash',
            description: 'Fast and versatile multimodal model'
          },
          {
            id: 'gemini-1.5-pro',
            name: 'Gemini 1.5 Pro',
            description: 'High-performance multimodal model'
          },
          {
            id: 'gemini-pro',
            name: 'Gemini Pro',
            description: 'Standard Gemini model'
          }
        ]
      };
    } catch (error) {
      console.error('Get Models Error:', error);
      return {
        success: false,
        message: 'Failed to fetch available models',
        data: []
      };
    }
  }

  // Helper function to estimate tokens (rough approximation)
  estimateTokens(text) {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }
}

export default new AIService();
