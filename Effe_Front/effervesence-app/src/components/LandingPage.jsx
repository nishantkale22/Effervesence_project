// src/pages/LandingPage.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaInstagram,
  FaFacebookF,
  FaTwitter,
  FaYoutube
} from 'react-icons/fa';

const LandingPage = () => {
  const sponsorRef = useRef(null);
  useEffect(() => {
    const el = sponsorRef.current;
    if (!el) return;
    let scroll = 0;
    const tick = () => {
      scroll = (scroll + 1) % (el.scrollWidth / 2);
      el.scrollTo({ left: scroll, behavior: 'smooth' });
    };
    const id = setInterval(tick, 20);
    return () => clearInterval(id);
  }, []);

  const artists = useMemo(
    () => [
      { img: '/assets/gallery/effe_artist1.jpg', name: 'Divine Live Performance' },
      { img: '/assets/gallery/effe_artist2.jpg', name: 'Armaan Malik Concert' },
      { img: '/assets/gallery/effe_artist3.jpg', name: 'Bollywood Night with Indian Ocean' }
    ],
    []
  );
  const [artistIdx, setArtistIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setArtistIdx(i => (i + 1) % artists.length), 4000);
    return () => clearInterval(id);
  }, [artists.length]);

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  useEffect(() => {
    const festDate = new Date('2025-02-20T10:00:00');
    const tick = () => {
      const now = new Date();
      const diff = festDate - now;
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / (1000 * 60)) % 60),
        secs: Math.floor((diff / 1000) % 60)
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const [email, setEmail] = useState('');
  const handleSubscribe = e => {
    e.preventDefault();
    alert(`🎉 Awesome! ${email} is now subscribed to festival updates!`);
    setEmail('');
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      {/* Hero */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-4">
        <motion.h1
          className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-white drop-shadow-xl"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 80 }}
        >
          EFFERVESCENCE 2025
        </motion.h1>
        <motion.p
          className="text-lg md:text-2xl text-gray-300 max-w-2xl mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          IIIT Allahabad’s flagship cultural festival, graced by India's top celebrities, thunderous concerts, and memories that define college life.
        </motion.p>
        <motion.div
          className="grid grid-cols-4 gap-4 text-center mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div><span className="text-4xl font-bold">{timeLeft.days}</span><div>Days</div></div>
          <div><span className="text-4xl font-bold">{timeLeft.hours}</span><div>Hours</div></div>
          <div><span className="text-4xl font-bold">{timeLeft.mins}</span><div>Mins</div></div>
          <div><span className="text-4xl font-bold">{timeLeft.secs}</span><div>Secs</div></div>
        </motion.div>
        <motion.div
          className="mt-10 space-x-6"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <Link to="/register">
            <button className="px-8 py-4 bg-pink-600 hover:bg-pink-700 text-white rounded-full font-semibold shadow-lg transition">
              Get Started
            </button>
          </Link>
          <Link to="/login">
            <button className="px-8 py-4 border border-white text-white rounded-full font-semibold shadow hover:bg-white hover:text-pink-600 transition">
              Login
            </button>
          </Link>
        </motion.div>
      </section>

      {/* Artists Carousel */}
      <section className="py-20">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold mb-4">Last Year’s Electrifying Headliners</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            From indie magic to Bollywood thunder — these artists rocked our stage with unforgettable beats and crowd-shaking vibes.
          </p>
        </div>
        <div className="relative max-w-5xl mx-auto">
          <motion.img
            key={artistIdx}
            src={artists[artistIdx].img}
            alt={artists[artistIdx].name}
            className="w-full h-96 object-cover rounded-xl shadow-lg"
            initial={{ opacity: 0.4, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          />
          <p className="mt-4 text-center text-xl font-semibold">{artists[artistIdx].name}</p>
        </div>
      </section>

      {/* About Effervescence */}
      <section className="bg-[#1f1b2e] py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">What Makes Effervescence Special?</h2>
        <p className="max-w-3xl mx-auto text-gray-300">
          A melting pot of talent, technology, and tradition, Effervescence is not just a college fest — it’s an emotion, an identity, and a cultural revolution. Witness legendary performances, explore artistic brilliance, and celebrate youth like never before.
        </p>
        <div className="mt-10 grid md:grid-cols-3 gap-8 px-6">
          <img src="/assets/gallery/moonshow.jpg" className="rounded-xl shadow-xl" alt="Stage Moonshow" />
          <img src="/assets/gallery/groupperformance.jpg" className="rounded-xl shadow-xl" alt="Group Live" />
          <img src="/assets/gallery/crowd.jpg" className="rounded-xl shadow-xl" alt="Audience Energy" />
        </div>
      </section>



      {/* Student Events Section */}
      <section className="py-24 bg-[#241b3b] text-center text-white">
        <h2 className="text-4xl font-bold mb-6">Exciting Events by Students</h2>
        <p className="text-gray-300 max-w-3xl mx-auto mb-10">
          Dive into adrenaline-pumping student-organized events! From strategic treasure hunts to intense gaming duels, fun sports battles to thrilling laser tag — there’s something for everyone.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-6">
          {[
            { img: "/assets/events/treasure.jpg", name: "Treasure Hunt" },
            { img: "/assets/events/cricket.jpg", name: "Gully Cricket" },
            { img: "/assets/events/gaming.jpg", name: "Gaming Competitions" },
            { img: "/assets/events/footsal.jpg", name: "Footsal" },
            { img: "/assets/events/snooker.jpg", name: "Snooker" },
            { img: "/assets/events/laser.jpg", name: "Laser Tag" }
          ].map(({ img, name }, i) => (
            <motion.div
              key={name}
              className="bg-white/10 backdrop-blur-md p-4 rounded-xl shadow hover:shadow-2xl transform hover:scale-105 transition"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
            >
              <img src={img} alt={name} className="w-full h-48 object-cover rounded-md mb-4" />
              <h3 className="text-xl font-semibold">{name}</h3>
            </motion.div>
          ))}
        </div>
        <div className="mt-10">
          <Link to="/register">
            <button className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-full text-white font-bold shadow-md transition">
              Participate Now
            </button>
          </Link>
        </div>
      </section>

      {/* Subscribe CTA */}
      <section className="relative py-24 bg-gradient-to-br from-purple-800 via-indigo-700 to-indigo-900 text-white text-center overflow-hidden">
        <div className="absolute -top-40 left-0 w-80 h-80 bg-pink-500 opacity-20 rounded-full blur-3xl animate-ping" />
        <div className="absolute -bottom-40 right-0 w-96 h-96 bg-blue-500 opacity-20 rounded-full blur-3xl animate-pulse" />

        <div className="relative z-10">
          <motion.h2
            className="text-4xl font-extrabold mb-4"
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Join the Movement
          </motion.h2>

          <motion.p
            className="mb-8 text-white/80 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Get exclusive updates about registrations, artist lineups, merch drops & giveaways.
          </motion.p>

          <motion.form
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 px-6"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="px-6 py-3 rounded-full text-black w-72 sm:w-80 focus:outline-none shadow-md"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-white text-purple-700 font-bold rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300"
            >
              Subscribe
            </button>
          </motion.form>
        </div>
      </section>

      {/* Sponsors Marquee */}
      <section className="py-24 bg-[#2b2b3d] text-center text-white relative overflow-hidden">
        <div className="absolute -top-32 left-10 w-64 h-64 bg-purple-500 rounded-full opacity-20 animate-pulse blur-2xl" />
        <div className="absolute -bottom-32 right-10 w-64 h-64 bg-indigo-500 rounded-full opacity-20 animate-pulse blur-2xl" />

        <h2 className="text-4xl font-extrabold mb-4 z-10 relative">Our Legendary Partners</h2>
        <p className="text-gray-300 mb-10 max-w-xl mx-auto z-10 relative">
          Trusted by national brands and celebrated sponsors who make the magic possible.
        </p>

        <div ref={sponsorRef} className="flex space-x-12 overflow-x-auto px-6 py-4 snap-x z-10 relative scrollbar-hide">
          {["Coca-Cola", "SBI", "RedBull", "Realme", "Zebronics"].map((name, i) => (
            <motion.div
              key={name}
              className="flex-shrink-0 snap-start flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
            >
              <img
                src={`/assets/sponsors/${name.replace(/\s+/g, '').toLowerCase()}.png`}
                alt={name}
                className="h-20 w-auto mb-2 opacity-80 hover:opacity-100 transform hover:scale-110 transition"
              />
              <span className="text-sm font-medium text-gray-300">{name}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Merchandise Showcase */}
      <section className="py-24 bg-[#1a182d] text-center text-white">
        <h2 className="text-4xl font-bold mb-4">Official Effervescence Merchandise</h2>
        <p className="text-gray-300 max-w-2xl mx-auto mb-10">
          Rock your vibe with exclusive Effervescence-themed merchandise — from cozy hoodies to slick jackets. Wear the fest, feel the fest.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-6">
          {[
            { img: "/assets/merch/hoodie.jpg", name: "Hoodies" },
            { img: "/assets/merch/tshirt.jpg", name: "T-Shirts" },
            { img: "/assets/merch/cap.jpg", name: "Caps" },
            { img: "/assets/merch/jacket.jpg", name: "Jackets" }
          ].map(({ img, name }, i) => (
            <motion.div
              key={name}
              className="bg-white/10 backdrop-blur-md p-4 rounded-xl shadow hover:shadow-2xl transform hover:scale-105 transition"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
            >
              <img src={img} alt={name} className="w-full h-60 object-cover rounded-md mb-4" />
              <h3 className="text-xl font-semibold">{name}</h3>
            </motion.div>
          ))}
        </div>
        <div className="mt-8">
          <Link to="/register">
            <button className="px-8 py-3 bg-pink-500 hover:bg-pink-600 rounded-full text-white font-bold shadow-md transition">
              Pre-Book Now
            </button>
          </Link>
        </div>
      </section>






      {/* Footer */}
      <footer className="bg-[#181624] text-gray-400 py-8 text-sm">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <p>© 2025 Effervescence, IIIT Allahabad. All rights reserved.</p>
          <div className="flex space-x-5 mt-4 md:mt-0">
            {[FaInstagram, FaFacebookF, FaTwitter, FaYoutube].map((Icon, idx) => (
              <a key={idx} href="https://www.instagram.com/goeffervescence/" target="_blank" rel="noreferrer">
                <Icon className="text-xl hover:text-white transition" />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
