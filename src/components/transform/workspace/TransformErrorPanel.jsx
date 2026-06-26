import { useEffect, useState } from 'react';
import { Clock, WifiOff, AlertOctagon, ShieldAlert, RefreshCw, LogIn } from 'lucide-react';
import GlassPanel from '../../ui/GlassPanel';
import Button from '../../ui/Button';

export default function TransformErrorPanel({ 
  errorCode, 
  errorDetails, 
  rateLimit, 
  onRetry 
}) {
  const [timeLeft, setTimeLeft] = useState('');

  // Rate limit countdown logic
  useEffect(() => {
    if (errorCode !== 'RATE_LIMIT_EXCEEDED') return;

    const resetTime = rateLimit?.resetAt ? new Date(rateLimit.resetAt).getTime() : Date.now() + 3600 * 1000; // default 1 hour ahead
    
    const updateTimer = () => {
      const now = Date.now();
      const diff = resetTime - now;
      
      if (diff <= 0) {
        setTimeLeft('00:00');
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      const hrsStr = hours > 0 ? `${hours}:` : '';
      const minsStr = minutes < 10 ? `0${minutes}` : minutes;
      const secsStr = seconds < 10 ? `0${seconds}` : seconds;
      
      setTimeLeft(`${hrsStr}${minsStr}:${secsStr}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [errorCode, rateLimit]);

  // Map error states
  switch (errorCode) {
    case 'RATE_LIMIT_EXCEEDED':
      return (
        <div className="w-full flex items-center justify-center p-4 min-h-[400px]">
          <GlassPanel className="max-w-md w-full text-center border-amber-500/20 shadow-[0_0_40px_-12px_rgba(245,158,11,0.15)] bg-slate-900/60 dark:bg-slate-900/40 p-6 sm:p-8">
            <div className="mx-auto w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mb-5">
              <Clock className="w-7 h-7 text-amber-500 animate-pulse" />
            </div>
            
            <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-100 rounded-md mb-3">
              Hourly Policy Reached
            </span>

            <h3 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-2">
              Optimization Rate Limit
            </h3>
            
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Our AI engine has a policy of <strong>10 resume optimizations per hour</strong> to ensure fair resource allocation. You have hit this limit. Please wait for the reset.
            </p>

            {/* Countdown timer container */}
            <div className="py-4 px-6 bg-slate-950/70 border border-slate-800 rounded-xl mb-6 flex flex-col items-center justify-center">
              <span className="text-[9px] font-bold font-mono uppercase tracking-widest text-slate-500 mb-1">
                Limit Resets In
              </span>
              <span className="text-3xl font-mono font-bold text-amber-400 tracking-wider">
                {timeLeft || 'Calculating...'}
              </span>
            </div>

            <Button 
              onClick={() => window.location.reload()}
              size="sm"
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              Check Status
            </Button>
          </GlassPanel>
        </div>
      );

    case 'AI_TIMEOUT':
      return (
        <div className="w-full flex items-center justify-center p-4 min-h-[400px]">
          <GlassPanel className="max-w-md w-full text-center border-blue-500/20 shadow-[0_0_40px_-12px_rgba(59,130,246,0.15)] bg-slate-900/60 dark:bg-slate-900/40 p-6 sm:p-8">
            <div className="mx-auto w-14 h-14 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center mb-5">
              <WifiOff className="w-7 h-7 text-blue-400" />
            </div>
            
            <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-950/40 border border-blue-850/55 rounded-md mb-3">
              Network Delay
            </span>

            <h3 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-2">
              AI Timeout Exceeded
            </h3>
            
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              The AI model took too long to compile your tailored CV. This usually happens during peak demand. A quick retry often solves the connection.
            </p>

            <div className="flex gap-3">
              {onRetry && (
                <Button 
                  onClick={onRetry}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 border-0"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry Optimization
                </Button>
              )}
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/dashboard'}
                className="flex-1 border-slate-700/80 hover:bg-slate-800/40 text-slate-300"
              >
                Cancel
              </Button>
            </div>
          </GlassPanel>
        </div>
      );

    case 'UNAUTHORIZED':
      return (
        <div className="w-full flex items-center justify-center p-4 min-h-[400px]">
          <GlassPanel className="max-w-md w-full text-center border-red-500/20 shadow-[0_0_40px_-12px_rgba(239,68,68,0.15)] bg-slate-900/60 dark:bg-slate-900/40 p-6 sm:p-8">
            <div className="mx-auto w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mb-5">
              <ShieldAlert className="w-7 h-7 text-red-500" />
            </div>
            
            <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-red-400 bg-red-950/40 border border-red-850/55 rounded-md mb-3">
              Session Expired
            </span>

            <h3 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-2">
              Authentication Required
            </h3>
            
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Your security session has expired or is invalid. Please log in again to continue customizing your resumes.
            </p>

            <Button 
              onClick={() => window.location.href = '/login'}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-500/20 border-0 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Re-Authenticate
            </Button>
          </GlassPanel>
        </div>
      );

    default:
      return (
        <div className="w-full flex items-center justify-center p-4 min-h-[400px]">
          <GlassPanel className="max-w-md w-full text-center border-slate-700/80 bg-slate-900/60 dark:bg-slate-900/40 p-6 sm:p-8">
            <div className="mx-auto w-14 h-14 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center mb-5">
              <AlertOctagon className="w-7 h-7 text-slate-400" />
            </div>
            
            <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-950/40 border border-slate-800 rounded-md mb-3">
              System Error
            </span>

            <h3 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-2">
              Something Went Wrong
            </h3>
            
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              {errorDetails || "We encountered an unexpected error while processing your resume. Please check your inputs and try again."}
            </p>

            <div className="flex gap-3">
              {onRetry && (
                <Button 
                  onClick={onRetry}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-100 text-slate-900 border-0 font-bold"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
              )}
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/dashboard'}
                className="flex-1 border-slate-700/80 hover:bg-slate-800/40 text-slate-300"
              >
                Go Dashboard
              </Button>
            </div>
          </GlassPanel>
        </div>
      );
  }
}
