import React, {useEffect} from 'react';
import { WavyBackground } from "@/components/ui/wavy-background.jsx"

export function SplashScreen({ onClose }) {

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden'; // also html

    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, []);
  
  return (
      <div className='overflow-y-hidden overflow-x-hidden relative'>
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 z-50 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all"
          aria-label="Close splash screen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <WavyBackground className="max-w-4xl mx-auto pb-40 ">
          <p className="text-2xl md:text-4xl lg:text-7xl text-white font-bold inter-var text-center">
            Soldiers of GOD
          </p>
          <p className="text-base md:text-3xl lg:text-4xl mt-4 font-serif text-white font-normal inter-var text-center">
            Shreekar hostel  
          </p>
        </WavyBackground>
      </div>
  );
}
