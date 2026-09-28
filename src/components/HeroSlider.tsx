import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Banner } from '../types';

interface HeroSliderProps {
  banners: Banner[];
  onExplore: (link: string) => void;
}

export default function HeroSlider({ banners, onExplore }: HeroSliderProps) {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % banners.length);
  };

  if (!banners.length) {
    return (
      <div className="w-full h-[480px] sm:h-[650px] bg-neutral-900 flex items-center justify-center">
        <div className="animate-pulse space-y-4 text-center">
          <div className="h-4 bg-neutral-800 rounded-none w-48 mx-auto" />
          <div className="h-8 bg-neutral-800 rounded-none w-96 mx-auto" />
        </div>
      </div>
    );
  }

  const currentBanner = banners[currentIdx];

  return (
    <div className="relative w-full h-[480px] sm:h-[650px] overflow-hidden bg-neutral-950 font-sans">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={currentBanner.image}
            alt={currentBanner.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-75"
          />

          <div className="absolute inset-0 bg-neutral-950/50" />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-[1600px] mx-auto px-6 sm:px-16 md:px-24 w-full flex flex-col items-center justify-center text-center">
              <div className="max-w-2xl text-white flex flex-col items-center">
                <motion.span
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="inline-block text-[10px] font-bold tracking-[0.3em] text-neutral-300 uppercase mb-4"
                >
                  NEW ARRIVALS 
                </motion.span>
                <motion.h1
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-3xl sm:text-5xl md:text-6xl font-display font-light lowercase italic tracking-[0.05em] leading-tight mb-4 sm:mb-6 text-white text-center"
                >
                  {currentBanner.title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-neutral-300 font-sans text-[11px] sm:text-xs md:text-sm leading-relaxed font-light tracking-widest uppercase mb-6 sm:mb-10 max-w-xl text-center"
                >
                  {currentBanner.subtitle}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="flex justify-center"
                >
                  <button
                    onClick={() => onExplore(currentBanner.link)}
                    className="px-6 py-3 sm:px-8 sm:py-3.5 bg-white text-neutral-950 hover:bg-neutral-100 font-sans text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 focus:outline-none cursor-pointer rounded-none border border-white"
                  >
                    Explore Collection
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="hidden sm:block absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-none border border-white/10 bg-black/30 backdrop-blur-xs hover:bg-black/80 text-white transition-all cursor-pointer focus:outline-none"
            aria-label="Previous Slide"
          >
            <ArrowLeft className="w-4 h-4 stroke-[1.5]" />
          </button>
          <button
            onClick={handleNext}
            className="hidden sm:block absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-none border border-white/10 bg-black/30 backdrop-blur-xs hover:bg-black/80 text-white transition-all cursor-pointer focus:outline-none"
            aria-label="Next Slide"
          >
            <ArrowRight className="w-4 h-4 stroke-[1.5]" />
          </button>
        </>
      )}

      {banners.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex space-x-2.5 z-10">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`h-[3px] transition-all duration-300 cursor-pointer focus:outline-none rounded-none ${
                currentIdx === idx ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
