import React from 'react';
import { HiArrowSmRight } from "react-icons/hi";
import { Link } from 'react-router-dom';

const WorksSection = () => {
  return (
    <section className="rounded-3xl p-5 text-gray-800 py-16">
      <div className='text-6xl text-center mb-14'><h1>Join Our Mission</h1></div>
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div className="col-span-1 md:col-span-2 rounded-3xl lg:col-span-2 bg-green-600 p-8">
          <h2 className="text-5xl font-bold">We're Ecobites, making food and non-food donations accessible to everyone.</h2>
        </div>
        <div className="bg-green-400 text-lg rounded-3xl p-8">
          <p>
            Ecobites is a platform built to connect people who want to donate or request food and non-food items, fostering a community where sustainability thrives. Whether you're donating surplus or in need of essential goods, we're here to help.
          </p>
        </div>

        <div className="col-span-1 md:col-span-2 rounded-3xl lg:col-span-1 bg-yellow-100 p-8">
          <h3 className="text-xl font-bold">Food Donations</h3>
          <p>If you have surplus food, donate it easily on Ecobites to help your local community and reduce waste.</p>
          <button>
            <Link to='/addfood' className='mt-4 bg-gray-800 hover:bg-black rounded-3xl text-white py-2 px-4 flex items-center justify-center'>Donate Food <HiArrowSmRight className="ml-2" /></Link>
          </button>
        </div>

        <div className="bg-pink-200 rounded-3xl p-8">
          <h3 className="text-xl font-bold">Request Food</h3>
          <p>Need food for yourself or others? Browse available donations on Ecobites and make a request in no time.</p>
          <button className="mt-4 bg-black text-white rounded-3xl py-2 px-4 flex items-center justify-center">
            Request Food <HiArrowSmRight className="ml-2" />
          </button>
        </div>

        <div className="bg-blue-600 col-span-1 md:col-span-2 rounded-3xl lg:col-span-2 p-8">
          <h3 className="text-xl font-bold">Non-Food Donations</h3>
          <p>In need of essential non-food items like clothes, books, or toiletries? Ecobites has you covered.</p>
          <button>
            <Link to='/addnonfood' className='mt-4 bg-gray-800 hover:bg-black rounded-3xl text-white py-2 px-4 flex items-center justify-center'>Donate Non Food Items<HiArrowSmRight className="ml-2" /></Link>
          </button>
        </div>

        {/* Contact Section */}
        <div className="bg-pink-300 rounded-3xl p-8">
          <p className="text-4xl font-bold">WANT TO GET INVOLVED? CONTACT US!</p>
        </div>
      </div>
    </section>
  );
};

export default WorksSection;