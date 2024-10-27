import React from 'react';
import { motion } from 'framer-motion';
import WorksSection from './Work';
import HowEcobitesWorks from './HowEcobitesWorks';
import HeroSection from './Hero';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <>
    <div className="min-h-screen bg-gradient-to-b from-[#fff] to-[#fff] flex flex-col items-center font-sans">
      <section>
        <HeroSection/>
      </section>
      <section>
        <HowEcobitesWorks/>
      </section>
      <section>
      <WorksSection/>
      </section>
    </div>
      <Footer/>
      </>
  );
};

export default Home;