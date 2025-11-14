import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ContentGenerationParams {
  contentType: string;
  platform?: string;
  tone?: string;
  length?: string;
  targetAudience?: string;
  keywords?: string;
  brief: string;
}

export interface ContentVariation {
  id: string;
  content: string;
  qualityScore: number;
}

export interface GeneratedContentResult {
  variations: ContentVariation[];
  qualityScores: number[];
  suggestedTitle?: string;
}

class ContentGenerationService {
  private getLengthGuidance(length?: string): string {
    const lengthMap: Record<string, string> = {
      short: '50-100 words',
      medium: '100-300 words',
      long: '300-500 words',
      'very-long': '500+ words',
    };
    return lengthMap[length || 'medium'] || '100-300 words';
  }

  private getPlatformGuidance(platform?: string): string {
    const platformMap: Record<string, string> = {
      linkedin:
        'Professional tone, focus on business value, use line breaks for readability, include relevant hashtags',
      twitter:
        'Concise and punchy, under 280 characters if possible, use engaging hooks, include 1-2 relevant hashtags',
      facebook:
        'Conversational and engaging, use emojis sparingly, encourage comments and shares',
      instagram:
        'Visual-first mindset, use emojis, include call-to-action, use relevant hashtags (5-10)',
      tiktok:
        'Casual and trendy, use current slang appropriately, focus on entertainment value, short and snappy',
      general: 'Clear and engaging, adaptable to multiple platforms',
    };
    return platformMap[platform || 'general'] || platformMap.general;
  }

  private buildPrompt(params: ContentGenerationParams): string {
    const {
      contentType,
      platform,
      tone,
      length,
      targetAudience,
      keywords,
      brief,
    } = params;

    const lengthGuidance = this.getLengthGuidance(length);
    const platformGuidance = this.getPlatformGuidance(platform);

    return `You are an expert content creator specializing in ${contentType} for ${platform || 'various platforms'}.

Create engaging, high-quality content based on the following requirements:

Content Type: ${contentType}
Platform: ${platform || 'General'}
Tone: ${tone || 'Professional'}
Length: ${lengthGuidance}
Target Audience: ${targetAudience || 'General audience'}
${keywords ? `Keywords to include: ${keywords}` : ''}

Platform-specific guidance: ${platformGuidance}

Content Brief:
${brief}

Generate 3 distinct variations of this content. Each variation should:
1. Be complete and ready to publish
2. Follow the specified tone and length guidelines
3. Be optimized for the target platform
4. Include relevant keywords naturally
5. Have a strong hook or opening
6. Include a clear call-to-action where appropriate

Format your response as a JSON object with this structure:
{
  "variations": [
    { "content": "variation 1 text", "reasoning": "why this approach works" },
    { "content": "variation 2 text", "reasoning": "why this approach works" },
    { "content": "variation 3 text", "reasoning": "why this approach works" }
  ],
  "suggestedTitle": "A compelling title for this content"
}`;
  }

  async generateContent(params: ContentGenerationParams): Promise<GeneratedContentResult> {
    try {
      const prompt = this.buildPrompt(params);

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert content creator who generates engaging, platform-optimized content. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      });

      const responseText = completion.choices[0]?.message?.content;
      if (!responseText) {
        throw new Error('No response from AI');
      }

      // Parse the JSON response
      const parsed = JSON.parse(responseText);

      // Generate quality scores for each variation
      const variations: ContentVariation[] = parsed.variations.map(
        (v: any, index: number) => ({
          id: `var-${index + 1}`,
          content: v.content,
          qualityScore: this.calculateQualityScore(v.content, params),
        })
      );

      return {
        variations,
        qualityScores: variations.map((v) => v.qualityScore),
        suggestedTitle: parsed.suggestedTitle,
      };
    } catch (error) {
      console.error('Content generation error:', error);
      throw new Error('Failed to generate content');
    }
  }

  private calculateQualityScore(content: string, params: ContentGenerationParams): number {
    let score = 70; // Base score

    // Length appropriateness (max +10)
    const wordCount = content.split(/\s+/).length;
    const targetLength = this.getTargetWordCount(params.length);
    const lengthDiff = Math.abs(wordCount - targetLength);
    const lengthScore = Math.max(0, 10 - lengthDiff / 10);
    score += lengthScore;

    // Keyword inclusion (max +10)
    if (params.keywords) {
      const keywords = params.keywords.split(',').map((k) => k.trim().toLowerCase());
      const contentLower = content.toLowerCase();
      const keywordsFound = keywords.filter((k) => contentLower.includes(k)).length;
      const keywordScore = (keywordsFound / keywords.length) * 10;
      score += keywordScore;
    } else {
      score += 5; // Bonus if no keywords required
    }

    // Readability (max +10)
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const avgSentenceLength = wordCount / sentences.length;
    if (avgSentenceLength >= 10 && avgSentenceLength <= 25) {
      score += 10; // Optimal sentence length
    } else {
      score += 5;
    }

    // Engagement indicators (max +10)
    const hasQuestion = /\?/.test(content);
    const hasCallToAction = /(click|learn|discover|join|try|get|download|sign up)/i.test(
      content
    );
    const hasEmphasis = /(!|:)/.test(content);

    if (hasQuestion) score += 3;
    if (hasCallToAction) score += 4;
    if (hasEmphasis) score += 3;

    return Math.min(100, Math.round(score));
  }

  private getTargetWordCount(length?: string): number {
    const lengthMap: Record<string, number> = {
      short: 75,
      medium: 200,
      long: 400,
      'very-long': 600,
    };
    return lengthMap[length || 'medium'] || 200;
  }

  async generateViralHooks(topic: string, platform: string, count: number = 5): Promise<string[]> {
    try {
      const prompt = `Generate ${count} viral hooks for ${platform} about: ${topic}

These hooks should:
1. Stop the scroll immediately
2. Create curiosity or emotional response
3. Be platform-appropriate for ${platform}
4. Use proven viral patterns (questions, bold statements, controversy, relatability)
5. Be concise and punchy

Return only a JSON array of strings, each being a complete hook.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a viral content expert who creates scroll-stopping hooks. Always respond with a JSON array of strings.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.9,
        max_tokens: 500,
      });

      const responseText = completion.choices[0]?.message?.content;
      if (!responseText) {
        throw new Error('No response from AI');
      }

      return JSON.parse(responseText);
    } catch (error) {
      console.error('Viral hooks generation error:', error);
      throw new Error('Failed to generate viral hooks');
    }
  }
}

export const contentGenerationService = new ContentGenerationService();
