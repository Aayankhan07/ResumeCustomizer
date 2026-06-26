import { useState, useCallback } from 'react';
import { transformResume, updateTransformationScore } from '../lib/api';
import { computeMatchScore } from '../utils/matchScore';
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
        
        // Compute highly accurate match score on the client side
        const { score: localScore } = computeMatchScore(jobDescriptionText, data.data);
        
        // In background, heal the database row if there is a mismatch
        if (data.data && data.transformation_id && data.data.meta?.match_score !== localScore) {
          updateTransformationScore(data.transformation_id, localScore).catch(console.error);
          if (data.data.meta) {
            data.data.meta.match_score = localScore;
          }
        }

        setState({
          status: 'success',
          result: data.data,
          plainText: data.plain_text,
          transformationId: data.transformation_id,
          error: null,
          rateLimit: data.rate_limit,
        });
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
          rateLimit: err.code === 'RATE_LIMIT_EXCEEDED' ? { resetAt: err.resetAt } : s.rateLimit,
        }));
        if (err.code !== 'RATE_LIMIT_EXCEEDED' && err.code !== 'DATABASE_SAVE_FAILED') {
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
