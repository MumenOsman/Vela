
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, FileData, ExternalLink } from "../types";

const SYSTEM_INSTRUCTION = `You are a Senior Resume Writer and Career Coach. 
When rewriting resumes:
1. Analyze the Job Description to identify the top 3-5 required skills/keywords.
2. Treat the user's provided information as a 'database of facts'. Completely rewrite bullet points to align with the job requirements using the STAR method (Situation, Task, Action, Result). 
3. Focus on metrics, optimization, and quantifiable achievements.
4. REORDER and SELECT: Do not simply list every skill the user has. Analyze the Job Description. Select only the top 8-10 'Hard Skills' and 4-5 'Soft Skills' that directly match the job requirements. Rewrite them if necessary to match keywords used in the job ad.
5. Prioritize the most relevant items for the specific job.
6. Use professional, high-impact action verbs.

When writing cover letters:
Avoid robotic intros. Be direct, enthusiastic, and professional, specifically connecting the user's "database of facts" to the company's needs. Use semantic HTML for output.

IMPORTANT: Return the content as raw text/markdown only. Do NOT enclose it in markdown code fences (no \`\`\`). Do not include \`\`\`html or any other prefix.`;

const RESUME_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    personalInfo: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        title: { type: Type.STRING },
        contact: {
          type: Type.OBJECT,
          properties: {
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            location: { type: Type.STRING },
            links: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING, description: "e.g. LinkedIn, Portfolio, GitHub" },
                  url: { type: Type.STRING }
                },
                required: ["label", "url"]
              }
            }
          },
          required: ["email", "phone", "location", "links"]
        }
      },
      required: ["name", "title", "contact"]
    },
    summary: { type: Type.STRING },
    skills: {
      type: Type.OBJECT,
      properties: {
        technical: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Curated top 8-10 hard skills matching JD" },
        soft: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Curated top 4-5 soft skills matching JD" },
      },
      required: ["technical", "soft"]
    },
    languages: { type: Type.ARRAY, items: { type: Type.STRING } },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          role: { type: Type.STRING },
          company: { type: Type.STRING },
          dates: { type: Type.STRING },
          bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["role", "company", "dates", "bullets"]
      }
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          degree: { type: Type.STRING },
          school: { type: Type.STRING },
          year: { type: Type.STRING },
        },
        required: ["degree", "school", "year"]
      }
    }
  },
  required: ["personalInfo", "summary", "skills", "languages", "experience", "education"]
};

export const generateTailoredContent = async (
  type: 'resume' | 'cover-letter',
  jobDescription: string,
  profileData: UserProfile | FileData,
  links?: ExternalLink[]
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const model = 'gemini-3-flash-preview';

  let parts: any[] = [];

  if ('data' in profileData) {
    // Upload mode
    parts.push({
      inlineData: {
        data: profileData.data,
        mimeType: profileData.mimeType,
      },
    });
    parts.push({ text: "Attached is the user's current resume as a PDF file." });
    if (links && links.length > 0) {
      parts.push({ text: `Additional User Links: ${JSON.stringify(links)}` });
    }
  } else {
    // Form mode
    parts.push({ text: `User Detailed Profile: ${JSON.stringify(profileData)}` });
  }

  const promptText = type === 'resume' 
    ? `Tailor a high-impact resume for this job description. 
       Job Description: ${jobDescription}
       Instruction: Return a JSON object with tailored resume content following the schema. Analyze the JD, prioritize top keywords, curated skills (8-10 hard, 4-5 soft), and rewrite bullets for maximum impact and relevance.`
    : `Write a persuasive, high-level cover letter for the following job.
       Job Description: ${jobDescription}
       Instruction: Return a professional cover letter in semantic HTML format. Direct impact, enthusiastic tone. Do NOT use markdown code fences.`;

  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        ...(type === 'resume' ? {
          responseMimeType: "application/json",
          responseSchema: RESUME_SCHEMA
        } : {})
      },
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const polishContent = async (
  content: string,
  jobDescription: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const model = 'gemini-3-flash-preview';

  const prompt = `Review the following document content (in HTML format). 
  Job Context: ${jobDescription}
  
  Content to Refine: 
  ${content}

  Instruction: 
  1. Review the user's document and any manual edits.
  2. Correct any grammar errors.
  3. Elevate the tone to be more professional, executive, and impactful.
  4. DO NOT change the core facts or metrics.
  5. Return the exact same HTML structure but with polished text content. Do not add markdown backticks.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: "You are an executive editor. Your goal is to refine text for clarity, impact, and professionalism while maintaining the provided HTML structure.",
        temperature: 0.4,
      },
    });

    return response.text || content;
  } catch (error) {
    console.error("Polish Error:", error);
    throw error;
  }
};
