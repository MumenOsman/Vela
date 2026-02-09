import React from 'react';
import { ResumeData } from '../types';

export const renderResumeToHTML = (data: ResumeData): string => {
  const { personalInfo, summary, skills, languages, experience, education } = data;
  
  const skillItem = (s: string) => `<span class="bg-slate-50 text-slate-900 px-1.5 py-0.5 rounded border border-slate-200 text-[10px] font-medium leading-none whitespace-nowrap">${s}</span>`;
  const separator = `<span class="text-slate-300 mx-1">|</span>`;

  return `
    <div class="resume-paper font-serif" style="width: 100%; height: auto; padding: 20mm; background: white; box-sizing: border-box; overflow: hidden; display: block; margin: 0;">
      <!-- Header - Compact, Hyperlinked & Polished -->
      <div class="text-center mb-4">
        <h1 class="text-2xl font-bold uppercase tracking-widest text-slate-900 mb-0.5" style="margin: 0;">${personalInfo.name}</h1>
        <p class="text-md font-semibold text-blue-700 mb-2 uppercase tracking-tight" style="margin: 0;">${personalInfo.title}</p>
        <div class="flex flex-wrap justify-center items-center text-xs text-slate-600 border-t border-slate-200 pt-2 font-sans">
          ${personalInfo.contact.email ? `<span>${personalInfo.contact.email}</span>` : ''}
          ${personalInfo.contact.phone ? `${separator}<span>${personalInfo.contact.phone}</span>` : ''}
          ${personalInfo.contact.location ? `${separator}<span>${personalInfo.contact.location}</span>` : ''}
          ${personalInfo.contact.links.map(link => `
            ${separator}<a href="${link.url}" target="_blank" rel="noopener noreferrer" contenteditable="false" style="color: #2563eb; text-decoration: none; border-bottom: 1px solid #2563eb;">${link.label}</a>
          `).join('')}
        </div>
      </div>

      <!-- Summary - Compact -->
      <div class="mb-4">
        <h2 class="text-sm font-bold text-slate-800 border-b border-slate-800 mb-1.5 uppercase tracking-wider">Professional Summary</h2>
        <p class="text-slate-700 text-[12px] leading-snug">${summary}</p>
      </div>

      <!-- Experience - Compact -->
      <div class="mb-4">
        <h2 class="text-sm font-bold text-slate-800 border-b border-slate-800 mb-2 uppercase tracking-wider">Professional Experience</h2>
        ${experience.map(exp => `
          <div class="mb-3 last:mb-0">
            <div class="flex justify-between items-baseline mb-0.5">
              <h3 class="font-bold text-slate-900 text-[13px]">${exp.role}</h3>
              <span class="text-[11px] italic text-slate-500 font-sans">${exp.dates}</span>
            </div>
            <p class="text-blue-700 font-bold text-[11px] mb-1 uppercase tracking-tighter">${exp.company}</p>
            <ul class="list-disc pl-4 text-[12px] text-slate-700 space-y-0.5 leading-tight">
              ${exp.bullets.map(bullet => `<li>${bullet}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>

      <!-- Skills & Languages - Compact 3-Row Block -->
      <div class="mb-4">
        <h2 class="text-sm font-bold text-slate-800 border-b border-slate-800 mb-2 uppercase tracking-wider">Skills & Expertise</h2>
        <div class="flex flex-col gap-1.5 font-sans">
          <!-- Row 1: Technical -->
          <div class="flex items-start gap-2">
            <span class="text-[10px] font-bold text-slate-500 uppercase min-w-[100px] mt-0.5 whitespace-nowrap">Technical:</span>
            <div class="flex flex-wrap gap-1">
              ${skills.technical.map(skillItem).join('')}
            </div>
          </div>
          <!-- Row 2: Soft -->
          <div class="flex items-start gap-2">
            <span class="text-[10px] font-bold text-slate-500 uppercase min-w-[100px] mt-0.5 whitespace-nowrap">Professional:</span>
            <div class="flex flex-wrap gap-1">
              ${skills.soft.map(skillItem).join('')}
            </div>
          </div>
          <!-- Row 3: Languages -->
          <div class="flex items-start gap-2">
            <span class="text-[10px] font-bold text-slate-500 uppercase min-w-[100px] mt-0.5 whitespace-nowrap">Languages:</span>
            <div class="flex flex-wrap gap-1">
              ${languages.map(lang => `<span class="text-[10px] text-slate-700">${lang}</span>`).join('<span class="text-slate-300 text-[10px] mx-1">|</span>')}
            </div>
          </div>
        </div>
      </div>

      <!-- Education - Compact -->
      <div class="mb-2">
        <h2 class="text-sm font-bold text-slate-800 border-b border-slate-800 mb-1.5 uppercase tracking-wider">Education</h2>
        ${education.map(edu => `
          <div class="flex justify-between items-baseline mb-1 last:mb-0">
            <div>
              <p class="font-bold text-slate-900 text-[12px]">${edu.degree}</p>
              <p class="text-[11px] text-slate-700">${edu.school}</p>
            </div>
            <span class="text-[11px] italic text-slate-500 font-sans">${edu.year}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};