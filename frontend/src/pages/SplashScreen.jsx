import React, {useEffect} from 'react';
import { WavyBackground } from "@/components/ui/wavy-background.jsx"

export function SplashScreen() {

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden'; // also html

    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, []);
  
  return (
      <div className='overflow-y-hidden overflow-x-hidden'>
        <WavyBackground className="max-w-4xl mx-auto pb-40 ">
          <p className="text-2xl md:text-4xl lg:text-7xl text-white font-bold inter-var text-center">
            Soldiers of GOD
          </p>
          <p className="text-base md:text-lg mt-4 text-white font-normal inter-var text-center">
            Shreekar hostel  
          </p>
        </WavyBackground>
      </div>
  );
}
