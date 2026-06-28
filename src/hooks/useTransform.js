import { useState, useCallback } from 'react';
import { transformResume } from '../lib/api';
import { toast } from 'sonner';

const RETRY_ERRORS = ['AI_TIMEOUT', 'INTERNAL_SERVER_ERROR'];

export function useTransform() {
  const [state, setState] = useState({
    status: 'idle',      // idle | loading | success | error
    result: null,
    plainText: null,
    transformationId: null,
    error: null,
    errorDetails: null,
    rateLimit: null,
  });

  const transform = useCallback(async ({ resumeText, jobDescriptionText }) => {
    setState(s => ({ ...s, status: 'loading', error: null }));

    const attemptTransform = async (attempt = 1) => {
      try {
        const data = await transformResume({ resumeText, jobDescriptionText });

        setState({
          status: 'success',
          result: data.data,
          plainText: data.plain_text,
          transformationId: data.transformation_id,
          error: null,
          rateLimit: data.rate_limit,
        });

        if (data.db_error) {
          console.error('Database save error:', data.db_error);
          toast.error(`Failed to save to history: ${data.db_error.message || JSON.stringify(data.db_error)}`);
        }
      } catch (err) {
        if (attempt === 1 && RETRY_ERRORS.includes(err.code)) {
          // Auto-retry once after 2 seconds
          await new Promise(r => setTimeout(r, 2000));
          return attemptTransform(2);
        }
        setState(s => ({
          ...s,
          status: 'error',
          error: err.code ?? 'UNKNOWN_ERROR',
          errorDetails: err.details ?? null,
          rateLimit: (err.code === 'RATE_LIMIT_EXCEEDED' || err.code === 'RATE_LIMITED') ? { resetAt: err.resetAt } : s.rateLimit,
        }));
        if (err.code !== 'RATE_LIMIT_EXCEEDED' && err.code !== 'RATE_LIMITED' && err.code !== 'DATABASE_SAVE_FAILED') {
          toast.error('Transform failed. Please try again.');
        }
      }
    };

    await attemptTransform();
  }, []);

  const reset = useCallback(() => {
    setState({
      status: 'idle', result: null, plainText: null,
      transformationId: null, error: null, rateLimit: null,
    });
  }, []);

  return { ...state, transform, reset };
}
