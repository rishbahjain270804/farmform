import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { farmerService } from '../services/farmerService';
import { paymentService } from '../services/paymentService';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Section 1: Farmer Details
    farmerName: '',
    fatherSpouseName: '',
    contactNumber: '',
    email: '',
    village: '',
    mandal: '',
    district: '',
    state: '',
    aadhaarFarmerId: '',
    registrationDate: new Date().toISOString().split('T')[0],

    // Section 2: Farm Details
    totalLand: '',
    naturalFarmingArea: '',
    currentFarmingPractice: '',
    farmingExperience: '',
    irrigationSource: '',
    livestock: [],
    willingToAdoptNaturalInputs: '',
    trainingRequired: '',
    localGroupName: '',
    preferredCroppingSeason: '',

    // Section 3: Crop Details
    presentCrop: '',
    cropTypes: '',
    sowingDate: '',
    harvestingDate: '',
    remarks: ''
  });

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registrationId, setRegistrationId] = useState(null);
  const [isGatewayReady, setIsGatewayReady] = useState(() => (
    typeof window !== 'undefined' && Boolean(window.Razorpay)
  ));

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (window.Razorpay) {
      setIsGatewayReady(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    const handleLoad = () => setIsGatewayReady(true);
    const handleError = () => setIsGatewayReady(false);

    if (existingScript) {
      existingScript.addEventListener('load', handleLoad);
      existingScript.addEventListener('error', handleError);

      return () => {
        existingScript.removeEventListener('load', handleLoad);
        existingScript.removeEventListener('error', handleError);
      };
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);
    document.body.appendChild(script);

    return () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
      if (!window.Razorpay && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const handlePayment = async (farmerId) => {
    try {
      if (typeof window === 'undefined' || !window.Razorpay || !isGatewayReady) {
        setError('Payment gateway failed to load. Please refresh the page and try again.');
        setIsSubmitting(false);
        return;
      }

      setError(null);

      const { order, key } = await paymentService.createPaymentOrder({ farmerId });

      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: "Natural Farming Registration",
        description: "Registration and Support Fee",
        order_id: order.id,
        handler: async function (response) {
          try {
            await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              farmerId
            });

            setError(null);
            setRegistrationId(farmerId);
            setRegistrationComplete(true);
          } catch (error) {
            setError('Payment verification failed. Please contact support.');
            console.error('Payment verification error:', error);
          } finally {
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
            setError('Payment window was closed before completion. You can try again when ready.');
          }
        },
        prefill: {
          name: formData.farmerName,
          contact: formData.contactNumber,
          email: formData.email || ''
        },
        notes: {
          farmerId: farmerId
        },
        theme: {
          color: "#16a34a"
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      const message = error && error.message === 'Payment response did not include order details'
        ? 'Failed to initiate payment. Please try again.'
        : (error?.message || 'Failed to initiate payment. Please try again.');
      setError(message);
      console.error('Payment initiation error:', error);
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    const requiredFields = {
      // Step 1
      farmerName: 'Farmer Name is required',
      fatherSpouseName: 'Father/Spouse Name is required',
      contactNumber: 'Contact Number is required',
      village: 'Village is required',
      mandal: 'Mandal is required',
      district: 'District is required',
      state: 'State is required',
      registrationDate: 'Registration Date is required',

      // Step 2
      totalLand: 'Total Land is required',
      naturalFarmingArea: 'Natural Farming Area is required',
      currentFarmingPractice: 'Current Farming Practice is required',
      farmingExperience: 'Farming Experience is required',
      irrigationSource: 'Irrigation Source is required',
      willingToAdoptNaturalInputs: 'Willingness to Adopt Natural Inputs is required',
      trainingRequired: 'Training Required is required',
      preferredCroppingSeason: 'Preferred Season is required',

      // Step 3
      presentCrop: 'Present Crop is required',
      cropTypes: 'Crop Types is required',
      sowingDate: 'Sowing Date is required'
    };

    for (const [field, message] of Object.entries(requiredFields)) {
      if (!formData[field] || formData[field].trim() === '') {
        return message;
      }
    }

    // Contact number validation
    if (!formData.contactNumber.match(/^\d{10}$/)) {
      return 'Contact number must be exactly 10 digits';
    }

    // Numeric fields
    if (isNaN(formData.totalLand) || parseFloat(formData.totalLand) <= 0) {
      return 'Total Land must be a positive number';
    }
    if (isNaN(formData.naturalFarmingArea) || parseFloat(formData.naturalFarmingArea) <= 0) {
      return 'Natural Farming Area must be a positive number';
    }
    if (isNaN(formData.farmingExperience) || parseInt(formData.farmingExperience) < 0) {
      return 'Farming Experience must be a non-negative number';
    }

    // Dates
    if (formData.sowingDate && new Date(formData.sowingDate) > new Date()) {
      return 'Sowing Date cannot be in the future';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);

      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        setIsSubmitting(false);
        return;
      }

      // First register the farmer
      const result = await farmerService.registerFarmer(formData);
      if (!result || !result.farmerId) {
        throw new Error('Invalid response from server');
      }

      // Then initiate payment
      await handlePayment(result.farmerId);
    } catch (err) {
      console.error('Registration error:', err);
      if (err.message === 'Failed to fetch') {
        setError('Could not connect to server. Please check your connection and try again.');
      } else {
        setError(err.message || 'Failed to register farmer');
      }
      setIsSubmitting(false);
    }
  };

  if (registrationComplete) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-green-50 p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-green-800 mb-4">
            Registration Complete!
          </h2>
          <p className="text-gray-700 mb-4">
            Thank you for registering with us!
          </p>
          <p className="text-gray-600 mb-4">
            Your registration ID: {registrationId}
          </p>
          <button
            onClick={() => {
              setFormData({
                farmerName: '',
                fatherSpouseName: '',
                contactNumber: '',
                email: '',
                village: '',
                mandal: '',
                district: '',
                state: '',
                aadhaarFarmerId: '',
                registrationDate: new Date().toISOString().split('T')[0],
                totalLand: '',
                naturalFarmingArea: '',
                currentFarmingPractice: '',
                farmingExperience: '',
                irrigationSource: '',
                livestock: [],
                willingToAdoptNaturalInputs: '',
                trainingRequired: '',
                localGroupName: '',
                preferredCroppingSeason: '',
                presentCrop: '',
                cropTypes: '',
                sowingDate: '',
                harvestingDate: '',
                remarks: ''
              });
              setRegistrationComplete(false);
              setRegistrationId(null);
              setStep(1);
            }}
            className="mt-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Register Another Farmer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg p-6 md:p-8"
      >
        <h1 className="text-2xl font-bold text-green-800 text-center mb-2">
          Natural Farming Registration
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Please fill in all required fields marked with *
        </p>

        <form noValidate onSubmit={handleSubmit} className="space-y-6">
          {step === 1 ? (
            // Step 1: Farmer Details
            <>
              <h2 className="text-xl font-semibold text-green-800 mb-6">
                Farmer Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Registration Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Date *
                  </label>
                  <input
                    type="date"
                    name="registrationDate"
                    value={formData.registrationDate}
                    onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>

                {/* Farmer Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Farmer Name *
                  </label>
                  <input
                    type="text"
                    name="farmerName"
                    placeholder="Enter farmer's full name"
                    value={formData.farmerName}
                    onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>

                {/* Father/Spouse Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Father / Spouse Name *
                  </label>
                  <input
                    type="text"
                    name="fatherSpouseName"
                    placeholder="Enter father's or spouse's name"
                    value={formData.fatherSpouseName}
                    onChange={(e) => setFormData({ ...formData, fatherSpouseName: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    placeholder="10-digit mobile number"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    required
                    pattern="[0-9]{10}"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email ID (optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>

                {/* Village */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Village / Panchayat *
                  </label>
                  <input
                    type="text"
                    name="village"
                    placeholder="Enter village name"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>

                {/* Mandal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mandal / Block *
                  </label>
                  <input
                    type="text"
                    name="mandal"
                    placeholder="Enter mandal/block"
                    value={formData.mandal}
                    onChange={(e) => setFormData({ ...formData, mandal: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>

                {/* District */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    District *
                  </label>
                  <input
                    type="text"
                    name="district"
                    placeholder="Enter district"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    placeholder="Enter state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>

                {/* Aadhaar/Farmer ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aadhaar / Farmer ID (Optional)
                  </label>
                  <input
                    type="text"
                    name="aadhaarFarmerId"
                    placeholder="Enter ID number"
                    value={formData.aadhaarFarmerId}
                    onChange={(e) => setFormData({ ...formData, aadhaarFarmerId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>
            </>
          ) : step === 2 ? (
            // Step 2: Farm Details
            <>
              <h2 className="text-xl font-semibold text-green-800 mb-6">Farm Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total Land */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Land (in Acres or Hectares) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="totalLand"
                    placeholder="e.g., 2.5"
                    value={formData.totalLand}
                    onChange={(e) => setFormData({ ...formData, totalLand: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>

                {/* Natural Farming Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Area Under Natural Farming (Ha) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="naturalFarmingArea"
                    placeholder="e.g., 1.5"
                    value={formData.naturalFarmingArea}
                    onChange={(e) => setFormData({ ...formData, naturalFarmingArea: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>

                {/* Current Farming Practice */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Farming Practice *
                  </label>
                  <select
                    name="currentFarmingPractice"
                    value={formData.currentFarmingPractice}
                    onChange={(e) => setFormData({ ...formData, currentFarmingPractice: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  >
                    <option value="">Select practice</option>
                    <option value="Natural">Natural</option>
                    <option value="Organic">Organic</option>
                    <option value="Conventional">Conventional</option>
                    <option value="Chemical">Chemical</option>
                  </select>
                </div>

                {/* Farming Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Farming Experience *
                  </label>
                  <input
                    type="number"
                    name="farmingExperience"
                    placeholder="Years of experience"
                    value={formData.farmingExperience}
                    onChange={(e) => setFormData({ ...formData, farmingExperience: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>

                {/* Irrigation Source */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Irrigation Source *
                  </label>
                  <select
                    name="irrigationSource"
                    value={formData.irrigationSource}
                    onChange={(e) => setFormData({ ...formData, irrigationSource: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  >
                    <option value="">Select source</option>
                    <option value="Borewell">Borewell</option>
                    <option value="Canal">Canal</option>
                    <option value="Rainfed">Rainfed</option>
                  </select>
                </div>

                {/* Livestock */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Livestock (if any)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Poultry', 'Aqua', 'Cow', 'Buffalo', 'Goat', 'Sheep', 'Yak', 'Camel'].map((animal) => (
                      <label key={animal} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          value={animal}
                          checked={formData.livestock.includes(animal)}
                          onChange={(e) => {
                            const newLivestock = e.target.checked
                              ? [...formData.livestock, animal]
                              : formData.livestock.filter(item => item !== animal);
                            setFormData({ ...formData, livestock: newLivestock });
                          }}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{animal}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Willingness to Adopt Natural Inputs */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Willing to Adopt Natural Inputs? *
                  </label>
                  <select
                    name="willingToAdoptNaturalInputs"
                    value={formData.willingToAdoptNaturalInputs}
                    onChange={(e) => setFormData({ ...formData, willingToAdoptNaturalInputs: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  >
                    <option value="">Select option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                {/* Training Required */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Training Required? *
                  </label>
                  <select
                    name="trainingRequired"
                    value={formData.trainingRequired}
                    onChange={(e) => setFormData({ ...formData, trainingRequired: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  >
                    <option value="">Select option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                {/* Local Group Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Local Group Name / SHG / FPO
                  </label>
                  <input
                    type="text"
                    name="localGroupName"
                    placeholder="Group/SHG/FPO name"
                    value={formData.localGroupName}
                    onChange={(e) => setFormData({ ...formData, localGroupName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>

                {/* Preferred Cropping Season */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Cropping Season *
                  </label>
                  <select
                    name="preferredCroppingSeason"
                    value={formData.preferredCroppingSeason}
                    onChange={(e) => setFormData({ ...formData, preferredCroppingSeason: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  >
                    <option value="">Select season</option>
                    <option value="Kharif">Kharif</option>
                    <option value="Rabi">Rabi</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
              </div>
            </>
          ) : (
            // Step 3: Crop Details
            <>
              <h2 className="text-xl font-semibold text-green-800 mb-6">Crop Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Present Crop */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Present Crop *
                  </label>
                  <input
                    type="text"
                    name="presentCrop"
                    placeholder="Current crop"
                    value={formData.presentCrop}
                    onChange={(e) => setFormData({ ...formData, presentCrop: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>

                {/* Crop Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Crop Type(s) *
                  </label>
                  <input
                    type="text"
                    name="cropTypes"
                    placeholder="Type of crops"
                    value={formData.cropTypes}
                    onChange={(e) => setFormData({ ...formData, cropTypes: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>

                {/* Sowing Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sowing Date *
                  </label>
                  <input
                    type="date"
                    name="sowingDate"
                    value={formData.sowingDate}
                    onChange={(e) => setFormData({ ...formData, sowingDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>

                {/* Harvesting Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Harvesting Date
                  </label>
                  <input
                    type="date"
                    name="harvestingDate"
                    value={formData.harvestingDate}
                    onChange={(e) => setFormData({ ...formData, harvestingDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks / Comments
                </label>
                <textarea
                  name="remarks"
                  rows="3"
                  placeholder="Any additional notes"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>

              {/* Fee Information */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    For Nature Farming Certificate & Support
                  </span>
                  <span className="text-lg font-semibold text-green-700">Rs. 300</span>
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={() => step === 1 ? navigate('/') : setStep(step - 1)}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              {step === 1 ? 'Back' : 'Previous'}
            </button>
            
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-md text-white
                  ${isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
                `}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Registration'}
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RegisterPage;


