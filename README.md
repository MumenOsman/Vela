Vela is An AI-powered career co-pilot that intelligently reframes your professional history into tailored resumes and cover letters for any role

Try the app: https://vela-1045019688858.us-west1.run.app/

## Inspiration
Vela wasn't born from a desire to build another AI tool, but from watching a recurring frustration. In a market where over **14 million applications** are sent daily on LinkedIn alone, the sheer volume has forced a shift in how people search for work.

The original spark came from seeing how high the "entry fee" has become just to get noticed. It felt unfair that a person’s actual talent could be sidelined simply because they didn't have the hours to manually rewrite their life story for the twentieth time that week. Starting from a blank page at "ground zero" isn't just a time consuming chore; it’s a psychological drain that makes people settle for less than they are worth.

During the research phase, we realized this struggle isn't limited to the standard 9 to 5 ladder. It’s actually more painful for:
- **Career Switchers**: People with great skills who don't know how to "translate" them into a new industry.
- **Side-Hustlers**: Students or workers looking for weekend shifts or part-time roles who need a quick, professional look.
- **Public Speakers**: Professionals applying for a stage or a spotlight who need to frame their expertise for a specific audience.

The goal for Vela was to create a "pillar", a solid starting point that does the heavy lifting of reframing your history. It’s about giving people back their time so they can focus on the opportunity itself, rather than the tedious mechanics of the application.

## What it does
At its core, Vela functions as a "Career Strategist" that identifies the hidden value in a user's history and translates it for a new or familiar audience.

### App features: 

### **1. Data Intake & Extraction**
- **Resume/CV Upload**: Users can import their existing professional history directly by uploading a resume in PDF or other standard formats.
- **Job Description Analysis**: Users paste the target job posting URL or text, which the system then scans to identify essential skills, qualifications, and the employer's implicit "pain points".
- **Personal Detail Management**: Allows for the addition of critical stable links, such as a LinkedIn profile or professional portfolio, ensuring they are integrated into the final document.

### **2. AI Intelligence (The Career Coach)**
- **Contextual Skill Matching**: Beyond simple keywords, the AI analyzes the surrounding text to understand the specific requirements and responsibilities of the role to better align the user's history.
- **Transferable Skill Translation**: Re-indexes "facts" from a user’s background (e.g., reframing 3D modeling into visual analysis or precision-focused project management) to match the target industry's terminology.
- **Smart Curation**: Instead of a generic data dump, the system curates a focused set of relevant technical and soft skills (typically the top 8–10) that most closely align with the job ad.
- **Impact Focused Bullet Points**: Rewrites experience bullet points to emphasize achievements and measurable impact rather than just listing daily tasks.
- **Human Centric Cover Letter Generation**: Crafts a unique narrative for each application, starting with a strong "hook" and avoiding robotic AI tone to sound like a natural professional conversation.

### **3. Design & Export (High-Fidelity Output)**
*   **Friendly Export**: Generates clean, perfectly formatted PDFs that get past Applicant Tracking Systems.
- **Functional Hyperlinks**: Ensures that all contact links, such as LinkedIn or personal portfolios, remain 100% clickable within the final exported PDF.
- **Dual-Theme Interface**: Offers a distraction-free user experience with both "Deep Space" (Dark Mode) and "Ethereal Day" (Light Mode) aesthetics.

## How we built it

We built Vela using a modern, reactive tech stack:
*   **Frontend**: React (with Vite) for a fast, responsive UI.
*   **AI Power**: Google Gemini API for understanding complex job descriptions and generating human like text.
*   **Styling**: TailwindCSS for a clean, professional aesthetic that looks great on any device.
*   **PDF Generation**: Used native browser print APIs (after iterating away from buggy canvas libraries) to ensure pixel-perfect A4 exports.

## Gemini tools:

the app currently uses the **Gemini 3** API. Specifically, it is configured to use the **gemini-3-flash-preview** model in services/geminiService.ts for both content generation and text polishing.

1. **JSON Schema Mode (Structured Output):** In the generateTailoredContent service, the app uses a strictly defined RESUME_SCHEMA to ensure the model returns a valid JSON object. This allows the frontend to reliably render the resume with pixel-perfect precision.
    
2. **Multimodal Input:** The app utilizes Gemini's ability to process non-text data. When you upload a resume, it sends the PDF as **inlineData** (base64) directly to the model. This allows the AI to "read" the visual structure and context of your existing resume rather than just parsing raw, messy text.
    
3. **System Instructions:** It uses the systemInstruction config to define a persistent persona (Senior Resume Writer/Executive Editor), which ensures high-quality, STAR-method-focused rewrites.

## Challenges we ran into

One subtle but annoying challenge was generating high-quality PDFs from the web view. Initial attempts using screenshot-based libraries (`html2canvas`) resulted in blurry text and cut-off pages. We had to pivot to a print-stylesheet approach, optimizing CSS specifically for the A4 format to ensure the output looked exactly like a professionally typeset document.

## Accomplishments that we're proud of

- **The "Live Canvas":** We successfully bridged the gap between raw AI output and human intuition. You can manually edit any word on that A4 paper, and then use the **"Refine Text"** tool to have the AI polish your specific changes without losing your personal touch.
- **High-Fidelity A4 Print Accuracy:** By using a hidden iframe rendering strategy with a strictly scoped CSS reset, we ensured that what you see on the screen is exactly what the employer sees on paper. The resume isn't just a "web page"; it's a pixel-perfect professional document.
- **Native Multimodal Analysis:** When a user uploads a PDF, the AI "sees" the layout, the structure, and the hierarchy of information. This allows Vela to understand context (like which dates belong to which company) far better than traditional keyword parsers.
- **Semantic Resume Architecture** We built a schema-first generation engine. By forcing the AI to return structured JSON rather than a block of text, we can swap themes, re-align headers, and ensure contact links are actually clickable, making the final resume technically superior to one made in Word or Canva.

## What we learned

We learned that "simple" features like PDF export can be surprisingly complex! It taught us the value of using native browser standards (like `window.print`) over heavy third-party libraries. We also learned how to fine tune Large Language Model prompts to strictly follow formatting JSON structures, which was crucial for the resume builder.

## What's next for Vela

- **User Accounts:** Implement a secure account system to save professional history and previously generated documents for instant access.
- **Browser Extension:** Develop a tool to detect job postings on sites like LinkedIn and generate tailored applications with a single click.
- **Brand Evolution:** Continuously refine Vela’s visual identity and UI to ensure a premium, high-fidelity user experience.
- **B2B API:** Offer Vela’s "Career Coach" intelligence as a service for recruitment platforms and educational institutions to integrate.
