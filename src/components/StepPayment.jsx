import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { paymentService } from '../services/paymentService';

const StepPayment = ({ farmerId, onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isGatewayReady, setIsGatewayReady] = useState(() => (
    typeof window !== 'undefined' && Boolean(window.Razorpay)
  ));

  const initializePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (typeof window === 'undefined' || !window.Razorpay || !isGatewayReady) {
        throw new Error('Payment gateway failed to load. Please refresh and try again.');
      }

      const { order, key } = await paymentService.createPaymentOrder({ farmerId });

      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: 'Farmer Registration',
        description: 'Registration Fee Payment',
        order_id: order.id,
        handler: async (response) => {
          try {
            const verification = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              farmerId
            });

            if (verification?.success === false) {
              const message = verification.message || 'Payment verification failed';
              setError(message);
              onError?.(message);
              return;
            }

            setError(null);
            onSuccess?.();
          } catch (verificationError) {
            console.error('Payment verification error:', verificationError);
            const message = verificationError?.message || 'Error verifying payment';
            setError(message);
            onError?.(message);
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            const message = 'Payment window was closed before completion. You can try again when ready.';
            setError(message);
            onError?.(message);
          }
        },
        prefill: {
          name: 'Farmer',
          email: '',
          contact: ''
        },
        theme: {
          color: '#16a34a'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment initialization error:', error);
      const message = error?.message || 'Error initializing payment';
      setError(message);
      onError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6"
    >
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-green-800 mb-6">
          Complete Registration Payment
        </h2>

        <div className="bg-green-50 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold text-green-800 mb-4">
            Registration Details
          </h3>
          <div className="space-y-2 text-gray-600">
            <p>- PGS-India Natural Farming Certification</p>
            <p>- One year validity</p>
            <p>- Access to training and support</p>
            <p>- Official government certification</p>
          </div>
          <div className="mt-6 text-center">
            <p className="text-2xl font-bold text-green-600">Rs. 300</p>
            <p className="text-sm text-gray-500">For Nature Farming Certificate & Support</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <button
          onClick={initializePayment}
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-md shadow-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
            ${isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700'
            }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Pay Rs. 300 Securely'
          )}
        </button>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Secured by Razorpay</p>
          <p className="mt-2">Your payment information is encrypted and secure</p>
        </div>
      </div>
    </motion.div>
  );
};

export default StepPayment;


