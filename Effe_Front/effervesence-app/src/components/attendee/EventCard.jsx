import React from 'react';
import { motion } from 'framer-motion';

const EventCard = ({
    image,
    video,
    name,
    date,
    venue,
    description,
    tags = [],
    isLive = false,
    onViewDetails
}) => {
    return (
        <motion.div
            className="w-full flex flex-col md:flex-row bg-white/10 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden mb-10 hover:shadow-2xl transition relative"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Media Section */}
            <div className="md:w-2/5 w-full h-64 md:h-auto bg-black flex items-center justify-center relative">
                {video ? (
                    <video
                        src={video}
                        className="object-cover w-full h-full rounded-none md:rounded-l-2xl"
                        autoPlay
                        loop
                        muted
                        playsInline
                        poster={image}
                    />
                ) : (
                    <img
                        src={image}
                        alt={name}
                        className="object-cover w-full h-full rounded-none md:rounded-l-2xl"
                    />
                )}
                {isLive && (
                    <span className="absolute top-4 left-4 bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse z-10">
                        LIVE
                    </span>
                )}
            </div>
            {/* Info Section */}
            <div className="flex-1 p-6 flex flex-col justify-between bg-gradient-to-br from-[#241b3b]/80 to-[#181624]/80">
                <div>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {tags.map(tag => (
                            <span key={tag} className="bg-indigo-500/80 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 drop-shadow-lg">{name}</h2>
                    <div className="flex flex-wrap gap-6 text-sm text-pink-300 font-semibold mb-3">
                        <span>{date}</span>
                        <span>{venue}</span>
                    </div>
                    <p className="text-gray-300 mb-6 line-clamp-3">{description}</p>
                </div>
                <div>
                    <button
                        onClick={onViewDetails}
                        className="px-8 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-full font-bold shadow-lg transition-all text-lg"
                    >
                        View Details
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default EventCard; 