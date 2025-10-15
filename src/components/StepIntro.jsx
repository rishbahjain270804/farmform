import React from 'react';
import { motion } from 'framer-motion';

const challengeStatements = [
  'Vegetables, fruits, rice, pulses, and wheat that look fresh, but are loaded with chemicals.',
  'Soil that once gave life is now losing its fertility.',
  'Agriculture is shrinking, and without change we risk the future of the next generation.'
];

const missionBenefits = [
  'Grow chemical-free crops that heal the soil and improve community health.',
  'Obtain an official Natural Farming Certificate under Government of India norms.',
  'Earn better market prices with verified natural produce.',
  'Access training on Jeevamrut, Beejamrut, composting, and other bio-inputs.',
  'Build a digital farmer identity on pgsindia-ncof.gov.in that buyers across India trust.'
];

const rcSupportItems = [
  'Training, field verification, and certification for crops and dairy products.',
  'Access to government schemes, subsidies, and marketing support.',
  'Awareness programs on natural farming practices and standards.'
];

const valueStatements = ['Grow Naturally', 'Earn with Pride', 'Feed India with Purity'];

const contactDetails = [
  'WhatsApp: 8331919474',
  'Website: cyanoindia.com',
  // Removed personal email
];

const StepIntro = ({ onNext }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-8"
      >
        <h1 className="text-3xl font-bold text-green-800 mb-4">
          Natural and Organic Farming Certification
        </h1>
        <h2 className="text-xl text-green-700 mb-6">
          Join India's Natural Farming Revolution - Register Today!
        </h2>

        <div className="prose max-w-none">
          <blockquote className="text-lg font-medium text-gray-700 mb-8">
            "Grow Natural. Earn More. Get Certified under the National Natural Farming Mission."
          </blockquote>

          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Why this registration matters
          </h3>
          <p className="text-gray-600 mb-4">
            Every day, our farmers feed the nation. Yet the quality of what reaches our plates depends on how that food is grown.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
            {challengeStatements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <p className="text-gray-700 font-semibold mb-4">The truth is simple:</p>
          <p className="text-gray-700 mb-6">
            Farmers who nurture crops naturally often struggle to earn a fair price, while families consuming chemically cultivated food face growing health concerns.
            When the soil becomes sick, the nation becomes sick.
          </p>

          <div className="bg-green-50 p-6 rounded-lg mb-8">
            <h4 className="text-lg font-semibold text-green-800 mb-4">What you gain through the PGS-India program</h4>
            <ul className="space-y-3 text-gray-700 list-disc list-inside">
              {missionBenefits.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h4 className="text-lg font-semibold text-blue-800 mb-4">How Regional Councils support you</h4>
            <p className="text-gray-600 mb-4">
              Regional Councils (RCs) under PGS-India guide farmers step-by-step so certification stays simple and accessible.
            </p>
            <ul className="space-y-3 text-gray-600 list-disc list-inside">
              {rcSupportItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="text-center bg-green-50 p-6 rounded-lg mb-8">
            <h4 className="text-xl font-semibold text-green-800 mb-4">Registration fee</h4>
            <p className="text-2xl font-bold text-green-600 mb-2">Rs. 300 only</p>
            <p className="text-gray-600">Covers certification guidance and ongoing support.</p>
          </div>

          <div className="text-center mb-8 space-y-2">
            {valueStatements.map((statement) => (
              <p key={statement} className="text-lg font-medium text-gray-700">
                {statement}
              </p>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={onNext}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Start Registration
            </button>
          </div>

          <div className="mt-8 text-center text-gray-600 space-y-1">
            {contactDetails.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StepIntro;
