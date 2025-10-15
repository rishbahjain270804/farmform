import React, { useState } from "react";
import { motion } from "framer-motion";

export function FarmDetails({ onNext, onBack, initial = {} }) {
  const [local, setLocal] = useState({
    landSize: initial.landSize || "",
    areaNatural: initial.areaNatural || "",
    presentCrop: initial.presentCrop || "",
    sowingDate: initial.sowingDate || "",
    harvestingDate: initial.harvestingDate || "",
    cropTypes: initial.cropTypes || "",
    practice: initial.practice || "",
    yearsExperience: initial.yearsExperience || "",
    irrigation: initial.irrigation || "",
    livestock: initial.livestock || [],
    adoptInputs: initial.adoptInputs || "",
    training: initial.training || "",
    group: initial.group || "",
    season: initial.season || "",
    remarks: initial.remarks || "",
  });

  const [errors, setErrors] = useState({});

  const setField = (k, v) => {
    setLocal((p) => ({ ...p, [k]: v }));
    validate(k, v, local); // Pass current local to check date relationships
  };

  const toggleLivestock = (animal) => {
    setLocal((p) => {
      const found = p.livestock.includes(animal);
      return { 
        ...p, 
        livestock: found ? p.livestock.filter(a => a !== animal) : [...p.livestock, animal] 
      };
    });
  };

  const validate = (field, value, currentValues = local) => {
    const updates = {};
    
    switch (field) {
      case 'landSize':
        if (!value) updates.landSize = 'Land size is required';
        else if (isNaN(value) || parseFloat(value) <= 0) 
          updates.landSize = 'Enter a valid land size';
        break;
      
      case 'areaNatural':
        if (!value) updates.areaNatural = 'Natural farming area is required';
        else if (isNaN(value) || parseFloat(value) <= 0) 
          updates.areaNatural = 'Enter a valid area';
        else if (parseFloat(value) > parseFloat(currentValues.landSize || 0)) 
          updates.areaNatural = 'Natural area cannot exceed total land';
        break;
      
      case 'sowingDate':
        if (value && currentValues.harvestingDate && 
            new Date(value) >= new Date(currentValues.harvestingDate)) {
          updates.sowingDate = 'Sowing date must be before harvest';
        }
        break;
      
      case 'harvestingDate':
        if (value && currentValues.sowingDate && 
            new Date(value) <= new Date(currentValues.sowingDate)) {
          updates.harvestingDate = 'Harvest date must be after sowing';
        }
        break;
      
      case 'yearsExperience':
        if (value && (isNaN(value) || parseInt(value) < 0 || parseInt(value) > 100)) 
          updates.yearsExperience = 'Enter a valid number of years';
        break;
      
      case 'practice':
        if (!value) updates.practice = 'Select current practice';
        break;
      
      case 'irrigation':
        if (!value) updates.irrigation = 'Select irrigation source';
        break;
      
      case 'cropTypes':
        if (!value.trim()) updates.cropTypes = 'Enter at least one crop type';
        break;
    }

    setErrors(prev => ({ ...prev, [field]: updates[field] }));
    return !updates[field];
  };

  const validateAll = () => {
    const requiredFields = ['landSize', 'areaNatural', 'practice', 'irrigation', 'cropTypes'];
    const allErrors = {};
    
    requiredFields.forEach(field => {
      if (!validate(field, local[field], local)) {
        allErrors[field] = errors[field] || \`\${field} is required\`;
      }
    });

    // Optional fields with format requirements
    if (local.yearsExperience) validate('yearsExperience', local.yearsExperience, local);
    if (local.sowingDate) validate('sowingDate', local.sowingDate, local);
    if (local.harvestingDate) validate('harvestingDate', local.harvestingDate, local);

    setErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateAll()) {
      onNext(local);
    }
  };

  return (
    <motion.div
      className="p-8 flex flex-col items-center bg-white rounded-2xl shadow-md max-w-4xl"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-lg md:text-xl font-semibold text-green-700 mb-2">Farm & Crop Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
        <div>
          <label className="text-xs text-gray-600">Total Land (Acres / Ha) *</label>
          <input 
            value={local.landSize} 
            onChange={(e)=>setField('landSize', e.target.value)}
            placeholder="e.g., 2.5 acres" 
            className={\`w-full border rounded-xl p-3 \${errors.landSize ? 'border-red-500' : ''}\`}
          />
          {errors.landSize && <p className="text-red-500 text-xs mt-1">{errors.landSize}</p>}
        </div>

        <div>
          <label className="text-xs text-gray-600">Area under Natural Farming (Ha) *</label>
          <input 
            value={local.areaNatural} 
            onChange={(e)=>setField('areaNatural', e.target.value)}
            placeholder="e.g., 1.2" 
            className={\`w-full border rounded-xl p-3 \${errors.areaNatural ? 'border-red-500' : ''}\`}
          />
          {errors.areaNatural && <p className="text-red-500 text-xs mt-1">{errors.areaNatural}</p>}
        </div>

        <div>
          <label className="text-xs text-gray-600">Present Crop</label>
          <input 
            value={local.presentCrop} 
            onChange={(e)=>setField('presentCrop', e.target.value)}
            placeholder="e.g., Vegetables" 
            className="w-full border rounded-xl p-3"
          />
        </div>

        <div>
          <label className="text-xs text-gray-600">Crop Type(s) *</label>
          <input 
            value={local.cropTypes} 
            onChange={(e)=>setField('cropTypes', e.target.value)}
            placeholder="e.g., Rice, Vegetables" 
            className={\`w-full border rounded-xl p-3 \${errors.cropTypes ? 'border-red-500' : ''}\`}
          />
          {errors.cropTypes && <p className="text-red-500 text-xs mt-1">{errors.cropTypes}</p>}
        </div>

        <div>
          <label className="text-xs text-gray-600">Sowing Date</label>
          <input 
            type="date" 
            value={local.sowingDate} 
            onChange={(e)=>setField('sowingDate', e.target.value)}
            className={\`w-full border rounded-xl p-3 \${errors.sowingDate ? 'border-red-500' : ''}\`}
          />
          {errors.sowingDate && <p className="text-red-500 text-xs mt-1">{errors.sowingDate}</p>}
        </div>

        <div>
          <label className="text-xs text-gray-600">Harvesting Date</label>
          <input 
            type="date" 
            value={local.harvestingDate} 
            onChange={(e)=>setField('harvestingDate', e.target.value)}
            className={\`w-full border rounded-xl p-3 \${errors.harvestingDate ? 'border-red-500' : ''}\`}
          />
          {errors.harvestingDate && <p className="text-red-500 text-xs mt-1">{errors.harvestingDate}</p>}
        </div>

        <div>
          <label className="text-xs text-gray-600">Current Farming Practice *</label>
          <select 
            value={local.practice} 
            onChange={(e)=>setField('practice', e.target.value)}
            className={\`w-full border rounded-xl p-3 \${errors.practice ? 'border-red-500' : ''}\`}
          >
            <option value="">Select</option>
            <option>Natural</option>
            <option>Organic</option>
            <option>Conventional</option>
            <option>Chemical</option>
          </select>
          {errors.practice && <p className="text-red-500 text-xs mt-1">{errors.practice}</p>}
        </div>

        <div>
          <label className="text-xs text-gray-600">Years of Farming Experience</label>
          <input 
            value={local.yearsExperience} 
            onChange={(e)=>setField('yearsExperience', e.target.value)}
            placeholder="e.g., 10" 
            className={\`w-full border rounded-xl p-3 \${errors.yearsExperience ? 'border-red-500' : ''}\`}
          />
          {errors.yearsExperience && <p className="text-red-500 text-xs mt-1">{errors.yearsExperience}</p>}
        </div>

        <div>
          <label className="text-xs text-gray-600">Irrigation Source *</label>
          <select 
            value={local.irrigation} 
            onChange={(e)=>setField('irrigation', e.target.value)}
            className={\`w-full border rounded-xl p-3 \${errors.irrigation ? 'border-red-500' : ''}\`}
          >
            <option value="">Select</option>
            <option>Borewell</option>
            <option>Canal</option>
            <option>Rainfed</option>
          </select>
          {errors.irrigation && <p className="text-red-500 text-xs mt-1">{errors.irrigation}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-gray-600">Livestock (check all that apply)</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {['Poultry','Aqua','Cow','Buffalo','Goat','Sheep','Yak','Camel'].map(a=> (
              <button 
                type="button" 
                key={a} 
                onClick={()=>toggleLivestock(a)} 
                className={\`px-3 py-1.5 rounded-lg border \${local.livestock.includes(a)? 'bg-green-600 text-white': 'bg-white'}\`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-600">Willing to Adopt Natural Inputs?</label>
          <select 
            value={local.adoptInputs} 
            onChange={(e)=>setField('adoptInputs', e.target.value)}
            className="w-full border rounded-xl p-3"
          >
            <option value="">Select</option>
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-600">Training Required?</label>
          <select 
            value={local.training} 
            onChange={(e)=>setField('training', e.target.value)}
            className="w-full border rounded-xl p-3"
          >
            <option value="">Select</option>
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-600">Local Group / SHG / FPO</label>
          <input 
            value={local.group} 
            onChange={(e)=>setField('group', e.target.value)}
            placeholder="e.g., Green Growers SHG" 
            className="w-full border rounded-xl p-3"
          />
        </div>

        <div>
          <label className="text-xs text-gray-600">Preferred Cropping Season</label>
          <select 
            value={local.season} 
            onChange={(e)=>setField('season', e.target.value)}
            className="w-full border rounded-xl p-3"
          >
            <option value="">Select</option>
            <option>Kharif</option>
            <option>Rabi</option>
            <option>Both</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-gray-600">Remarks / Comments</label>
          <textarea 
            value={local.remarks} 
            onChange={(e)=>setField('remarks', e.target.value)}
            rows={3} 
            className="w-full border rounded-xl p-3" 
            placeholder="Any extra info" 
          />
        </div>
      </div>

      <div className="mt-6 bg-gray-50 rounded-xl border p-4 text-left text-sm w-full max-w-4xl">
        <div className="flex justify-between">
          <span>Certification, Registration & support fee</span>
          <span className="font-semibold">Rs. 1,300</span>
        </div>
      </div>

      <div className="flex justify-between w-full max-w-4xl mt-8">
        <button 
          type="button" 
          onClick={onBack} 
          className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50"
        >
          Back
        </button>
        <button 
          type="button" 
          onClick={handleSubmit}
          className="px-5 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
}
