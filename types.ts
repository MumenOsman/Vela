export interface Experience {
  id: string;
  company: string;
  role: string;
  dates: string;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  dates: string;
}

export interface ExternalLink {
  id: string;
  label: string;
  url: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string;
  technologies: string;
  languages: string;
  experience: Experience[];
  education: Education[];
  links: ExternalLink[];
}

export interface ResumeData {
  personalInfo: {
    name: string;
    title: string;
    contact: {
      email: string;
      phone: string;
      location: string;
      links: { label: string; url: string; }[];
    };
  };
  summary: string;
  skills: {
    technical: string[];
    soft: string[];
  };
  languages: string[];
  experience: {
    role: string;
    company: string;
    dates: string;
    bullets: string[];
  }[];
  education: {
    degree: string;
    school: string;
    year: string;
  }[];
}

export type InputMode = 'form' | 'upload';

export interface FileData {
  data: string; // base64
  mimeType: string;
}

export interface AppState {
  jobDescription: string;
  rawResumeText: string;
  uploadedFile: FileData | null;
  uploadedFileName: string;
  profile: UserProfile;
  mode: InputMode;
  generatedContent: string;
  isGenerating: boolean;
  activeView: 'resume' | 'cover-letter';
}