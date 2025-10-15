import React, { useState } from "react";
import { motion } from "framer-motion";

export function FarmerForm({ onNext, onBack, initial = {} }) {
  const [local, setLocal] = useState({
    registrationDate: initial.registrationDate || new Date().toISOString().slice(0, 10),
    name: initial.name || "",
    fatherName: initial.fatherName || "",
    phone: initial.phone || "",
    email: initial.email || "",
    village: initial.village || "",
    block: initial.block || "",
    district: initial.district || "",
    state: initial.state || "",
    aadhaar: initial.aadhaar || "",
    landSize: initial.landSize || "",
    areaNatural: initial.areaNatural || "",
    practice: initial.practice || "",
    irrigation: initial.irrigation || ""
  });

  const [errors, setErrors] = useState({});

  const setField = (k, v) => {
    setLocal((p) => ({ ...p, [k]: v }));
    validate(k, v);
  };

  const validate = (field, value) => {
    const updates = {};
    
    switch (field) {
      case 'name':
        if (!value.trim()) updates.name = 'Name is required';
        break;
      case 'phone':
        if (!value) updates.phone = 'Phone is required';
        break;
      case 'aadhaar':
        if (!value) updates.aadhaar = 'Aadhaar is required';
        break;
      case 'landSize':
        if (!value) updates.landSize = 'Land size is required';
        break;
      case 'areaNatural':
        if (!value) updates.areaNatural = 'Natural area is required';
        break;
      case 'practice':
        if (!value.trim()) updates.practice = 'Practice is required';
        break;
      case 'irrigation':
        if (!value.trim()) updates.irrigation = 'Irrigation is required';
        break;
      case 'village':
        if (!value.trim()) updates.village = 'Village is required';
        break;
      case 'block':
        if (!value.trim()) updates.block = 'Block is required';
        break;
      case 'district':
        if (!value.trim()) updates.district = 'District is required';
        break;
      case 'state':
        if (!value.trim()) updates.state = 'State is required';
        break;
      // Optional fields: no strict validation
      default:
        break;
    }

    setErrors(prev => ({ ...prev, [field]: updates[field] }));
    return !Object.values(updates).length;
  };

  const validateAll = () => {
    const requiredFields = [
      'name', 
      'phone', 
      'aadhaar',
      'village', 
      'block', 
      'district', 
      'state',
      'landSize',
      'areaNatural',
      'practice',
      'irrigation'
    ];
    const allErrors = {};
    requiredFields.forEach(field => {
      const value = local[field];
      if (!validate(field, value)) {
        allErrors[field] = errors[field];
      }
    });
    if (local.email) {
      if (!validate('email', local.email)) {
        allErrors.email = errors.email;
      }
    }
    setErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateAll()) {
      // Map frontend fields to backend expected names
      const payload = {
        registrationDate: local.registrationDate || null,
        farmerName: local.name || null,
        fatherSpouseName: local.fatherName || null,
        contactNumber: local.phone || null,
        email: local.email || null,
        aadhaarFarmerId: local.aadhaar || null,
        village: local.village || null,
        mandal: local.block || null,
        district: local.district || null,
        state: local.state || null,
        pincode: local.pincode || null,
        totalLand: local.landSize || null,
        naturalFarmingArea: local.areaNatural || null,
        presentCrop: local.presentCrop || null,
        cropTypes: local.cropTypes || null,
        sowingDate: local.sowingDate || null,
        harvestingDate: local.harvestingDate || null,
        currentFarmingPractice: local.practice || null,
        farmingExperience: local.yearsExperience || null,
        irrigationSource: local.irrigation || null,
        livestock: local.livestock || [],
        willingToAdoptNaturalInputs: local.adoptInputs || null,
        trainingRequired: local.training || null,
        localGroupName: local.group || null,
        preferredCroppingSeason: local.season || null,
        remarks: local.remarks || null
      };
      onNext(payload);
    }
  };

  return (
    <motion.div
      className="p-8 flex flex-col items-center bg-white rounded-2xl shadow-md max-w-2xl"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-lg md:text-xl font-semibold text-green-700 mb-2">
        Farmer Registration
      </h2>

      <h2 className="text-lg md:text-xl font-semibold text-green-700 mb-2">
        Farmer Registration
      </h2>

      <p className="text-gray-600 mb-4">Please fill required fields marked *</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
        <div>
          <label className="text-xs text-gray-600">Registration Date *</label>
          <input 
            type="date" 
            value={local.registrationDate} 
            className={"w-full border rounded-xl p-3"}
            onChange={e => setField('registrationDate', e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-gray-600">Name *</label>
          <input 
            type="text" 
            value={local.name} 
            className={"w-full border rounded-xl p-3" + (errors.name ? " border-red-500" : "")}
            onChange={e => setField('name', e.target.value)}
          />
          {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
        </div>
        <div>
          <label className="text-xs text-gray-600">Father's Name</label>
          <input 
            type="text" 
            value={local.fatherName} 
            className={"w-full border rounded-xl p-3"}
            onChange={e => setField('fatherName', e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-gray-600">Phone *</label>
          <input 
            type="text" 
            value={local.phone} 
            className={"w-full border rounded-xl p-3" + (errors.phone ? " border-red-500" : "")}
            onChange={e => setField('phone', e.target.value)}
          />
          {errors.phone && <span className="text-xs text-red-500">{errors.phone}</span>}
        </div>
        <div>
          <label className="text-xs text-gray-600">Email</label>
          <input 
            type="email" 
            value={local.email} 
            className={"w-full border rounded-xl p-3" + (errors.email ? " border-red-500" : "")}
            onChange={e => setField('email', e.target.value)}
          />
          {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
        </div>
        <div>
          <label className="text-xs text-gray-600">Aadhaar *</label>
          <input 
            type="text" 
            value={local.aadhaar} 
            className={"w-full border rounded-xl p-3" + (errors.aadhaar ? " border-red-500" : "")}
            onChange={e => setField('aadhaar', e.target.value)}
          />
          {errors.aadhaar && <span className="text-xs text-red-500">{errors.aadhaar}</span>}
        </div>
        <div>
          <label className="text-xs text-gray-600">Village *</label>
          <input 
            type="text" 
            value={local.village} 
            className={"w-full border rounded-xl p-3" + (errors.village ? " border-red-500" : "")}
            onChange={e => setField('village', e.target.value)}
          />
          {errors.village && <span className="text-xs text-red-500">{errors.village}</span>}
        </div>
        <div>
          <label className="text-xs text-gray-600">Block *</label>
          <input 
            type="text" 
            value={local.block} 
            className={"w-full border rounded-xl p-3" + (errors.block ? " border-red-500" : "")}
            onChange={e => setField('block', e.target.value)}
          />
          {errors.block && <span className="text-xs text-red-500">{errors.block}</span>}
        </div>
        <div>
          <label className="text-xs text-gray-600">District *</label>
          <input 
            type="text" 
            value={local.district} 
            className={"w-full border rounded-xl p-3" + (errors.district ? " border-red-500" : "")}
            onChange={e => setField('district', e.target.value)}
          />
          {errors.district && <span className="text-xs text-red-500">{errors.district}</span>}
        </div>
        <div>
          <label className="text-xs text-gray-600">State *</label>
          <input 
            type="text" 
            value={local.state} 
            className={"w-full border rounded-xl p-3" + (errors.state ? " border-red-500" : "")}
            onChange={e => setField('state', e.target.value)}
          />
          {errors.state && <span className="text-xs text-red-500">{errors.state}</span>}
        </div>
        {/* Add missing required fields */}
        <div>
          <label className="text-xs text-gray-600">Land Size (acres) *</label>
          <input 
            type="number" 
            value={local.landSize} 
            className={"w-full border rounded-xl p-3" + (errors.landSize ? " border-red-500" : "")}
            onChange={e => setField('landSize', e.target.value)}
          />
          {errors.landSize && <span className="text-xs text-red-500">{errors.landSize}</span>}
        </div>
        <div>
          <label className="text-xs text-gray-600">Natural Area (acres) *</label>
          <input 
            type="number" 
            value={local.areaNatural} 
            className={"w-full border rounded-xl p-3" + (errors.areaNatural ? " border-red-500" : "")}
            onChange={e => setField('areaNatural', e.target.value)}
          />
          {errors.areaNatural && <span className="text-xs text-red-500">{errors.areaNatural}</span>}
        </div>
        <div>
          <label className="text-xs text-gray-600">Practice *</label>
          <input 
            type="text" 
            value={local.practice} 
            className={"w-full border rounded-xl p-3" + (errors.practice ? " border-red-500" : "")}
            onChange={e => setField('practice', e.target.value)}
          />
          {errors.practice && <span className="text-xs text-red-500">{errors.practice}</span>}
        </div>
        <div>
          <label className="text-xs text-gray-600">Irrigation *</label>
          <input 
            type="text" 
            value={local.irrigation} 
            className={"w-full border rounded-xl p-3" + (errors.irrigation ? " border-red-500" : "")}
            onChange={e => setField('irrigation', e.target.value)}
          />
          {errors.irrigation && <span className="text-xs text-red-500">{errors.irrigation}</span>}
        </div>
      </div>
      <div className="flex w-full justify-between mt-8">
        <button type="button" className="px-4 py-2 rounded bg-gray-300" onClick={onBack}>Back</button>
        <button type="button" className="px-4 py-2 rounded bg-green-600 text-white" onClick={handleSubmit}>Next</button>
      </div>
    </motion.div>
  );
}