
import React, { useState, useEffect } from 'react';
import { FileText, Mail, ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react';
import { JobInput } from './components/JobInput';
import { ProfileInput } from './components/ProfileInput';
import { Workspace } from './components/Workspace';
import { AppState, UserProfile, FileData, ResumeData } from './types';
import { generateTailoredContent, polishContent } from './services/geminiService';
import { renderResumeToHTML } from './components/ResumePaper';

const INITIAL_PROFILE: UserProfile = {
  name: '',
  email: '',
  phone: '',
  location: '',
  summary: '',
  skills: '',
  technologies: '',
  languages: '',
  experience: [],
  education: [],
  links: []
};

const sanitizeAIResponse = (text: string): string => {
  return text
    .replace(/^```html\n?/i, '')
    .replace(/^```json\n?/i, '')
    .replace(/^```markdown\n?/i, '')
    .replace(/^```\n?/i, '')
    .replace(/\n?```$/i, '')
    .trim();
};

const parseMarkdownToHTML = (md: string): string => {
  let html = md;
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/^\* (.*$)/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul class="list-disc pl-5 mb-4">$1</ul>');

  html = html.split('\n\n').map(p => {
    if (!p.trim()) return '';
    if (p.includes('<li>')) return p;
    return `<p class="mb-4">${p.trim()}</p>`;
  }).join('');

  return `
    <div class="cover-letter-preview font-sans text-slate-800 leading-relaxed" 
         style="width: 100%; height: auto; padding: 20mm; box-sizing: border-box; background: white; margin: 0; display: block;">
      ${html}
    </div>
  `;
};

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vela-theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  const [state, setState] = useState<AppState>({
    jobDescription: '',
    rawResumeText: '',
    uploadedFile: null,
    uploadedFileName: '',
    profile: INITIAL_PROFILE,
    mode: 'upload',
    generatedContent: '',
    isGenerating: false,
    activeView: 'resume'
  });

  const [isPolishing, setIsPolishing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('vela-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('vela-theme', 'light');
    }
  }, [isDark]);

  const handleGenerate = async (type: 'resume' | 'cover-letter') => {
    setState(prev => ({ ...prev, isGenerating: true, activeView: type }));
    setCurrentStep(2);

    let profileData: UserProfile | FileData;
    if (state.mode === 'upload' && state.uploadedFile) {
      profileData = state.uploadedFile;
    } else {
      profileData = state.profile;
    }

    try {
      const rawContent = await generateTailoredContent(
        type,
        state.jobDescription,
        profileData,
        state.profile.links
      );

      const content = sanitizeAIResponse(rawContent);

      let finalHTML = '';
      if (type === 'resume') {
        try {
          const resumeJSON: ResumeData = JSON.parse(content);
          finalHTML = renderResumeToHTML(resumeJSON);
        } catch (e) {
          console.error("Failed to parse resume JSON, attempting MD fallback", e);
          finalHTML = parseMarkdownToHTML(content);
        }
      } else {
        finalHTML = parseMarkdownToHTML(content);
      }

      setState(prev => ({ ...prev, generatedContent: finalHTML, isGenerating: false }));
    } catch (error) {
      console.error("Generation failed:", error);
      setState(prev => ({ ...prev, generatedContent: `<p class="text-red-500 p-4">Error generating content. Please check your API key and try again.</p>`, isGenerating: false }));
    }
  };

  const handlePolish = async (instruction: string) => {
    if (!state.generatedContent || !state.jobDescription) return;

    setIsPolishing(true);
    try {
      const polished = await polishContent(state.generatedContent, state.jobDescription, instruction);
      setState(prev => ({ ...prev, generatedContent: sanitizeAIResponse(polished) }));
    } catch (error) {
      console.error("Polishing failed:", error);
    } finally {
      setIsPolishing(false);
    }
  };

  const updateState = <K extends keyof AppState>(key: K, value: AppState[K]) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const canGenerate = () => {
    if (!state.jobDescription) return false;
    if (state.mode === 'upload') return !!state.uploadedFile;
    if (state.mode === 'form') return !!state.profile.name;
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col bg-vela-light dark:bg-vela-dark transition-colors duration-300">
      <nav className="glass-header bg-white/80 dark:bg-vela-dark/80 border-b border-vela-light-border dark:border-vela-dark-border px-8 py-5 flex justify-between items-center sticky top-0 z-30 no-print">
        <div 
          className="flex items-center gap-2 select-none cursor-pointer group"
          onClick={() => setCurrentStep(1)}
        >
          <span className="font-['Space_Grotesk'] text-2xl tracking-tighter text-slate-900 dark:text-white group-hover:opacity-80 transition-opacity">
            Vela
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 bg-vela-light-surface dark:bg-vela-dark-surface p-1 rounded-full border border-vela-light-border dark:border-vela-dark-border">
            <button
              onClick={() => setCurrentStep(1)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${currentStep === 1 ? 'bg-white dark:bg-vela-dark-border shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}
            >
              Requirements
            </button>
            <button
              onClick={() => setCurrentStep(2)}
              disabled={!state.generatedContent && !state.isGenerating}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${currentStep === 2 ? 'bg-white dark:bg-vela-dark-border shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 disabled:opacity-50'}`}
            >
              Editor
            </button>
          </div>
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-2.5 rounded-xl bg-vela-light-surface dark:bg-vela-dark-surface border border-vela-light-border dark:border-vela-dark-border hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-400"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col md:flex-row h-[calc(100vh-81px)] overflow-hidden">
        {currentStep === 1 && (
          <div className="flex-1 overflow-y-auto bg-vela-light dark:bg-vela-dark p-6 md:p-12">
            <div className="max-w-4xl mx-auto flex flex-col gap-12">
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 flex items-center justify-center font-medium text-xs">1</div>
                  <h2 className="text-xl font-medium text-vela-light-text dark:text-vela-dark-text tracking-tight">Job Target</h2>
                </div>
                <JobInput
                  value={state.jobDescription}
                  onChange={(val) => updateState('jobDescription', val)}
                />
              </section>

              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 flex items-center justify-center font-medium text-xs">2</div>
                  <h2 className="text-xl font-medium text-vela-light-text dark:text-vela-dark-text tracking-tight">Professional Profile</h2>
                </div>
                <ProfileInput
                  mode={state.mode}
                  setMode={(m) => updateState('mode', m)}
                  profile={state.profile}
                  setProfile={(p) => updateState('profile', p)}
                  uploadedFile={state.uploadedFile}
                  uploadedFileName={state.uploadedFileName}
                  setUploadedFile={(f, name) => {
                    setState(prev => ({ ...prev, uploadedFile: f, uploadedFileName: name || '' }));
                  }}
                />
              </section>

              <section className="bg-vela-light-surface dark:bg-vela-dark-surface p-12 rounded-2xl border border-vela-light-border dark:border-vela-dark-border shadow-sm flex flex-col md:flex-row gap-6 items-center justify-center mb-24 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
                <button
                  onClick={() => handleGenerate('resume')}
                  disabled={state.isGenerating || !canGenerate()}
                  className="w-full md:w-auto flex items-center justify-center gap-3 vela-btn-gradient text-white px-10 py-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText size={18} /> Tailor Resume
                </button>
                <button
                  onClick={() => handleGenerate('cover-letter')}
                  disabled={state.isGenerating || !canGenerate()}
                  className="w-full md:w-auto flex items-center justify-center gap-3 vela-btn-gradient text-white px-10 py-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Mail size={18} /> Cover Letter
                </button>
              </section>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="flex-1 overflow-y-auto bg-vela-light-surface dark:bg-vela-dark-surface p-4 md:p-10">
            <div className="max-w-5xl mx-auto">
              <button
                onClick={() => setCurrentStep(1)}
                className="mb-8 flex items-center gap-2 text-slate-500 hover:text-blue-500 font-medium transition-colors no-print text-sm"
              >
                <ChevronLeft size={16} /> Back to Requirements
              </button>

              <Workspace
                content={state.generatedContent}
                onContentChange={(c) => updateState('generatedContent', c)}
                onPolish={handlePolish}
                title={state.activeView === 'resume' ? 'Resume' : 'Cover Letter'}
                isGenerating={state.isGenerating}
                isPolishing={isPolishing}
                viewType={state.activeView}
              />
            </div>
          </div>
        )}

        {currentStep === 1 && state.generatedContent && (
          <div className="fixed bottom-10 right-10 z-50 no-print">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 vela-btn-gradient text-white px-8 py-3 rounded-full font-medium transition-all hover:scale-105 active:scale-95 shadow-xl"
            >
              Review Results <ChevronRight size={18} />
            </button>
          </div>
        )}
      </main>

      <footer className="bg-white dark:bg-vela-dark border-t border-vela-light-border dark:border-vela-dark-border py-6 px-8 text-center text-[13px] text-slate-500 no-print">
        <p className="font-medium tracking-tight">© {new Date().getFullYear()} Vela AI. Private and Secure Workspace.</p>
      </footer>
    </div>
  );
};

export default App;
