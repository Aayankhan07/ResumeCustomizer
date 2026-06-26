export function getScoreColor(score) {
  if (score >= 75) {
    return { 
      text: 'text-emerald-700 dark:text-emerald-400',  
      bg: 'bg-emerald-50 dark:bg-emerald-500/15',  
      border: 'border-emerald-200 dark:border-emerald-500/25' 
    };
  }
  if (score >= 50) {
    return { 
      text: 'text-amber-700 dark:text-amber-400',  
      bg: 'bg-amber-50 dark:bg-amber-500/15',  
      border: 'border-amber-200 dark:border-amber-500/25' 
    };
  }
  return { 
    text: 'text-rose-700 dark:text-rose-400',    
    bg: 'bg-rose-50 dark:bg-rose-500/15',    
    border: 'border-rose-200 dark:border-rose-500/25'   
  };
}
