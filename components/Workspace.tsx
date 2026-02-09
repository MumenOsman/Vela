import React, { useRef, useEffect } from 'react';
import { Download, Edit3, Sparkles, Wand2 } from 'lucide-react';

interface WorkspaceProps {
  content: string;
  onContentChange: (newContent: string) => void;
  onPolish: () => void;
  title: string;
  isGenerating: boolean;
  isPolishing: boolean;
  viewType: 'resume' | 'cover-letter';
}

export const Workspace: React.FC<WorkspaceProps> = ({
  content,
  onContentChange,
  onPolish,
  title,
  isGenerating,
  isPolishing,
  viewType
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const handleDownloadPDF = () => {
    const htmlContent = editorRef.current?.innerHTML;
    if (!htmlContent) return;

    const iframe = document.createElement('iframe');
    Object.assign(iframe.style, {
      position: 'fixed',
      right: '0',
      bottom: '0',
      width: '0',
      height: '0',
      border: '0',
      visibility: 'hidden'
    });

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vela - ${title}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              background-color: white;
            }
            .resume-paper, .cover-letter-preview {
              width: 210mm;
              min-height: 297mm;
              padding: 20mm;
              background: white;
              box-sizing: border-box;
              margin: 0 auto;
            }
            .font-serif { font-family: serif; }
            .font-sans { font-family: 'Inter', sans-serif; }
            a {
              text-decoration: none;
              color: #2563eb !important;
              border-bottom: 1px solid #2563eb;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.focus();
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    doc.close();

    if (iframe.contentWindow) {
      iframe.contentWindow.onafterprint = () => {
        document.body.removeChild(iframe);
      };
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onContentChange(e.currentTarget.innerHTML);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap justify-between items-center bg-white dark:bg-vela-dark-surface p-6 rounded-2xl border border-vela-light-border dark:border-vela-dark-border shadow-sm sticky top-4 z-10 no-print gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/10 text-blue-500 rounded-xl">
            <Edit3 size={18} />
          </div>
          <div>
            <h2 className="font-semibold text-vela-light-text dark:text-vela-dark-text uppercase text-[11px] tracking-widest">{title} Canvas</h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Click any text to edit manually</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onPolish}
            disabled={!content || isGenerating || isPolishing}
            className="flex items-center gap-2 bg-vela-light-surface dark:bg-vela-dark border border-vela-light-border dark:border-vela-dark-border text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl font-medium uppercase text-[11px] tracking-wider transition-all hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
          >
            <Wand2 size={16} className={`${isPolishing ? 'animate-pulse' : ''} text-blue-500`} />
            {isPolishing ? 'Perfecting...' : 'Refine Text'}
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={!content || isGenerating || isPolishing}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-medium uppercase text-[11px] tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <Download size={16} /> Save PDF
          </button>
        </div>
      </div>

      <div className="relative">
        {(isGenerating || isPolishing) && (
          <div className="absolute inset-0 bg-white/70 dark:bg-vela-dark/70 backdrop-blur-xl z-20 flex flex-col items-center justify-center gap-6 rounded-2xl border border-blue-200/50 dark:border-blue-900/20">
            <div className={`animate-pulse text-blue-500`}>
              {isPolishing ? <Wand2 size={48} /> : <Sparkles size={48} />}
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-vela-light-text dark:text-vela-dark-text mb-2">
                {isPolishing ? 'Elevating tone...' : `Generating ${title}...`}
              </p>
              <p className="text-[11px] text-blue-500 dark:text-blue-400 font-medium uppercase tracking-[0.2em]">
                Processing keywords
              </p>
            </div>
          </div>
        )}

        <div className="bg-slate-200 dark:bg-[#0c0c0d] p-10 md:p-16 overflow-x-auto min-h-screen rounded-2xl shadow-inner flex justify-center border border-vela-light-border dark:border-vela-dark-border/50 transition-colors">
          <div
            ref={editorRef}
            contentEditable={!isGenerating && !isPolishing}
            onInput={handleInput}
            className={`a4-container outline-none cursor-text shadow-2xl ${viewType === 'resume' ? 'resume-mode' : 'cover-letter-mode'}`}
            style={{
              width: '210mm',
              minHeight: '297mm',
              backgroundColor: 'white',
              padding: '0',
              fontFamily: viewType === 'resume' ? 'serif' : 'sans-serif',
              boxSizing: 'border-box',
              margin: '0',
              position: 'relative',
              color: '#1a1a1a'
            }}
          />
        </div>
      </div>
    </div>
  );
};