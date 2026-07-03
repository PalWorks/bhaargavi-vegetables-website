import React from 'react';
import { Heart, Instagram } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { INSTAGRAM_POSTS, INSTAGRAM_URL } from '../constants';

const InstagramFeed: React.FC = () => {
  const { t } = useLanguage();
  const posts = INSTAGRAM_POSTS.slice(0, 14);

  return (
    <section id="instagram" className="py-20 bg-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <p className="text-bv-green font-semibold text-sm tracking-widest uppercase mb-1">{t.instagram.tag}</p>
            <h2 className="font-display text-3xl text-bv-dark">{t.instagram.title}</h2>
          </div>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 bg-gradient-to-r from-[#f09433] via-[#e6683c] to-[#bc1888] text-white font-semibold px-5 py-2.5 rounded-full hover:scale-105 transition-transform">
            <Instagram size={16} />
            @bhaargavifreshvegetables
          </a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {posts.map(post => (
            <a key={post.id} href={post.link} target="_blank" rel="noreferrer"
              className="relative aspect-square overflow-hidden rounded-xl group bg-bv-card">
              <img loading="lazy" src={post.image} alt={post.caption.substring(0, 60)}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-bv-dark/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-1 p-2">
                <Heart size={16} className="text-white fill-white" />
                <span className="text-white text-xs font-bold">{post.likes}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;