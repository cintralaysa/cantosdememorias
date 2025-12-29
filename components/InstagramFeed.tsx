"use client";

import { motion } from 'framer-motion';
import { Instagram } from 'lucide-react';

const POSTS = [
  { id: 1, url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop" },
  { id: 2, url: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=400&h=400&fit=crop" },
  { id: 3, url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=400&fit=crop" },
  { id: 4, url: "https://images.unsplash.com/photo-1459749411177-042180ce673c?w=400&h=400&fit=crop" },
  { id: 5, url: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop" },
  { id: 6, url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop" },
];

export default function InstagramFeed() {
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-12 flex flex-col items-center">
        <a 
          href="https://instagram.com/cantosememoria" 
          target="_blank"
          className="group flex items-center gap-3 bg-black text-white px-8 py-4 rounded-full font-black uppercase tracking-tighter hover:scale-105 transition-transform"
        >
          <Instagram className="text-pink-500" />
          @cantosememoria
        </a>
        <p className="mt-4 font-bold uppercase text-gray-400 text-sm tracking-widest">Siga-nos no Instagram</p>
      </div>

      <div className="relative flex overflow-x-hidden">
        <motion.div 
          className="flex whitespace-nowrap"
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
        >
          {[...POSTS, ...POSTS].map((post, idx) => (
            <div key={idx} className="w-72 h-72 mx-2 flex-shrink-0">
              <img 
                src={post.url} 
                alt="Instagram Post" 
                className="w-full h-full object-cover rounded-3xl border-4 border-black"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}