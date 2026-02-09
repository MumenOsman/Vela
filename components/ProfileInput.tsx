import React from 'react';
import { InputMode, UserProfile, Experience, Education, ExternalLink, FileData } from '../types';
import { Plus, Trash2, FileUp, Link as LinkIcon, CheckCircle2 } from 'lucide-react';

interface ProfileInputProps {
  mode: InputMode;
  setMode: (mode: InputMode) => void;
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  uploadedFile: FileData | null;
  uploadedFileName: string;
  setUploadedFile: (file: FileData | null, name?: string) => void;
}

export const ProfileInput: React.FC<ProfileInputProps> = ({
  mode,
  setMode,
  profile,
  setProfile,
  uploadedFile,
  uploadedFileName,
  setUploadedFile
}) => {
  const updateField = (field: keyof UserProfile, value: any) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setUploadedFile({
          data: base64,
          mimeType: file.type
        }, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = (field: 'experience' | 'education' | 'links') => {
    const newItem = field === 'experience' 
      ? { id: Date.now().toString(), company: '', role: '', dates: '', description: '' }
      : field === 'education'
      ? { id: Date.now().toString(), degree: '', school: '', dates: '' }
      : { id: Date.now().toString(), label: '', url: '' };
    
    updateField(field, [...(profile[field] as any[]), newItem]);
  };

  const removeItem = (field: 'experience' | 'education' | 'links', id: string) => {
    updateField(field, (profile[field] as any[]).filter(item => item.id !== id));
  };

  const updateListItem = (field: 'experience' | 'education' | 'links', id: string, key: string, value: string) => {
    updateField(field, (profile[field] as any[]).map(item => item.id === id ? { ...item, [key]: value } : item));
  };

  const renderLinksSection = () => (
    <div className="flex flex-col gap-4 mt-8 px-4">
      <div className="flex justify-between items-center border-b border-vela-light-border dark:border-vela-dark-border pb-3">
        <h3 className="font-medium text-vela-light-text dark:text-vela-dark-text flex items-center gap-2 text-[11px] uppercase tracking-widest">
          <LinkIcon size={14} className="text-blue-500" /> Links & Portfolios
        </h3>
        <button onClick={() => addItem('links')} className="text-blue-500 dark:text-blue-400 hover:scale-105 transition-all flex items-center gap-1 text-[11px] font-medium uppercase">
          <Plus size={14} /> Add
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {profile.links.map((link) => (
          <div key={link.id} className="relative p-4 border border-vela-light-border dark:border-vela-dark-border rounded-xl bg-white dark:bg-vela-dark-surface flex gap-3 items-center shadow-sm">
            <input 
              placeholder="Label" 
              className="w-1/3 p-2.5 border border-vela-light-border dark:border-vela-dark-border rounded-xl text-sm bg-vela-light-surface dark:bg-vela-dark text-vela-light-text dark:text-vela-dark-text outline-none focus:ring-1 focus:ring-blue-500" 
              value={link.label} 
              onChange={(e) => updateListItem('links', link.id, 'label', e.target.value)} 
            />
            <input 
              placeholder="URL" 
              className="flex-1 p-2.5 border border-vela-light-border dark:border-vela-dark-border rounded-xl text-sm bg-vela-light-surface dark:bg-vela-dark text-vela-light-text dark:text-vela-dark-text outline-none focus:ring-1 focus:ring-blue-500" 
              value={link.url} 
              onChange={(e) => updateListItem('links', link.id, 'url', e.target.value)} 
            />
            <button 
              onClick={() => removeItem('links', link.id)} 
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="px-4">
        <div className="flex bg-vela-light-surface dark:bg-vela-dark-surface p-1.5 rounded-full w-fit border border-vela-light-border dark:border-vela-dark-border">
          <button
            onClick={() => setMode('upload')}
            className={`px-8 py-2 text-[11px] font-medium uppercase tracking-widest rounded-full transition-all ${
              mode === 'upload' ? 'bg-white dark:bg-vela-dark text-blue-500 dark:text-blue-400 shadow-sm border border-vela-light-border dark:border-vela-dark-border' : 'text-slate-500'
            }`}
          >
            Quick Upload
          </button>
          <button
            onClick={() => setMode('form')}
            className={`px-8 py-2 text-[11px] font-medium uppercase tracking-widest rounded-full transition-all ${
              mode === 'form' ? 'bg-white dark:bg-vela-dark text-blue-500 dark:text-blue-400 shadow-sm border border-vela-light-border dark:border-vela-dark-border' : 'text-slate-500'
            }`}
          >
            Detailed Form
          </button>
        </div>
      </div>

      {mode === 'upload' && (
        <div className="flex flex-col gap-4 px-4">
          <div className="flex flex-col gap-6 p-16 border-2 border-dashed border-vela-light-border dark:border-vela-dark-border rounded-2xl bg-white dark:bg-vela-dark-surface text-center transition-colors">
            <div className="mx-auto w-14 h-14 bg-blue-50 dark:bg-blue-900/10 text-blue-500 rounded-full flex items-center justify-center">
              {uploadedFile ? <CheckCircle2 size={28} className="text-emerald-500" /> : <FileUp size={28} />}
            </div>
            <div>
              <h3 className="font-medium text-lg text-vela-light-text dark:text-vela-dark-text mb-2">
                {uploadedFile ? 'Resume Uploaded' : 'Upload Existing Resume'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto">
                {uploadedFile ? `Attached: ${uploadedFileName}` : 'Upload a PDF to pre-fill your professional history for tailoring.'}
              </p>
              <label className="bg-slate-900 dark:bg-slate-700 hover:bg-black dark:hover:bg-slate-600 text-white px-10 py-3 rounded-xl cursor-pointer transition-all font-medium uppercase text-[11px] tracking-wider inline-block">
                {uploadedFile ? 'Change PDF' : 'Choose PDF'}
                <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} />
              </label>
            </div>
            {uploadedFile && (
              <div className="text-[11px] font-medium uppercase text-emerald-500 tracking-widest flex items-center justify-center gap-1">
                <CheckCircle2 size={14} /> File Ready for tailoring
              </div>
            )}
          </div>
          {renderLinksSection()}
        </div>
      )}

      {mode === 'form' && (
        <div className="flex flex-col gap-10 p-10 bg-white dark:bg-vela-dark-surface border border-vela-light-border dark:border-vela-dark-border rounded-2xl mx-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <h3 className="font-medium text-vela-light-text dark:text-vela-dark-text border-b border-vela-light-border dark:border-vela-dark-border pb-3 mb-2 uppercase text-[11px] tracking-widest">Personal Details</h3>
            </div>
            <input
              type="text"
              placeholder="Full Name"
              className="p-3.5 border border-vela-light-border dark:border-vela-dark-border rounded-xl text-sm bg-vela-light-surface dark:bg-vela-dark text-vela-light-text dark:text-vela-dark-text focus:bg-white outline-none focus:ring-1 focus:ring-blue-500"
              value={profile.name}
              onChange={(e) => updateField('name', e.target.value)}
            />
            <input
              type="email"
              placeholder="Email Address"
              className="p-3.5 border border-vela-light-border dark:border-vela-dark-border rounded-xl text-sm bg-vela-light-surface dark:bg-vela-dark text-vela-light-text dark:text-vela-dark-text focus:bg-white outline-none focus:ring-1 focus:ring-blue-500"
              value={profile.email}
              onChange={(e) => updateField('email', e.target.value)}
            />
            <input
              type="text"
              placeholder="Phone Number"
              className="p-3.5 border border-vela-light-border dark:border-vela-dark-border rounded-xl text-sm bg-vela-light-surface dark:bg-vela-dark text-vela-light-text dark:text-vela-dark-text focus:bg-white outline-none focus:ring-1 focus:ring-blue-500"
              value={profile.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />
            <input
              type="text"
              placeholder="Location"
              className="p-3.5 border border-vela-light-border dark:border-vela-dark-border rounded-xl text-sm bg-vela-light-surface dark:bg-vela-dark text-vela-light-text dark:text-vela-dark-text focus:bg-white outline-none focus:ring-1 focus:ring-blue-500"
              value={profile.location}
              onChange={(e) => updateField('location', e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-vela-light-border dark:border-vela-dark-border pb-3">
              <h3 className="font-medium text-vela-light-text dark:text-vela-dark-text uppercase text-[11px] tracking-widest">Experience</h3>
              <button onClick={() => addItem('experience')} className="text-blue-500 dark:text-blue-400 flex items-center gap-1 text-[11px] font-medium uppercase">
                <Plus size={14} /> Add Role
              </button>
            </div>
            {profile.experience.map((exp) => (
              <div key={exp.id} className="relative p-6 border border-vela-light-border dark:border-vela-dark-border rounded-xl bg-vela-light-surface dark:bg-vela-dark flex flex-col gap-4">
                <button onClick={() => removeItem('experience', exp.id)} className="absolute top-6 right-6 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input placeholder="Organization" className="p-3 border border-vela-light-border dark:border-vela-dark-border rounded-xl text-sm bg-white dark:bg-vela-dark-surface text-vela-light-text dark:text-vela-dark-text outline-none focus:ring-1 focus:ring-blue-500" value={exp.company} onChange={(e) => updateListItem('experience', exp.id, 'company', e.target.value)} />
                  <input placeholder="Position" className="p-3 border border-vela-light-border dark:border-vela-dark-border rounded-xl text-sm bg-white dark:bg-vela-dark-surface text-vela-light-text dark:text-vela-dark-text outline-none focus:ring-1 focus:ring-blue-500" value={exp.role} onChange={(e) => updateListItem('experience', exp.id, 'role', e.target.value)} />
                  <input placeholder="Dates" className="p-3 border border-vela-light-border dark:border-vela-dark-border rounded-xl text-sm bg-white dark:bg-vela-dark-surface text-vela-light-text dark:text-vela-dark-text outline-none focus:ring-1 focus:ring-blue-500" value={exp.dates} onChange={(e) => updateListItem('experience', exp.id, 'dates', e.target.value)} />
                </div>
                <textarea placeholder="Bullet points..." className="p-4 border border-vela-light-border dark:border-vela-dark-border rounded-xl text-sm h-32 bg-white dark:bg-vela-dark-surface text-vela-light-text dark:text-vela-dark-text outline-none focus:ring-1 focus:ring-blue-500 resize-none" value={exp.description} onChange={(e) => updateListItem('experience', exp.id, 'description', e.target.value)} />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex flex-col gap-4">
              <h3 className="font-medium text-vela-light-text dark:text-vela-dark-text border-b border-vela-light-border dark:border-vela-dark-border pb-3 uppercase text-[11px] tracking-widest">Hard Skills</h3>
              <textarea
                placeholder="React, Python, AWS..."
                className="p-4 border border-vela-light-border dark:border-vela-dark-border rounded-xl text-sm h-32 bg-vela-light-surface dark:bg-vela-dark text-vela-light-text dark:text-vela-dark-text focus:bg-white outline-none transition-all resize-none focus:ring-1 focus:ring-blue-500"
                value={profile.technologies}
                onChange={(e) => updateField('technologies', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="font-medium text-vela-light-text dark:text-vela-dark-text border-b border-vela-light-border dark:border-vela-dark-border pb-3 uppercase text-[11px] tracking-widest">Soft Skills</h3>
              <textarea
                placeholder="Communication, Leadership..."
                className="p-4 border border-vela-light-border dark:border-vela-dark-border rounded-xl text-sm h-32 bg-vela-light-surface dark:bg-vela-dark text-vela-light-text dark:text-vela-dark-text focus:bg-white outline-none transition-all resize-none focus:ring-1 focus:ring-blue-500"
                value={profile.skills}
                onChange={(e) => updateField('skills', e.target.value)}
              />
            </div>
          </div>
          {renderLinksSection()}
        </div>
      )}
    </div>
  );
};