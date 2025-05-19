import { useEffect, useRef } from 'react';

/**
 * Custom hook for playing audio sounds
 */
const useAudio = () => {
  const audioRef = useRef(null);
  
  const play = (src, options = {}) => {
    try {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      // Create new audio element
      const audio = new Audio(src);
      
      // Set options
      if (options.volume !== undefined) {
        audio.volume = options.volume;
      }
      
      if (options.loop !== undefined) {
        audio.loop = options.loop;
      }
      
      // Play the audio
      audio.play().catch(error => {
        console.warn('Audio play failed:', error);
      });
      
      // Store the reference
      audioRef.current = audio;
      
      // Return the audio element for further control
      return audio;
    } catch (error) {
      console.warn('Failed to play audio:', error);
      return null;
    }
  };
  
  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  
  return { play, stop };
};

export default useAudio; 