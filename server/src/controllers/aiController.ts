import { Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function summarizePost(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { postId } = req.params;
    
    // Verify user is authenticated
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        message: 'Authentication required to use AI features' 
      });
      return;
    }

    // Get the post content from database
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        content: true,
        status: true
      }
    });

    if (!post) {
      res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
      return;
    }

    if (post.status !== 'PUBLISHED') {
      res.status(403).json({ 
        success: false, 
        message: 'Cannot summarize unpublished posts' 
      });
      return;
    }

    // Extract text content (remove HTML tags if any)
    const textContent = post.content.replace(/<[^>]*>/g, '').trim();
    
    if (!textContent) {
      res.status(400).json({ 
        success: false, 
        message: 'Post has no content to summarize' 
      });
      return;
    }

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.3,
        topK: 1,
        topP: 1,
        maxOutputTokens: 100,
      }
    });

    // Create the summarization prompt
    const prompt = `
You are a professional content summarizer. Your task is to create a concise, engaging summary of the following blog post.

REQUIREMENTS:
- Maximum 50 words
- Capture the main idea and key points
- Use clear, engaging language
- Focus on what readers will find valuable
- Do not include any HTML tags or special formatting

BLOG POST TITLE: "${post.title}"

BLOG POST CONTENT:
${textContent}

SUMMARY:`;

    // Generate summary using Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text().trim();

    // Validate summary length (approximately 50 words)
    const wordCount = summary.split(/\s+/).length;
    
    if (wordCount > 60) {
      // If summary is too long, try again with stricter prompt
      const strictPrompt = `Summarize this blog post in exactly 40 words or less. Be concise and capture only the most important point:

"${post.title}"

${textContent.substring(0, 500)}...

40-word summary:`;

      const strictResult = await model.generateContent(strictPrompt);
      const strictResponse = await strictResult.response;
      const finalSummary = strictResponse.text().trim();

      res.json({
        success: true,
        data: {
          summary: finalSummary,
          wordCount: finalSummary.split(/\s+/).length,
          postTitle: post.title
        }
      });
      return;
    }

    res.json({
      success: true,
      data: {
        summary,
        wordCount,
        postTitle: post.title
      }
    });

  } catch (error) {
    console.error('AI Summarization Error:', error);
    
    // Handle specific Gemini API errors
    if (error instanceof Error) {
      if (error.message.includes('API_KEY')) {
        res.status(500).json({ 
          success: false, 
          message: 'AI service configuration error' 
        });
        return;
      }
      
      if (error.message.includes('quota') || error.message.includes('rate')) {
        res.status(429).json({ 
          success: false, 
          message: 'AI service temporarily unavailable. Please try again later.' 
        });
        return;
      }
    }

    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate summary. Please try again.' 
    });
  }
}; 