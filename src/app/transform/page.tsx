'use client';

import { useState } from 'react';
import { useTransform } from '../../hooks/useTransform';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ResumeInput from '../../components/transform/wizard/ResumeInput';
import JobInput from '../../components/transform/wizard/JobInput';
import TransformLoading from '../../components/transform/wizard/TransformLoading';
import TransformOutput from '../../components/transform/TransformOutput';
import TransformErrorPanel from '../../components/transform/workspace/TransformErrorPanel';
import Button from '../../components/ui/Button';

export default function Transform() {
  const [step, setStep] = useState(1);
  const [resumeText, setResumeText] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const { status, result, plainText, transformationId, error, errorDetails, rateLimit, transform, reset } = useTransform();

  const handleNext = () => {
    if (step === 1 && resumeText.trim().length >= 50) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleTransform = () => {
    if (resumeText.trim().length >= 50 && jobDescriptionText.trim().length >= 50) {
      transform({ resumeText, jobDescriptionText });
    }
  };

  const handleReset = () => {
    reset();
    setStep(1);
    setResumeText('');
    setJobDescriptionText('');
  };

  const isStep1Valid = resumeText.trim().length >= 50;
  const isStep2Valid = jobDescriptionText.trim().length >= 50;

  return (
    <div className="min-h-screen bg-mist dark:bg-[#030712] text-slate-900 dark:text-slate-200 flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      <main className={`flex-1 ${status === 'success' ? 'max-w-6xl' : 'max-w-4xl'} w-full mx-auto px-4 py-12 flex flex-col justify-start transition-all duration-300`}>
        {status === 'loading' && (
          <div className="my-auto">
            <TransformLoading />
          </div>
        )}

        {status === 'success' && result && (
          <TransformOutput
            result={result}
            plainText={plainText}
            originalText={resumeText}
            jobDescriptionText={jobDescriptionText}
            onReset={handleReset}
            transformationId={transformationId}
          />
        )}

        {status === 'error' && (
          <TransformErrorPanel
            errorCode={error}
            errorDetails={errorDetails}
            rateLimit={rateLimit}
            onRetry={handleTransform}
          />
        )}

        {status === 'idle' && (
          <div className="w-full flex flex-col gap-8 stagger-children">
            {/* Header */}
            <div>
              <h1 className="font-serif text-3xl text-ink dark:text-white font-bold">Optimize Resume</h1>
              <p className="text-sm text-graphite dark:text-slate-400 mt-1 font-semibold">Transform your resume to match the requirements of the job description.</p>
            </div>

            {/* Step progress bar */}
            <div className="flex items-center justify-between max-w-sm w-full mx-auto mb-6 select-none px-4">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold transition-all duration-150 ${
                  step === 1 ? 'bg-slate-900 dark:bg-indigo-650 text-white shadow-sm' : 'bg-emerald-600 text-white border border-emerald-500'
                }`}>
                  {step > 1 ? '✓' : '1'}
                </div>
                <span className={`text-xs font-semibold tracking-wide uppercase ${step === 1 ? 'text-slate-900 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>Resume</span>
              </div>
              
              <div className="flex-1 h-0.5 mx-4 bg-slate-200 dark:bg-slate-800 relative rounded-full">
                <div 
                  className="absolute inset-y-0 left-0 bg-slate-900 dark:bg-indigo-650 transition-all duration-300 ease-in-out rounded-full" 
                  style={{ width: step > 1 ? '100%' : '0%' }}
                />
              </div>

              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold transition-all duration-150 border ${
                  step === 2 ? 'bg-slate-900 dark:bg-indigo-650 text-white border-transparent' : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800'
                }`}>
                  2
                </div>
                <span className={`text-xs font-semibold tracking-wide uppercase ${step === 2 ? 'text-slate-900 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>Job description</span>
              </div>
            </div>

            {/* Step Content */}
            <div className="w-full">
              {step === 1 ? (
                <div className="flex flex-col gap-6 animate-fade-in">
                  <ResumeInput value={resumeText} onChange={setResumeText} />
                  <div className="flex justify-end mt-2">
                    <Button 
                      onClick={handleNext}
                      disabled={!isStep1Valid}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold"
                    >
                      Next: Job Description
                      <ArrowRight size={14} className="stroke-[2.5]" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6 animate-fade-in">
                  <JobInput value={jobDescriptionText} onChange={setJobDescriptionText} />
                  <div className="flex justify-between mt-2">
                    <Button 
                      variant="ghost"
                      onClick={handleBack}
                      className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-semibold"
                    >
                      <ArrowLeft size={14} className="stroke-[2.5]" />
                      Back to Resume
                    </Button>
                    <Button 
                      onClick={handleTransform}
                      disabled={!isStep2Valid}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-500 text-white border-0 shadow-md shadow-emerald-600/10"
                    >
                      Optimize Resume
                      <ArrowRight size={14} className="stroke-[2.5]" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
