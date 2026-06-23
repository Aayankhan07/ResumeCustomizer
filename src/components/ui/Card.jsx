import { forwardRef } from 'react';

const Card = forwardRef(({ className = '', hoverable = false, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`bg-white border border-boundary rounded-xl p-6 shadow-card transition-all duration-200 ${
        hoverable ? 'cursor-pointer hover:border-gray-300 hover:shadow-card-hover' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';
export default Card;
