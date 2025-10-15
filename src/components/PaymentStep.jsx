import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';

export function PaymentStep({ onBack, onDone, formData }) {
  const [paymentError, setPaymentError] = useState(null);
  const [loading, setLoading] = useState(false);

  const initializePayment = async () => {
    try {
      setLoading(true);
      setPaymentError(null);
      const orderData = await api.createPaymentOrder(formData._id);

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Natural Farming Registration',
        description: 'Farmer Registration Fee',
        order_id: orderData.orderId,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        handler: async (response) => {
          try {
            await handlePaymentVerification(response);
          } catch (error) {
            console.error('Payment verification failed:', error);
            setPaymentError('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentError('Payment window was closed before completion.');
          }
        },
        theme: {
          color: '#16a34a'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment initialization error:', error);
      setPaymentError('Failed to initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentVerification = async (response) => {
    try {
      setLoading(true);
      await api.verifyPayment({
        ...response,
        farmerId: formData._id
      });
      onDone();
    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentError('Payment verification failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <motion.div
      className="p-8 flex flex-col items-center bg-white rounded-2xl shadow-md max-w-xl"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-semibold text-green-700 mb-6">
        Complete Registration Payment
      </h2>

      {paymentError && (
        <div className="w-full mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm">
          {paymentError}
        </div>
      )}

      <div className="w-full space-y-6">
        {/* Payment Details */}
        <div className="bg-gray-50 p-4 rounded-xl space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-gray-600">Registration, certification, and support fee</span>
            <span>Rs. 300</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Amount payable</span>
            <span>Rs. 300</span>
          </div>
        </div>

        {/* Payment Features */}
        <div className="grid grid-cols-2 gap-4 text-center text-sm">
          <div className="p-3 bg-gray-50 rounded-xl">
            <span className="block text-gray-600">Secure Payment</span>
            <span className="text-green-600">SSL Protected</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <span className="block text-gray-600">Support</span>
            <span className="text-green-600">24/7 Available</span>
          </div>
        </div>

        {/* Payment Button */}
        <button
          onClick={initializePayment}
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white font-medium ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {loading ? 'Processing...' : 'Pay Now - Rs. 300'}
        </button>

        <button
          onClick={onBack}
          disabled={loading}
          className="w-full py-2 text-gray-600 hover:text-gray-800"
        >
          Go Back
        </button>

        {/* Payment Methods */}
        <div className="text-center text-xs text-gray-500">
          <p>Accepted Payment Methods</p>
          <div className="flex justify-center gap-2 mt-2">
            <span>UPI</span>
            <span>|</span>
            <span>Cards</span>
            <span>|</span>
            <span>Net banking</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
