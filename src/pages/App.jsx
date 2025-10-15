import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import RegisterPage from './RegisterPage';

const challengeStatements = [
  'Vegetables, fruits, rice, pulses, and wheat that look fresh, but are loaded with chemicals.',
  'Soil that once gave life is now losing its fertility.',
  'Agriculture is shrinking, and if this continues, what will we leave for our next generation?',
  'Empty soil. Poor health. Weak lives.'
];

const missionBenefits = [
  'Grow chemical-free crops that heal soil and improve health.',
  'Obtain an official Natural Farming Certificate under Government of India norms.',
  'Earn better market prices with verified natural produce.',
  'Access training on Jeevamrut, Beejamrut, composting, and bio-inputs.',
  'Build a digital farmer identity on pgsindia-ncof.gov.in that buyers across India trust.'
];

const rcSupportItems = [
  'Training, field verification, and certification for all crops and dairy products.',
  'Access to government schemes, subsidies, and marketing support.',
  'Awareness programs on natural farming practices and standards.'
];

const valueStatements = ['Grow Naturally', 'Earn with Pride', 'Feed India with Purity'];

const contactDetails = [
  'WhatsApp: 8331919474',
  'Website: cyanoindia.com'
];

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-green-50">
        {/* Navigation */}
        <nav className="bg-green-600 text-white shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center hover:text-green-200">
                  <span className="text-xl font-bold">FarmerForm</span>
                </Link>
                <div className="hidden md:flex items-center ml-8 space-x-4">
                  {/* Removed Resources, About, and Contact links from navigation */}
                </div>
              </div>
              <div className="flex items-center">
                <Link
                  to="/register"
                  className="bg-white text-green-600 px-6 py-2 rounded-full font-semibold hover:bg-green-50 transition-colors shadow-md"
                >
                  Start Registration
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <Routes>
          <Route
            path="/"
            element={
              <div className="max-w-7xl mx-auto px-4 py-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-12"
                >
                  {/* Hero Section */}
                  <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-6">
                      Natural and Organic Farming Certification - Farmer Registration Form
                    </h1>
                    <p className="text-xl text-green-700 mb-4">
                      Join India's Natural Farming Revolution - Register Today!
                    </p>
                    <p className="text-lg text-green-600 italic mb-8">
                      "Grow Natural. Earn More. Get Certified under the National Natural Farming Mission."
                    </p>
                    <h2 className="text-2xl font-semibold text-green-700 mb-8">
                      Get Your PGS-India Natural Farming Certificate for Your Land
                    </h2>
                  </div>

                  {/* Problem Statement */}
                  <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      Every day, our farmers feed the nation. But ask yourself: what are we really eating today?
                    </h3>
                    <ul className="space-y-4 text-gray-600 mb-6 list-disc list-inside">
                      {challengeStatements.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <p className="text-gray-700 font-semibold mb-4">The truth is simple:</p>
                    <p className="text-gray-700 mb-4">
                      Farmers who grow crops naturally and with love often struggle to get a fair price. Families consuming
                      chemically cultivated food face growing health problems.
                    </p>
                    <p className="text-xl font-semibold text-green-800">
                      When the soil becomes sick, the nation becomes sick.
                    </p>
                  </div>

                  {/* Solution Section */}
                  <div className="bg-green-50 rounded-lg shadow-lg p-8 mb-12">
                    <h3 className="text-2xl font-bold text-green-800 mb-6">
                      India's Solution: The National Natural Farming Mission (NNFM)
                    </h3>
                    <p className="text-gray-700 mb-6">
                      The Government of India launched the National Natural Farming Mission to help farmers return to nature-based
                      cultivation and restore soil and human health.
                    </p>
                    <h4 className="text-lg font-semibold text-green-700 mb-4">
                      Through the PGS-India Natural and Organic Farming Certification System, every farmer can now:
                    </h4>
                    <ul className="space-y-3 text-gray-700 mb-8 list-disc list-inside">
                      {missionBenefits.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Regional Councils */}
                  <div className="bg-white rounded-lg shadow-lg p-8 mb-12" id="about">
                    <h3 className="text-2xl font-bold text-green-800 mb-6">
                      How Regional Councils Help Farmers
                    </h3>
                    <p className="text-gray-700 mb-6">
                      To make certification simple and accessible, the Government has established Regional Councils (RCs) across India under
                      PGS-India. Regional Councils guide farmers step-by-step through every stage of certification.
                    </p>
                    <ul className="space-y-3 text-gray-700 list-disc list-inside">
                      {rcSupportItems.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Call to Action */}
                  <div className="bg-green-50 rounded-lg shadow-lg p-8 text-center" id="contact">
                    <h3 className="text-2xl font-bold text-green-800 mb-6">
                      Your First Step Toward a Chemical-Free Future
                    </h3>
                    <p className="text-gray-700 mb-6">
                      By filling out this registration form, you begin your journey toward natural certification and soil restoration.
                    </p>
                    <div className="bg-white rounded-lg p-4 mb-8 inline-block">
                      <p className="text-lg font-semibold text-green-700">
                        Registration, certification, and support fee: Rs. 300 only
                      </p>
                    </div>
                    <p className="text-gray-700 mb-8">
                      Your Regional Council will help you grow using certified natural or organic methods, issue your PGS-India Certificate,
                      and connect you with trusted markets.
                    </p>
                    <p className="text-lg font-semibold text-green-700 mb-8">
                      Certification builds confidence for farmers and trust for consumers. Together, we grow a healthier India.
                    </p>
                    <div className="space-y-2 mb-8">
                      {valueStatements.map((statement) => (
                        <p key={statement} className="text-xl text-green-700">
                          {statement}
                        </p>
                      ))}
                    </div>
                    <Link
                      to="/register"
                      className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors inline-block mb-8"
                    >
                      Register Now as a Certified Natural Farmer
                    </Link>
                    <p className="text-gray-700 mb-6">
                      Together, let us build a healthier, chemical-free, and prosperous India.
                    </p>
                    <div className="mt-4 space-y-2 text-gray-700">
                      {contactDetails.map((item) => (
                        <p key={item}>{item}</p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            }
          />
          <Route path="/register" element={<RegisterPage />} />
          {/* Removed ResourcesPage route */}
        </Routes>

        {/* Footer */}
        <footer className="bg-green-800 text-white py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Removed About, Contact, and Follow Us sections from footer */}
            </div>
            <div className="mt-8 pt-8 border-t border-green-700 text-center text-green-200">
              <p>&copy; 2024 FarmerForm. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
