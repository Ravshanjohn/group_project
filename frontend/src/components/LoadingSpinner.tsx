import React from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';

const LoadingSpinner =({ spinnerColor = 'white' }: { spinnerColor?: string }) => {
  return (
    <div className="card flex items-center justify-center w-full h-screen">
        <ProgressSpinner 
          style={{width: '25px', height: '25px'}} 
          strokeWidth="10"  
          animationDuration=".5s"
          pt={{
            circle: {
              style: {
                stroke: spinnerColor,
                animation: 'p-progress-spinner-dash 1.5s ease-in-out infinite'
              }
            }
          }}
        />
    </div>
  );
}

export default LoadingSpinner;