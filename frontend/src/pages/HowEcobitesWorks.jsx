import React, { useState } from 'react';
import { motion } from 'framer-motion';

const HowEcobitesWorks = () => {
  const steps = [
    {
      title: 'BRIEFING',
      description: 'We connect donors and requesters to make food and non-food donations easy and accessible for everyone. Understanding your needs is our first step. Whether you’re looking to give or receive, we facilitate a seamless process tailored to your requirements.',
      color: '#01dddd', // Bright orange for the briefing step
    },
    {
      title: 'DONATE ITEMS',
      description: 'Easily donate your excess food and essentials to help those in need within your community through our user-friendly platform. You can choose to donate items directly or schedule a pickup, ensuring your contributions reach those who need them the most.',
      color: '#FFC107', // Bright yellow for the donate items step
    },
    {
      title: 'REQUEST ESSENTIALS',
      description: 'If you need food or non-food items, you can submit a request to receive assistance from local donors in your area. Our system allows you to specify what you need, and we match your request with available donations nearby, making help just a click away.',
      color: '#ff598f', // Bright blue for the request essentials step
    },
    {
      title: 'EXPLORE DONATIONS',
      description: 'Browse through a variety of available food and non-food items from your neighbors and claim what you need. Our platform ensures that you can see real-time updates on available donations, allowing you to choose what best fits your situation.',
      color: '#e0e300', // Bright green for the explore donations step
    },
  ];

  const [currentStep, setCurrentStep] = useState(0);

  // Implement looping in nextStep and prevStep
  const nextStep = () => {
    setCurrentStep((prevStep) => (prevStep + 1) % steps.length); // Looping forward
  };

  const prevStep = () => {
    setCurrentStep((prevStep) => (prevStep - 1 + steps.length) % steps.length); // Looping backward
  };

  return (
    <section className="w-full bg-[#fff] px-6 md:px-12 mx-auto mb-20 flex flex-col items-center">
      <div className="text-6xl mt-28 text-center mb-10 w-full">
        <h1>How EcoBites Works?</h1>
      </div>

      <div className="relative max-w-3xl w-full mb-10">
        {/* Step Indicator and Navigation */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            {steps.map((_, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-4 h-4 rounded-full ${index === currentStep ? 'bg-blue-800' : 'bg-gray-300'}`} />
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 bg-gray-300" />
                )}
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <div className="flex space-x-4">
            <button
              onClick={prevStep}
              className={`w-12 h-12 rounded-full bg-[#e0ff63] flex justify-center items-center ${currentStep === 0 ? '' : ''}`}
            >
              <span>&larr;</span>
            </button>
            <button
              onClick={nextStep}
              className={`w-12 h-12 rounded-full bg-[#e0ff63] flex justify-center items-center ${currentStep === steps.length - 1 ? '' : ''}`}
            >
              <span>&rarr;</span>
            </button>
          </div>
        </div>

        {/* Content Box with Animation */}
        <motion.div
          className="bg-white p-8 rounded-3xl shadow-lg"
          style={{ backgroundColor: steps[currentStep].color }} 
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg font-bold text-[#0a1f44] mb-4">{steps[currentStep].title}</h3>
          <p className="text-[#0a1f44]">{steps[currentStep].description}</p>
        </motion.div>
      </div>
    </section>
  );
};

export default HowEcobitesWorks;