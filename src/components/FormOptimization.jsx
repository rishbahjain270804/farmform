import { useCallback, useEffect, useState } from 'react';
import { debounce } from 'lodash';

export function useFormOptimization(initialValues, validationSchema, onSubmit) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});

  // Debounced validation to prevent excessive validation calls
  const debouncedValidate = useCallback(
    debounce(async (fieldName, value) => {
      try {
        await validationSchema.validateAt(fieldName, values);
        setErrors(prev => ({ ...prev, [fieldName]: undefined }));
      } catch (error) {
        setErrors(prev => ({ ...prev, [fieldName]: error.message }));
      }
    }, 300),
    [values, validationSchema]
  );

  // Handle field changes with optimized validation
  const handleChange = useCallback((fieldName, value) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
    
    if (touchedFields[fieldName]) {
      debouncedValidate(fieldName, value);
    }
  }, [touchedFields, debouncedValidate]);

  // Handle field blur events
  const handleBlur = useCallback((fieldName) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
    debouncedValidate(fieldName, values[fieldName]);
  }, [values, debouncedValidate]);

  // Optimized form submission
  const handleSubmit = async (e) => {
    e?.preventDefault();
    setIsSubmitting(true);

    try {
      const validatedData = await validationSchema.validate(values, {
        abortEarly: false
      });
      await onSubmit(validatedData);
    } catch (error) {
      if (error.inner) {
        const validationErrors = {};
        error.inner.forEach(err => {
          validationErrors[err.path] = err.message;
        });
        setErrors(validationErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedValidate.cancel();
    };
  }, [debouncedValidate]);

  return {
    values,
    errors,
    isSubmitting,
    touched: touchedFields,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    setErrors
  };
}

// Optimized form field with error handling and validation
export function FormField({ 
  name, 
  label, 
  value, 
  onChange, 
  onBlur, 
  error, 
  touched,
  type = 'text',
  ...props 
}) {
  // Memoize change handler
  const handleChange = useCallback((e) => {
    const value = e.target.value;
    onChange(name, value);
  }, [name, onChange]);

  // Memoize blur handler
  const handleBlur = useCallback(() => {
    onBlur(name);
  }, [name, onBlur]);

  return (
    <div className="form-field">
      {label && (
        <label 
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`
          w-full px-3 py-2 border rounded-lg shadow-sm
          focus:outline-none focus:ring-2 focus:ring-offset-2
          ${error && touched
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-green-500'
          }
        `}
        {...props}
      />
      {error && touched && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}