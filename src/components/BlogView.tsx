import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string[];
  date: string;
  author: string;
  readTime: string;
  image: string;
  category: "Men's" | "Women's";
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 'art-of-linen',
    title: 'The Art of Natural Linen: Crafting Breathable Structure',
    category: "Men's",
    excerpt: 'Explore how premium flax fibers are woven into structured linens that endure high summer humidity while maintaining timeless sartorial grace.',
    date: 'June 28, 2026',
    author: 'Elena Vance, Lead Draper',
    readTime: '5 min read',
    image: 'https://i.pinimg.com/1200x/93/5a/55/935a55fc9fb8d8c0089c887630eb14e1.jpg',
    content: [
      'Linen is widely regarded as one of the world’s oldest and most noble textiles. Sourced from the sturdy stems of the flax plant, high-end linen stands apart from industrial synthetics due to its irregular slubs and deep tactile resonance.',
      'At StyleClothing, our flax is harvested in Flanders and spun by generational spinners before being woven into mid-weight fabrics. The primary challenge with tailoring linen is preserving its structural drape while allowing it to wrinkle naturally—a quality the French describe as "un beau froissé" (a beautiful wrinkle).',
      'Unlike cheap commercial linen which can feel scratchy or stiff, high-grade linen becomes softer with each wash, adapting directly to the contours of your body. Our summer resort shirts and tailored trousers showcase this lightweight, airy construction, perfect for warm coastal atmospheres.'
    ]
  },
  {
    id: 'autumn-silks',
    title: 'Autumn Silks: The Tactile Sensation of Luxury Drape',
    category: "Women's",
    excerpt: 'An inquiry into heavy mulberry silks and double-faced satins designed to cascade effortlessly around natural shoulder structures.',
    date: 'July 05, 2026',
    author: 'Marc de Luca, Atelier Tailor',
    readTime: '6 min read',
    image: 'https://i.pinimg.com/1200x/53/6b/f5/536bf5b3d9d08d6a146bca6edc1c2d80.jpg',
    content: [
      'As seasonal temperatures shift, silk offers an unmatched combination of natural thermal insulation and high-contrast light reflection. Silk is not merely for eveningwear; when spun into heavy satins and crêpes de chine, it lends a modern fluid structure to everyday tailored trousers and backless slip dresses.',
      'Our current collection features sand-washed silks that possess a velvety, peach-fuzz finish, removing the superficial sheen of cheap satin and substituting it with a subtle, matte elegance.',
      'Sartorial drape relies completely on bias cutting—slicing the silk diagonally across the weave so that it stretches and flows smoothly over curves without adding bulk. Experience this artisan technique in our signature Silk Satin Drape Collection.'
    ]
  },
  {
    id: 'modern-tailoring-men',
    title: 'The Modern Silhouette: Structured Shoulders & Relaxed Proportion',
    category: "Men's",
    excerpt: 'Discover how natural shoulders and relaxed waistlines are redefining menswear for the modern office and evening salon.',
    date: 'July 12, 2026',
    author: 'Marc de Luca, Atelier Tailor',
    readTime: '7 min read',
    image: 'https://i.pinimg.com/1200x/8c/fc/33/8cfc336c8c4ab847c9cdcb89146ec4f5.jpg',
    content: [
      'Traditional menswear often relies on stiff, padded canvases that force the wearer into an artificial frame. Today, a shift towards relaxed proportion is challenging these rigid historical styles.',
      'At StyleClothing, our modern jackets incorporate soft canvas lining and unpadded shoulders, allowing the natural contour of the body to guide the drape of the wool-cashmere blend.',
      'This results in a garment that is exceptionally lightweight, comfortable to wear all day, yet remains sharp and refined for any formal engagement.'
    ]
  },
  {
    id: 'minimalist-capsule-women',
    title: 'Curating a Minimalist Capsule: The Foundation of Fluid Luxury',
    category: "Women's",
    excerpt: 'How to build a high-performance wardrobe from six foundational silk, wool, and linen garments that harmonize across seasons.',
    date: 'July 14, 2026',
    author: 'Sienna Sterling, Creative Director',
    readTime: '6 min read',
    image: 'https://i.pinimg.com/736x/bd/63/41/bd6341ccdc88f47e58f099ba8e43deb4.jpg',
    content: [
      'A capsule wardrobe is not about restriction—it is about discovering freedom through precise curation. When every piece is constructed with structural integrity, the combinations become infinite.',
      'Our blueprint begins with a heavy silk crepe camisole, followed by tailored wide-leg linen trousers, and capped with a double-faced wool trench coat.',
      'By sticking to a cohesive color palette of sand, charcoal, and warm ivory, transitioning your outfit from professional meetings to quiet weekend escapes becomes completely effortless.'
    ]
  },
  {
    id: 'mens-accessories-leather',
    title: 'The Horology Blueprint: Minimalist Timepieces of Quiet Luxury',
    category: "Men's",
    excerpt: 'A curated look into modern horology, focusing on mechanical symmetry, manual-wind movements, and minimal architectural dials.',
    date: 'July 17, 2026',
    author: 'Julian Mercer, Watch Artisan',
    readTime: '5 min read',
    image: 'https://i.pinimg.com/736x/08/33/b2/0833b2f60c55f6efdf22da622af22458.jpg',
    content: [
      'A fine timepiece is more than a tool for tracking hours; it is a masterclass in micro-engineering and architectural symmetry. Every hand, dial, and escapement is designed to achieve maximum precision within an incredibly compact stainless steel housing.',
      'Our current selection emphasizes watches that feature thin manual-wind mechanical movements and uncluttered dials. By removing unnecessary complications, the visual layout stays absolutely clean, allowing the high-contrast hands to define the piece.',
      'Constructed with scratch-resistant sapphire crystal and paired with handmade vegetable-tanned leather straps, these minimal watches age beautifully alongside your tailored suits and casual linen wear.'
    ]
  },
  {
    id: 'sculptural-knitwear-women',
    title: 'Sculptural Knitwear: Weaving Geometry and Warmth',
    category: "Women's",
    excerpt: 'Discover how organic cotton-cashmere blends are knitted using state-of-the-art 3D techniques to eliminate waste and create seamless comfort.',
    date: 'July 19, 2026',
    author: 'Elena Vance, Lead Draper',
    readTime: '7 min read',
    image: 'https://i.pinimg.com/736x/00/db/f8/00dbf83358d19c1c21cd929ca38d1a17.jpg',
    content: [
      'Knitwear should never feel bulky or shapeless. Our sculptural knitwear line employs seamless 3D knitting technology, creating garments as single, continuous pieces.',
      'This technique completely eliminates seams, removing friction points and allowing the fabric to drape smoothly around the natural shoulders and waist.',
      'Blending organic cotton with ultra-fine cashmere guarantees exceptional breathability, rendering these knit pieces ideal for layering in unpredictable transition seasons.'
    ]
  }
];

export default function BlogView() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'All' | "Men's" | "Women's">('All');

  const filteredPosts = selectedCategory === 'All'
    ? BLOG_POSTS
    : BLOG_POSTS.filter(post => post.category === selectedCategory);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white min-h-screen py-16 font-sans border-t border-[#eeeeee]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <AnimatePresence mode="wait">
          {!selectedPost ? (
            <motion.div
              key="list-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4 mb-10">
                <span className="text-[10px] font-bold tracking-[0.3em] text-neutral-400 uppercase">THE JOURNAL</span>
                <h1 className="text-3xl sm:text-5xl font-display font-light lowercase italic tracking-[0.05em] text-[#111111]">
                  styleclothing journal
                </h1>
                <p className="text-xs text-neutral-400 uppercase tracking-widest max-w-sm mx-auto leading-relaxed text-center">
                  Seasonal essays on fabric integrity, bespoke patterns, and traditional craft.
                </p>
                <div className="w-12 h-[1px] bg-neutral-300 mx-auto mt-6" />
              </div>

              <div className="flex justify-center space-x-3 mb-12">
                {(['All', "Men's", "Women's"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all duration-300 cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#111111] text-white border-[#111111]'
                        : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400 hover:text-black'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {filteredPosts.map((post) => (
                  <article
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="group cursor-pointer flex flex-col h-full bg-[#f9f9f9] border border-[#eeeeee] overflow-hidden hover:border-neutral-900 transition-all duration-300"
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden relative border-b border-[#eeeeee]">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute top-3 left-3 bg-white border border-[#eeeeee] px-2 py-0.5">
                        <span className="text-[8px] font-bold tracking-widest text-neutral-800 uppercase">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow space-y-4">
                      <div className="flex items-center space-x-3 text-[10px] text-neutral-400 uppercase tracking-wider">
                        <span>{post.date}</span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                      </div>

                      <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider group-hover:text-neutral-600 transition-colors line-clamp-2 leading-relaxed">
                        {post.title}
                      </h3>

                      <p className="text-xs text-neutral-500 line-clamp-3 leading-relaxed tracking-wider flex-grow">
                        {post.excerpt}
                      </p>

                      <span className="inline-flex items-center space-x-1.5 text-[10px] font-bold text-[#111111] uppercase tracking-widest pt-2 group-hover:translate-x-1 transition-all">
                        <span>Read Article</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="detail-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="max-w-3xl mx-auto space-y-8"
            >
              <button
                onClick={() => setSelectedPost(null)}
                className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-black transition-colors focus:outline-none cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 stroke-[1.5]" />
                <span>Back to Journal</span>
              </button>

              <div className="space-y-4">
                <div className="flex items-center space-x-4 text-[10px] text-neutral-400 uppercase tracking-wider">
                  <span className="bg-neutral-100 text-neutral-800 font-bold px-2 py-0.5 border border-neutral-200">{selectedPost.category}</span>
                  <span>•</span>
                  <span>{selectedPost.date}</span>
                  <span>•</span>
                  <span>{selectedPost.readTime}</span>
                  <span>•</span>
                  <span>By {selectedPost.author}</span>
                </div>
                <h1 className="text-xl sm:text-3xl font-display font-medium uppercase tracking-wide text-neutral-900 leading-tight">
                  {selectedPost.title}
                </h1>
                <div className="h-[1px] bg-neutral-200" />
              </div>

              <div className="aspect-[16/9] w-full overflow-hidden border border-[#eeeeee]">
                <img
                  src={selectedPost.image}
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-6 text-xs sm:text-sm text-neutral-600 leading-relaxed tracking-wider font-sans py-4">
                {selectedPost.content.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              <div className="border-t border-[#eeeeee] pt-8 flex justify-between items-center">
                <div className="text-xs text-neutral-400 font-medium">
                  Author Profile: <span className="font-semibold text-neutral-700">{selectedPost.author}</span>
                </div>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="px-5 py-2.5 border border-neutral-300 text-neutral-700 hover:border-black hover:text-black font-sans text-xs font-bold uppercase tracking-widest rounded-none transition-all cursor-pointer"
                >
                  Return to list
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
