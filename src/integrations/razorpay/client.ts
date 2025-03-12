
// Load the Razorpay script dynamically
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Initialize payment with Razorpay
export const initializeRazorpayPayment = async ({
  amount,
  planName,
  currency = 'INR',
  name = 'QuillMaster',
  description,
  keyId,
  onSuccess,
  onError
}: {
  amount: number;
  planName: string;
  currency?: string;
  name?: string;
  description?: string;
  keyId: string;
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
}) => {
  const isLoaded = await loadRazorpayScript();
  
  if (!isLoaded) {
    onError(new Error('Razorpay SDK failed to load'));
    return;
  }
  
  // Razorpay expects amount in paise (1 INR = 100 paise)
  const amountInPaise = amount * 100;
  
  const options = {
    key: keyId,
    amount: amountInPaise.toString(),
    currency: currency,
    name: name,
    description: description || `Payment for ${planName} Plan`,
    handler: function(response: any) {
      onSuccess(response);
    },
    prefill: {
      name: '',
      email: '',
      contact: ''
    },
    theme: {
      color: '#6d28d9', // primary color
    },
    modal: {
      ondismiss: function() {
        console.log('Payment modal closed');
      }
    }
  };

  try {
    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
  } catch (err) {
    onError(err);
  }
};
