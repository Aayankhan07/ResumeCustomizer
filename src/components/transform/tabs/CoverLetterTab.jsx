import React, { useState } from 'react';
import { Copy, Download } from 'lucide-react';
import { toast } from 'sonner';
import { trackEvent } from '../../../utils/analytics';


export default function CoverLetterTab({ 
  coverLetter, 
  contact = {}, 
  meta = {}, 
  elevatorPitch,
  createdAt 
}) {
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [copiedLetter, setCopiedLetter] = useState(false);

  const getCleanLetterBody = () => {
    let text = coverLetter || '';
    if (contact?.name) {
      text = text.replace(/\[Your Name\]/gi, contact.name);
    }
    const companyName = meta?.detected_company && meta.detected_company !== 'Not Specified' ? meta.detected_company : 'the company';
    text = text.replace(/\[Hiring Company\]/gi, companyName);
    text = text.replace(/\[Company Name\]/gi, companyName);
    return text;
  };

  const getFormattedLetter = () => {
    const cleanBody = getCleanLetterBody();
    
    // Check if the body already seems to have contact header
    const hasHeader = cleanBody.includes('Dear') || cleanBody.includes('Subject') || cleanBody.includes(contact?.name || '___');
    if (hasHeader) {
      return cleanBody;
    }

    const formattedDate = createdAt 
      ? new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) 
      : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      
    const companyName = meta?.detected_company && meta.detected_company !== 'Not Specified' ? meta.detected_company : 'Hiring Company';
    const addressee = meta?.detected_company && meta.detected_company !== 'Not Specified' ? meta.detected_company : 'Hiring Team';

    return `${contact?.name || 'Your Name'}
${[contact?.email, contact?.phone, contact?.location].filter(Boolean).join(' · ')}
${contact?.linkedin ? `LinkedIn: ${contact.linkedin}` : ''}

${formattedDate}

${addressee === 'Hiring Team' ? 'Hiring Team' : `Hiring Manager at ${companyName}`}
${companyName}

Subject: Application for ${meta?.detected_job_title || 'Target Position'}

Dear Hiring Manager,

${cleanBody}`;
  };

  const formattedLetter = getFormattedLetter();

  const handleCopyLetter = async () => {
    setCopiedLetter(true);
    try {
      await navigator.clipboard.writeText(formattedLetter);
      trackEvent('cover_letter_copied');
      toast.success('Cover letter copied');
    } catch (err) {
      toast.error('Failed to copy cover letter.');
    } finally {
      setTimeout(() => setCopiedLetter(false), 1500);
    }
  };

  const handleDownloadLetter = () => {
    try {
      const element = document.createElement("a");
      const file = new Blob([formattedLetter], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      const jobTitle = meta?.detected_job_title ? meta.detected_job_title.replace(/\s+/g, '_') : 'Job';
      element.download = `Cover_Letter_${jobTitle}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success('Cover letter downloaded');
    } catch (err) {
      toast.error('Failed to download cover letter.');
    }
  };

  const handleCopyPitch = async () => {
    if (!elevatorPitch) return;
    setCopiedPitch(true);
    try {
      await navigator.clipboard.writeText(elevatorPitch);
      toast.success('Elevator pitch copied');
    } catch (err) {
      toast.error('Failed to copy pitch.');
    } finally {
      setTimeout(() => setCopiedPitch(false), 1500);
    }
  };

  return (
    <div className="animate-fade-in flex flex-col gap-6 text-left font-sans text-[var(--text-primary)] bg-transparent">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Application Narratives</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-normal">Tailored cover letter matching your resume and professional pitch.</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleCopyLetter}
            className="btn-default py-1.5 px-3 text-xs font-medium rounded-[var(--radius-sm)] flex items-center gap-1.5"
          >
            <Copy size={13} />
            {copiedLetter ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleDownloadLetter}
            className="btn-primary py-1.5 px-3 text-xs font-medium rounded-[var(--radius-sm)] flex items-center gap-1.5"
          >
            <Download size={13} />
            Download
          </button>
        </div>
      </div>

      {/* Section 1: Cover Letter Preview Card */}
      <div className="border border-[var(--border-default)] bg-[var(--bg-elevated)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-sm)]">
        <div className="bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-[var(--radius-md)] p-5 sm:p-6 text-sm leading-relaxed text-[var(--text-secondary)] font-sans whitespace-pre-wrap select-all max-h-[480px] overflow-y-auto">
          {formattedLetter}
        </div>
      </div>

      {/* Section 2: Elevator Pitch */}
      {elevatorPitch && (
        <div className="flex flex-col gap-3">
          <div className="border border-[var(--border-default)] border-l-[3px] border-l-[var(--accent)] bg-[var(--bg-elevated)] rounded-[var(--radius-md)] p-5 relative shadow-[var(--shadow-sm)]">
            <div className="flex justify-between items-center mb-2.5 select-none">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                YOUR 30-SECOND PITCH
              </span>
              <button
                onClick={handleCopyPitch}
                className="btn-default py-1 px-2.5 text-[10px] font-medium rounded-[var(--radius-xs)]"
              >
                {copiedPitch ? 'Copied Pitch' : 'Copy Pitch'}
              </button>
            </div>
            <p className="text-sm text-[var(--text-secondary)] italic font-normal leading-relaxed select-all mt-2">
              "{elevatorPitch}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
