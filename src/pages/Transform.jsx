import { useState } from 'react';
import { useTransform } from '../hooks/useTransform';
import { ArrowLeft, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ResumeInput from '../components/transform/wizard/ResumeInput';
import JobInput from '../components/transform/wizard/JobInput';
import TransformLoading from '../components/transform/wizard/TransformLoading';
import TransformOutput from '../components/transform/TransformOutput';
import TransformErrorPanel from '../components/transform/workspace/TransformErrorPanel';
import Button from '../components/ui/Button';

export default function Transform() {
  const [step, setStep] = useState(1);
  const [resumeText, setResumeText] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const { status, result, plainText, error, errorDetails, rateLimit, transform, reset } = useTransform();

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
    <div className="min-h-screen bg-mist flex flex-col font-sans">
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
            onReset={handleReset}
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
              <h1 className="font-serif text-3xl text-ink font-bold">Optimize Resume</h1>
              <p className="text-sm text-graphite mt-1">Transform your resume to match the requirements of the job description.</p>
            </div>

            {/* Step progress bar */}
            <div className="flex items-center justify-between max-w-sm w-full mx-auto mb-6 select-none px-4">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold transition-all duration-150 ${
                  step === 1 ? 'bg-slate-900 text-white shadow-sm' : 'bg-emerald-600 text-white border border-emerald-500'
                }`}>
                  {step > 1 ? '✓' : '1'}
                </div>
                <span className={`text-xs font-semibold tracking-wide uppercase ${step === 1 ? 'text-slate-900' : 'text-slate-400'}`}>Resume</span>
              </div>
              
              <div className="flex-1 h-0.5 mx-4 bg-slate-200 relative rounded-full">
                <div 
                  className="absolute inset-y-0 left-0 bg-slate-900 transition-all duration-300 ease-in-out rounded-full" 
                  style={{ width: step > 1 ? '100%' : '0%' }}
                />
              </div>
              
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold transition-all duration-150 ${
                  step === 2 ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}>
                  2
                </div>
                <span className={`text-xs font-semibold tracking-wide uppercase ${step === 2 ? 'text-slate-900' : 'text-slate-400'}`}>Target Job</span>
              </div>
            </div>

            {/* Wizard Steps */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm">
              {step === 1 ? (
                <ResumeInput value={resumeText} onChange={setResumeText} />
              ) : (
                <JobInput value={jobDescriptionText} onChange={setJobDescriptionText} />
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between border-t border-slate-200 pt-6 mt-8">
                {step === 2 ? (
                  <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2 border border-slate-200 hover:bg-slate-50 py-2 px-4 rounded-md text-sm font-medium text-slate-700">
                    <ArrowLeft size={15} />
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                {step === 1 ? (
                  <Button
                    variant="primary"
                    onClick={handleNext}
                    disabled={!isStep1Valid}
                    className="flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 py-2 px-5 rounded-md text-sm font-medium"
                  >
                    Next Step
                    <ArrowRight size={15} />
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handleTransform}
                    disabled={!isStep2Valid || status === 'loading'}
                    className="flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 py-2 px-5 rounded-md text-sm font-medium"
                  >
                    Transform CV
                    <ArrowRight size={15} />
                  </Button>
                )}
              </div>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
