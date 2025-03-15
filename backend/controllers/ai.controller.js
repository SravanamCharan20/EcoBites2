import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with error handling
let genAI;
try {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} catch (error) {
  console.error('Error initializing Gemini AI:', error);
}

export const getAISuggestions = async (req, res) => {
  try {
    if (!genAI) {
      throw new Error('Gemini AI not properly initialized');
    }

    const { donationType, userStats } = req.body;
    
    if (!userStats) {
      return res.status(400).json({ message: 'userStats is required' });
    }

    console.log('Generating AI suggestions for:', { donationType, userStats });
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create a more structured prompt
    const prompt = `You are an AI assistant for a donation platform. Based on these statistics, provide insights in JSON format.

Input Data:
- Type: ${donationType || 'general'}
- Stats: ${JSON.stringify(userStats)}

Instructions:
Return ONLY a valid JSON object with exactly this structure:
{
  "donationOptimization": [
    "Optimize donation frequency based on peak times",
    "Focus on high-demand items"
  ],
  "impactAnalysis": [
    "Track community reach metrics",
    "Measure sustainability impact"
  ],
  "seasonalRecommendations": [
    "Plan for holiday season peaks",
    "Adjust for seasonal needs"
  ],
  "communityEngagement": [
    "Build donor relationships",
    "Increase local outreach"
  ],
  "sustainabilityInsights": [
    "Reduce waste in donations",
    "Improve resource efficiency"
  ]
}

Important: Respond ONLY with the JSON object, no additional text.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }]}],
      generationConfig: {
        temperature: 0.3,
        topK: 1,
        topP: 0.8,
        maxOutputTokens: 1000,
      },
    });

    const response = await result.response;
    const text = response.text().trim();
    
    console.log('Raw AI response:', text);
    
    let suggestions;
    try {
      // Try to extract JSON if it's wrapped in other text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : text;
      
      suggestions = JSON.parse(jsonStr);
      
      // Ensure each category has at least one item
      const defaultCategories = {
        donationOptimization: ['Optimize donation scheduling'],
        impactAnalysis: ['Track donation impact'],
        seasonalRecommendations: ['Plan for seasonal needs'],
        communityEngagement: ['Engage with local community'],
        sustainabilityInsights: ['Focus on sustainable practices']
      };

      // Fill in any missing categories with defaults
      Object.keys(defaultCategories).forEach(key => {
        if (!suggestions[key] || !Array.isArray(suggestions[key]) || suggestions[key].length === 0) {
          suggestions[key] = defaultCategories[key];
        }
      });
      
      console.log('Successfully generated AI suggestions');
      res.json(suggestions);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw AI response:', text);
      
      // Return default suggestions if parsing fails
      suggestions = {
        donationOptimization: ['Optimize donation scheduling', 'Focus on high-demand items'],
        impactAnalysis: ['Track community impact', 'Measure donation effectiveness'],
        seasonalRecommendations: ['Plan for seasonal needs', 'Prepare for peak times'],
        communityEngagement: ['Build community connections', 'Increase local outreach'],
        sustainabilityInsights: ['Implement sustainable practices', 'Reduce waste']
      };
      
      res.json(suggestions);
    }
  } catch (error) {
    console.error('Error in getAISuggestions:', error);
    
    // Return default suggestions on error
    const defaultSuggestions = {
      donationOptimization: ['Optimize donation scheduling', 'Focus on high-demand items'],
      impactAnalysis: ['Track community impact', 'Measure donation effectiveness'],
      seasonalRecommendations: ['Plan for seasonal needs', 'Prepare for peak times'],
      communityEngagement: ['Build community connections', 'Increase local outreach'],
      sustainabilityInsights: ['Implement sustainable practices', 'Reduce waste']
    };
    
    res.json(defaultSuggestions);
  }
};

export const getSmartRecommendations = async (req, res) => {
  try {
    if (!genAI) {
      throw new Error('Gemini AI not properly initialized');
    }

    const { donationHistory, communityNeeds } = req.body;
    
    if (!donationHistory || !communityNeeds) {
      return res.status(400).json({ message: 'donationHistory and communityNeeds are required' });
    }

    console.log('Generating smart recommendations for:', { donationHistory, communityNeeds });
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Simplify the prompt
    const prompt = `Based on this donation data, suggest strategies:
    
    History: ${JSON.stringify(donationHistory)}
    Needs: ${JSON.stringify(communityNeeds)}

    Provide 2-3 points per category. Format as JSON:
    {
      "neededItems": ["item1", "item2"],
      "timing": ["point1", "point2"],
      "impactMetrics": ["metric1", "metric2"],
      "collaboration": ["point1", "point2"],
      "efficiency": ["point1", "point2"]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Raw AI response:', text);
    
    let recommendations;
    try {
      recommendations = JSON.parse(text);
      
      // Validate the response structure
      const requiredKeys = [
        'neededItems',
        'timing',
        'impactMetrics',
        'collaboration',
        'efficiency'
      ];
      
      const missingKeys = requiredKeys.filter(key => !recommendations[key]);
      if (missingKeys.length > 0) {
        throw new Error(`Missing required keys in AI response: ${missingKeys.join(', ')}`);
      }
      
      console.log('Successfully generated recommendations');
      res.json(recommendations);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw AI response:', text);
      throw new Error('Failed to parse AI response');
    }
  } catch (error) {
    console.error('Error in getSmartRecommendations:', error);
    res.status(500).json({ 
      message: 'Error generating recommendations',
      error: error.message 
    });
  }
}; 