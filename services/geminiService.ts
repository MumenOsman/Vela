
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, FileData, ExternalLink } from "../types";

const SYSTEM_INSTRUCTION = `You are a World-Class Executive Resume Writer and Career Strategist.

STRICT CORE RULE: DO NOT FABRICATE DATA. Only use facts, skills, and experiences present in the source data.

STRATEGIC OBJECTIVE:
Your goal is to "bridge" the user's history to the specific Job Description (JD) without lying.

1. PROFESSIONAL TITLE: Set 'personalInfo.title' to the user's ACTUAL most recent or most relevant professional title found in the source data. You may refine it slightly for professional clarity (e.g., "Software Developer" to "Senior Software Engineer" if the seniority is evident), but DO NOT change it to a role the user has never held.
2. TAILORED SUMMARY: 
   - If the user is changing fields: Explicitly frame the summary to highlight their background in [Source Field] and how their specific transferable skills (from source data) solve the needs of [Target Field/JD].
   - Focus on the intersection of the user's real achievements and the company's requirements.
3. EXPERIENCE TAILORING: 
   - Rephrase existing bullets to use keywords from the JD, but keep the underlying actions and results 100% factual.
   - Use the STAR method with quantified metrics only if they exist in the source.
4. LINKS: DO NOT INVENT LINKS. If the user provided no URLs or social links in the source data, the 'links' array MUST be empty. Never use "linkedin.com/in/username" or placeholder text.
5. SKILL SELECTION: Select 8-10 'Hard Skills' and 4-5 'Soft Skills' found ONLY in the source data that overlap with the JD.

IMPORTANT: Return the content as raw text/markdown only. Do NOT enclose it in markdown code fences.`;

const RESUME_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    personalInfo: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        title: { 
          type: Type.STRING, 
          description: "The user's actual professional title derived from their work history. Do not invent a new title they have never held." 
        },
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
                  label: { type: Type.STRING },
                  url: { type: Type.STRING }
                },
                required: ["label", "url"]
              },
              description: "Include ONLY links provided in the source data. If none are provided, return an empty array []."
            }
          },
          required: ["email", "phone", "location", "links"]
        }
      },
      required: ["name", "title", "contact"]
    },
    summary: { 
      type: Type.STRING, 
      description: "A professional summary that honestly bridges the user's real background to the job's needs. If changing fields, highlight transferable skills." 
    },
    skills: {
      type: Type.OBJECT,
      properties: {
        technical: { type: Type.ARRAY, items: { type: Type.STRING } },
        soft: { type: Type.ARRAY, items: { type: Type.STRING } },
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
          bullets: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Actual experience bullets rephrased for JD alignment using STAR method."
          },
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
    parts.push({
      inlineData: {
        data: profileData.data,
        mimeType: profileData.mimeType,
      },
    });
    parts.push({ text: "SOURCE DATA: Attached Resume File." });
  } else {
    parts.push({ text: `SOURCE DATA: ${JSON.stringify(profileData)}` });
  }

  // Explicitly pass provided links to ensure they are the only ones used
  if (links && links.length > 0) {
    parts.push({ text: `AUTHORIZED LINKS: ${JSON.stringify(links.map(l => ({ label: l.label, url: l.url })))}` });
  } else {
    parts.push({ text: "NO AUTHORIZED LINKS PROVIDED. The links array in the output must be empty." });
  }

  const promptText = type === 'resume' 
    ? `TASK: Tailor a resume for this job description.
       TARGET JOB: ${jobDescription}
       
       MANDATE: 
       - Title must be the user's REAL role from work history.
       - Summary should bridge their background to the target job (transferable skills).
       - NO DUMMY LINKS.
       - NO FABRICATION.
       - Return JSON following the schema.`
    : `TASK: Write a cover letter for this job.
       TARGET JOB: ${jobDescription}
       MANDATE: Honestly connect user's source experience to the job's requirements. Use semantic HTML.`;

  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2, // Lower temperature for higher factual precision
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
  jobDescription: string,
  userInstruction?: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const model = 'gemini-3-flash-preview';

  const prompt = `You are an expert HTML editor. 
  
  CONTEXT: The user is applying for this job: ${jobDescription}
  USER INSTRUCTION: ${userInstruction || "Improve the tone and clarity of this professional document."}

  CONTENT TO EDIT (HTML):
  ${content}

  RULES:
  1. DO NOT change the HTML structure, classes, or layout.
  2. ONLY edit the text content inside the tags.
  3. Keep all <span>, <div>, <ul>, and <li> tags exactly where they are.
  4. DO NOT add markdown code blocks (like \`\`\`html) to the output.
  5. Return ONLY the raw refined HTML string.
  6. If the user instruction is to "shorten", make the text more concise while keeping the impact.
  7. If the user instruction is "make more professional", elevate the vocabulary.
  8. NO FABRICATION: Do not add skills or links not already present in the content.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: "Executive HTML content editor. Refine text impact without breaking layout or fabricating facts.",
        temperature: 0.1,
      },
    });

    return response.text || content;
  } catch (error) {
    console.error("Polish Error:", error);
    throw error;
  }
};
