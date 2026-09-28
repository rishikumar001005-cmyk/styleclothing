import React from 'react';
import { motion } from 'motion/react';
import { Compass, Heart, Feather } from 'lucide-react';

export default function AboutView() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white min-h-screen py-16 font-sans"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-4 mb-16">
          <span className="text-[10px] font-bold tracking-[0.3em] text-neutral-400 uppercase">ABOUT US</span>
          <h1 className="text-3xl sm:text-5xl font-display font-light lowercase italic tracking-[0.05em] text-[#111111]">
            philosophy & heritage
          </h1>
          <div className="w-12 h-[1px] bg-neutral-300 mx-auto mt-6" />
        </div>

        <div className="relative aspect-[16/9] w-full overflow-hidden border border-neutral-800 shadow-md mb-16">
          <img
            src="/src/assets/images/aboutus_final.png"
            alt="Luxury Atelier Boutique Interior"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-700 ease-out"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-neutral-600 text-xs sm:text-sm leading-relaxed tracking-wider">
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-neutral-900 font-sans">
              Woven from Purpose
            </h3>
            <p>
              Founded with the singular intent of returning garment creation to its custom, tactile roots, StyleClothing represents a modern boutique response to transient retail trends. We curate capsule collections defined by high architectural integrity, natural fiber blends, and clean minimalist lines.
            </p>
            <p>
              Every garment in our catalog is mapped around classic tailoring archetypes—designed to withstand changing trends, adapt to distinct environments, and offer bespoke comfort.
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-neutral-900 font-sans">
              Durable Garment Philosophy
            </h3>
            <p>
              We prioritize organic linens, double-faced cashmere, and raw handloom silks sourced directly from family-owned mills. By manufacturing in limited-run editions, we eradicate surplus inventory and focus strictly on artisan-level detailing.
            </p>
            <p>
              From custom inner-linings to genuine horn buttons, every facet is selected to guarantee longevity. We believe your wardrobe should tell a narrative of permanence.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 border-y border-[#eeeeee] py-12 my-16">
          <div className="text-center space-y-2.5">
            <Compass className="w-5 h-5 text-neutral-800 mx-auto stroke-[1.2]" />
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#111111]">Sourcing Integrity</h4>
            <p className="text-[11px] text-neutral-400 uppercase tracking-widest leading-relaxed">
              100% Traceable organic natural fibers from ethical certified farms.
            </p>
          </div>
          <div className="text-center space-y-2.5">
            <Feather className="w-5 h-5 text-neutral-800 mx-auto stroke-[1.2]" />
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#111111]">Handmade Details</h4>
            <p className="text-[11px] text-neutral-400 uppercase tracking-widest leading-relaxed">
              Every seam, lining, and button is hand-anchored for extreme resilience.
            </p>
          </div>
          <div className="text-center space-y-2.5">
            <Heart className="w-5 h-5 text-neutral-800 mx-auto stroke-[1.2]" />
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#111111]">Radical Transparency</h4>
            <p className="text-[11px] text-neutral-400 uppercase tracking-widest leading-relaxed">
              Fair working conditions, direct-to-artisan compensation, zero waste.
            </p>
          </div>
        </div>

        <div className="text-center max-w-2xl mx-auto space-y-4">
          <p className="font-display font-light lowercase italic text-lg sm:text-2xl text-neutral-800 leading-relaxed">
            "garments are not transient statements. they are our second skin, reflecting a choice to consume less, but infinitely better."
          </p>
          <span className="text-[9px] font-bold tracking-[0.25em] text-neutral-400 uppercase">
            — style_clothing lead designer
          </span>
        </div>
      </div>
    </motion.div>
  );
}
