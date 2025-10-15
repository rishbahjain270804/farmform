import React, { useState } from 'react';
import { motion } from 'framer-motion';

const StepForm = ({ 
  formData: initialFormData, 
  setFormData: updateFormData, 
  onNext,
  error: serverError,
  isSubmitting
}) => {
  const [formData, setFormData] = useState({
    ...initialFormData,
    crops: initialFormData.crops || [{ name: '', sowingDate: '', extent: '' }]
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.farmerName) newErrors.farmerName = 'Farmer Name is required';
    if (!formData.fatherName) newErrors.fatherName = 'Father/Spouse Name is required';
    if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Valid 10-digit phone number is required';
    }
    if (!formData.village) newErrors.village = 'Village/Panchayat is required';
    if (!formData.mandal) newErrors.mandal = 'Mandal/Block is required';
    if (!formData.district) newErrors.district = 'District is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.totalLand) newErrors.totalLand = 'Total Land is required';
    if (!formData.naturalFarmingArea) newErrors.naturalFarmingArea = 'Area Under Natural Farming is required';
    if (!formData.farmingPractice) newErrors.farmingPractice = 'Current Farming Practice is required';
    
    // Validate crops
    if (!formData.crops || formData.crops.length === 0) {
      newErrors.crops = 'At least one crop is required';
    } else {
      formData.crops.forEach((crop, index) => {
        if (!crop.name) newErrors[`crop-${index}-name`] = 'Crop name is required';
        if (!crop.sowingDate) newErrors[`crop-${index}-sowing`] = 'Sowing date is required';
        if (!crop.extent) newErrors[`crop-${index}-extent`] = 'Crop extent is required';
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      updateFormData(formData);
      const success = await onNext(formData);
      if (success === false) {
        setErrors(prev => ({
          ...prev,
          submit: serverError
        }));
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto p-6"
    >
      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-green-800 mb-6">Farmer Registration Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="farmerName" className="block text-sm font-medium text-gray-700">
              Farmer Name *
            </label>
            <input
              type="text"
              id="farmerName"
              name="farmerName"
              value={formData.farmerName || ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm
                ${errors.farmerName ? 'border-red-300' : ''}`}
            />
            {errors.farmerName && (
              <p className="mt-1 text-sm text-red-600">{errors.farmerName}</p>
            )}
          </div>

          <div>
            <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700">
              Father/Spouse Name *
            </label>
            <input
              type="text"
              id="fatherName"
              name="fatherName"
              value={formData.fatherName || ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm
                ${errors.fatherName ? 'border-red-300' : ''}`}
            />
            {errors.fatherName && (
              <p className="mt-1 text-sm text-red-600">{errors.fatherName}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Contact Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone || ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm
                ${errors.phone ? 'border-red-300' : ''}`}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email ID (optional)
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="village" className="block text-sm font-medium text-gray-700">
              Village/Panchayat *
            </label>
            <input
              type="text"
              id="village"
              name="village"
              value={formData.village || ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm
                ${errors.village ? 'border-red-300' : ''}`}
            />
            {errors.village && (
              <p className="mt-1 text-sm text-red-600">{errors.village}</p>
            )}
          </div>

          <div>
            <label htmlFor="mandal" className="block text-sm font-medium text-gray-700">
              Mandal/Block *
            </label>
            <input
              type="text"
              id="mandal"
              name="mandal"
              value={formData.mandal || ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm
                ${errors.mandal ? 'border-red-300' : ''}`}
            />
            {errors.mandal && (
              <p className="mt-1 text-sm text-red-600">{errors.mandal}</p>
            )}
          </div>

          <div>
            <label htmlFor="district" className="block text-sm font-medium text-gray-700">
              District *
            </label>
            <input
              type="text"
              id="district"
              name="district"
              value={formData.district || ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm
                ${errors.district ? 'border-red-300' : ''}`}
            />
            {errors.district && (
              <p className="mt-1 text-sm text-red-600">{errors.district}</p>
            )}
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State *
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state || ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm
                ${errors.state ? 'border-red-300' : ''}`}
            />
            {errors.state && (
              <p className="mt-1 text-sm text-red-600">{errors.state}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="totalLand" className="block text-sm font-medium text-gray-700">
              Total Land (in Acres) *
            </label>
            <input
              type="number"
              id="totalLand"
              name="totalLand"
              min="0"
              step="0.01"
              value={formData.totalLand || ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm
                ${errors.totalLand ? 'border-red-300' : ''}`}
            />
            {errors.totalLand && (
              <p className="mt-1 text-sm text-red-600">{errors.totalLand}</p>
            )}
          </div>

          <div>
            <label htmlFor="naturalFarmingArea" className="block text-sm font-medium text-gray-700">
              Area Under Natural Farming (Ha) *
            </label>
            <input
              type="number"
              id="naturalFarmingArea"
              name="naturalFarmingArea"
              min="0"
              step="0.01"
              value={formData.naturalFarmingArea || ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm
                ${errors.naturalFarmingArea ? 'border-red-300' : ''}`}
            />
            {errors.naturalFarmingArea && (
              <p className="mt-1 text-sm text-red-600">{errors.naturalFarmingArea}</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Crop Details</h3>
            <button
              type="button"
              onClick={() => setFormData(prev => ({
                ...prev,
                crops: [...(prev.crops || []), { name: '', sowingDate: '', extent: '' }]
              }))}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
            >
              + Add Crop
            </button>
          </div>

          {formData.crops && formData.crops.map((crop, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-700">Crop #{index + 1}</h4>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        crops: prev.crops.filter((_, i) => i !== index)
                      }));
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor={`crop-${index}-name`} className="block text-sm font-medium text-gray-700">
                    Crop Name *
                  </label>
                  <input
                    type="text"
                    id={`crop-${index}-name`}
                    value={crop.name}
                    onChange={(e) => {
                      const newCrops = [...formData.crops];
                      newCrops[index].name = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        crops: newCrops
                      }));
                    }}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm
                      ${errors[`crop-${index}-name`] ? 'border-red-300' : ''}`}
                  />
                  {errors[`crop-${index}-name`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`crop-${index}-name`]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor={`crop-${index}-sowing`} className="block text-sm font-medium text-gray-700">
                    Sowing Date *
                  </label>
                  <input
                    type="date"
                    id={`crop-${index}-sowing`}
                    value={crop.sowingDate}
                    onChange={(e) => {
                      const newCrops = [...formData.crops];
                      newCrops[index].sowingDate = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        crops: newCrops
                      }));
                    }}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm
                      ${errors[`crop-${index}-sowing`] ? 'border-red-300' : ''}`}
                  />
                  {errors[`crop-${index}-sowing`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`crop-${index}-sowing`]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor={`crop-${index}-extent`} className="block text-sm font-medium text-gray-700">
                    Extent (Acres) *
                  </label>
                  <input
                    type="number"
                    id={`crop-${index}-extent`}
                    value={crop.extent}
                    onChange={(e) => {
                      const newCrops = [...formData.crops];
                      newCrops[index].extent = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        crops: newCrops
                      }));
                    }}
                    min="0"
                    step="0.01"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm
                      ${errors[`crop-${index}-extent`] ? 'border-red-300' : ''}`}
                  />
                  {errors[`crop-${index}-extent`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`crop-${index}-extent`]}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <label htmlFor="farmingPractice" className="block text-sm font-medium text-gray-700">
            Current Farming Practice *
          </label>
          <select
            id="farmingPractice"
            name="farmingPractice"
            value={formData.farmingPractice || ''}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm
              ${errors.farmingPractice ? 'border-red-300' : ''}`}
          >
            <option value="">Select practice</option>
            <option value="Natural">Natural</option>
            <option value="Organic">Organic</option>
            <option value="Conventional">Conventional</option>
            <option value="Chemical">Chemical</option>
          </select>
          {errors.farmingPractice && (
            <p className="mt-1 text-sm text-red-600">{errors.farmingPractice}</p>
          )}
        </div>

        <div className="pt-6">
          {serverError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {serverError}
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${isSubmitting 
                ? 'bg-green-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
              }`}
          >
            {isSubmitting ? 'Submitting...' : 'Next Step'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default StepForm;