export function getScoreColor(score) {
  if (score >= 75) return { text: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-300' };
  if (score >= 50) return { text: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-300' };
  return               { text: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-300'   };
}
