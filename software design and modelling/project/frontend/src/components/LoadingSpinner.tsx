import React from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';

const LoadingSpinner = ({
  spinnerColor = 'white',
  className = '',
}: {
  spinnerColor?: string;
  className?: string;
}) => {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/20 ${className}`}>
      <ProgressSpinner
        style={{ width: '25px', height: '25px' }}
        strokeWidth="10"
        animationDuration=".5s"
        pt={{
          circle: {
            style: {
              stroke: spinnerColor,
              animation: 'p-progress-spinner-dash 1.5s ease-in-out infinite',
            },
          },
        }}
      />
    </div>
  );
};

export default LoadingSpinner;