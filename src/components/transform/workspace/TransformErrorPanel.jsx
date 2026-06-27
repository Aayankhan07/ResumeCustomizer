import { useEffect, useState } from 'react';
import { Clock, WifiOff, AlertOctagon, ShieldAlert, RefreshCw, LogIn, FileText, AlertTriangle } from 'lucide-react';
import GlassPanel from '../../ui/GlassPanel';
import Button from '../../ui/Button';
import { ERROR_MESSAGES } from '../../../utils/errors';

export default function TransformErrorPanel({ 
  errorCode, 
  errorDetails, 
  rateLimit, 
  onRetry 
}) {
  const [timeLeft, setTimeLeft] = useState('');

  // Map rate limit standard codes to either RATE_LIMITED or RATE_LIMIT_EXCEEDED
  const normalizedErrorCode = errorCode === 'RATE_LIMIT_EXCEEDED' ? 'RATE_LIMITED' : errorCode;
  const errorObj = ERROR_MESSAGES[normalizedErrorCode] || ERROR_MESSAGES.DEFAULT_ERROR;

  // Rate limit countdown logic
  useEffect(() => {
    if (normalizedErrorCode !== 'RATE_LIMITED') return;

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
  }, [normalizedErrorCode, rateLimit]);

  // Determine icon based on error
  const getIcon = () => {
    switch (normalizedErrorCode) {
      case 'RATE_LIMITED':
        return <Clock className="w-7 h-7 text-amber-500 animate-pulse" />;
      case 'CONTENT_TOO_LONG':
        return <FileText className="w-7 h-7 text-rose-500" />;
      case 'AI_TIMEOUT':
        return <WifiOff className="w-7 h-7 text-blue-400" />;
      case 'AUTH_FAILED':
      case 'UNAUTHORIZED':
        return <ShieldAlert className="w-7 h-7 text-red-500" />;
      case 'INVALID_JD':
        return <AlertTriangle className="w-7 h-7 text-amber-500" />;
      case 'PARSE_FAILED':
      default:
        return <AlertOctagon className="w-7 h-7 text-slate-400" />;
    }
  };

  // Determine border color and glows
  const getPanelClass = () => {
    switch (normalizedErrorCode) {
      case 'RATE_LIMITED':
        return "border-amber-500/20 shadow-[0_0_40px_-12px_rgba(245,158,11,0.15)]";
      case 'CONTENT_TOO_LONG':
      case 'AUTH_FAILED':
      case 'UNAUTHORIZED':
        return "border-red-500/20 shadow-[0_0_40px_-12px_rgba(239,68,68,0.15)]";
      case 'AI_TIMEOUT':
        return "border-blue-500/20 shadow-[0_0_40px_-12px_rgba(59,130,246,0.15)]";
      case 'INVALID_JD':
        return "border-amber-500/20 shadow-[0_0_40px_-12px_rgba(245,158,11,0.15)]";
      default:
        return "border-slate-700/80";
    }
  };

  // Determine badge background and text colors
  const getBadgeClass = () => {
    switch (normalizedErrorCode) {
      case 'RATE_LIMITED':
        return "text-amber-600 bg-amber-50 border-amber-100";
      case 'CONTENT_TOO_LONG':
      case 'AUTH_FAILED':
      case 'UNAUTHORIZED':
        return "text-red-400 bg-red-950/40 border-red-850/55";
      case 'AI_TIMEOUT':
        return "text-blue-400 bg-blue-950/40 border-blue-850/55";
      case 'INVALID_JD':
        return "text-amber-600 bg-amber-50 border-amber-100";
      default:
        return "text-slate-400 bg-slate-950/40 border-slate-800";
    }
  };

  // Dynamic description mapping
  const getDescription = () => {
    if (normalizedErrorCode === 'RATE_LIMITED') {
      return errorObj.description(timeLeft || 'some time');
    }
    if (normalizedErrorCode === 'CONTENT_TOO_LONG') {
      // Look for max/actual details in errorDetails if provided
      const max = errorDetails?.max || 10000;
      const actual = errorDetails?.actual || 'too many';
      return errorObj.description(max, actual);
    }
    return errorObj.description(errorDetails);
  };

  // Action button redirect or retry trigger
  const handleActionButton = () => {
    if (normalizedErrorCode === 'AUTH_FAILED' || normalizedErrorCode === 'UNAUTHORIZED') {
      window.location.href = '/login';
    } else if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="w-full flex items-center justify-center p-4 min-h-[400px]">
      <GlassPanel className={`max-w-md w-full text-center p-6 sm:p-8 bg-slate-900/60 dark:bg-slate-900/40 ${getPanelClass()}`}>
        <div className="mx-auto w-14 h-14 bg-slate-800/65 border border-slate-700/60 rounded-full flex items-center justify-center mb-5">
          {getIcon()}
        </div>
        
        <span className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border rounded-md mb-3 ${getBadgeClass()}`}>
          {normalizedErrorCode}
        </span>

        <h3 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-2">
          {errorObj.title}
        </h3>
        
        <p className="text-xs text-slate-400 leading-relaxed mb-6 font-semibold">
          {getDescription()}
        </p>

        {normalizedErrorCode === 'RATE_LIMITED' && (
          <div className="py-4 px-6 bg-slate-950/70 border border-slate-800 rounded-xl mb-6 flex flex-col items-center justify-center">
            <span className="text-[9px] font-bold font-mono uppercase tracking-widest text-slate-500 mb-1">
              Limit Resets In
            </span>
            <span className="text-3xl font-mono font-bold text-amber-400 tracking-wider">
              {timeLeft || 'Calculating...'}
            </span>
          </div>
        )}

        <div className="flex gap-3">
          <Button 
            onClick={handleActionButton}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-100 text-slate-900 border-0 font-bold"
          >
            {normalizedErrorCode === 'RATE_LIMITED' ? 'Check Status' : errorObj.action}
          </Button>
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
