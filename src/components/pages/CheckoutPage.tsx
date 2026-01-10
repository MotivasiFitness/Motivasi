import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useLanguage } from '@/i18n/LanguageContext';

interface CheckoutItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  quantity: number;
}

export default function CheckoutPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CheckoutItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    // Card details
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    // Billing address
    address: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',
    // Compliance
    termsAccepted: false,
  });

  useEffect(() => {
    // Load cart items from localStorage or session
    const storedItems = localStorage.getItem('checkoutItems');
    if (storedItems) {
      setCartItems(JSON.parse(storedItems));
    } else {
      // If no items, redirect back to store
      navigate('/store');
    }
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData(prev => ({
      ...prev,
      cardNumber: formatted
    }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setFormData(prev => ({
      ...prev,
      expiryDate: value
    }));
  };

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setFormData(prev => ({
      ...prev,
      cvv: value
    }));
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setPaymentError('Please fill in all personal details');
      return false;
    }

    if (!formData.cardName || !formData.cardNumber || !formData.expiryDate || !formData.cvv) {
      setPaymentError('Please fill in all card details');
      return false;
    }

    if (!formData.address || !formData.city || !formData.postcode) {
      setPaymentError('Please fill in all billing address details');
      return false;
    }

    if (!formData.termsAccepted) {
      setPaymentError('You must accept the Terms & Conditions to proceed');
      return false;
    }

    // Basic card validation
    const cardNum = formData.cardNumber.replace(/\s/g, '');
    if (cardNum.length < 13 || cardNum.length > 19) {
      setPaymentError('Invalid card number');
      return false;
    }

    if (formData.expiryDate.length !== 5) {
      setPaymentError('Invalid expiry date (MM/YY)');
      return false;
    }

    if (formData.cvv.length < 3 || formData.cvv.length > 4) {
      setPaymentError('Invalid CVV');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      // In production, this would integrate with Stripe, PayPal, or another payment processor
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful payment
      setPaymentSuccess(true);
      localStorage.removeItem('checkoutItems');

      // Redirect to success page after 3 seconds
      setTimeout(() => {
        navigate('/payment-success', {
          state: {
            items: cartItems,
            total: calculateTotal(),
            email: formData.email
          }
        });
      }, 3000);
    } catch (error) {
      setPaymentError('Payment processing failed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="bg-soft-white min-h-screen flex items-center justify-center px-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="font-heading text-4xl font-bold text-charcoal-black mb-4">
            Payment Successful!
          </h1>
          <p className="font-paragraph text-lg text-warm-grey mb-8">
            Your payment has been processed. Redirecting to confirmation...
          </p>
          <Loader className="w-6 h-6 animate-spin mx-auto text-soft-bronze" />
        </div>
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <div className="bg-soft-white min-h-screen">
      {/* Header */}
      <section className="py-12 px-8 lg:px-20 bg-warm-sand-beige border-b border-warm-sand-beige">
        <div className="max-w-[100rem] mx-auto">
          <Link
            to="/store"
            className="inline-flex items-center gap-2 text-soft-bronze font-paragraph text-base hover:underline mb-6"
          >
            <ArrowLeft size={20} />
            Back to Packages
          </Link>
          <h1 className="font-heading text-5xl font-bold text-charcoal-black">
            Secure Checkout
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-8 lg:px-20">
        <div className="max-w-[100rem] mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Error Message */}
                {paymentError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                    <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                    <p className="font-paragraph text-sm text-red-800">{paymentError}</p>
                  </div>
                )}

                {/* Personal Information */}
                <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
                  <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
                    Personal Information
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                        placeholder="Jane"
                      />
                    </div>
                    <div>
                      <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                        placeholder="Smith"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                        placeholder="jane@example.com"
                      />
                    </div>
                    <div>
                      <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                        placeholder="+44 (0) 7700 000 000"
                      />
                    </div>
                  </div>
                </div>

                {/* Billing Address */}
                <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
                  <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
                    Billing Address
                  </h2>
                  <div>
                    <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph mb-6"
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                        placeholder="London"
                      />
                    </div>
                    <div>
                      <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                        Postcode *
                      </label>
                      <input
                        type="text"
                        name="postcode"
                        value={formData.postcode}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                        placeholder="SW1A 1AA"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                      Country *
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                    >
                      <option>United Kingdom</option>
                      <option>United States</option>
                      <option>Canada</option>
                      <option>Australia</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                {/* Card Details */}
                <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
                  <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
                    Payment Details
                  </h2>
                  <div>
                    <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                      Cardholder Name *
                    </label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph mb-6"
                      placeholder="Jane Smith"
                    />
                  </div>
                  <div>
                    <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleCardNumberChange}
                      required
                      maxLength={19}
                      className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph mb-6 font-mono"
                      placeholder="4242 4242 4242 4242"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                        Expiry Date (MM/YY) *
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleExpiryChange}
                        required
                        maxLength={5}
                        className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph font-mono"
                        placeholder="12/25"
                      />
                    </div>
                    <div>
                      <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                        CVV *
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleCVVChange}
                        required
                        maxLength={4}
                        className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph font-mono"
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>

                {/* Terms & Conditions & Refund Notice */}
                <div className="space-y-6">
                  {/* Refund Notice */}
                  <div className="bg-soft-bronze/10 border border-soft-bronze/30 rounded-2xl p-6">
                    <p className="font-paragraph text-sm text-charcoal-black leading-relaxed">
                      <span className="font-bold">Important:</span> This is a digital training programme. You have a 7-day refund period provided the programme has not been accessed.
                    </p>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-start gap-3 p-4 bg-soft-white border border-warm-sand-beige rounded-lg">
                    <input
                      type="checkbox"
                      id="termsAccepted"
                      name="termsAccepted"
                      checked={formData.termsAccepted}
                      onChange={handleInputChange}
                      required
                      className="w-5 h-5 accent-soft-bronze mt-0.5 flex-shrink-0 cursor-pointer"
                    />
                    <label htmlFor="termsAccepted" className="font-paragraph text-sm text-charcoal-black cursor-pointer flex-1">
                      <span className="text-soft-bronze font-bold">*</span> I accept the <Link to="/terms" className="text-soft-bronze hover:underline">Terms & Conditions</Link> and have read the <Link to="/disclaimer" className="text-soft-bronze hover:underline">Disclaimer</Link>.
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-charcoal-black text-soft-white py-4 rounded-lg font-medium text-lg hover:bg-soft-bronze transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    `Pay £${total.toFixed(2)}`
                  )}
                </button>

                {/* Security Notice */}
                <div className="text-center">
                  <p className="font-paragraph text-sm text-warm-grey">
                    🔒 Your payment information is secure and encrypted
                  </p>
                </div>
              </form>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8 sticky top-8">
                <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
                  Order Summary
                </h2>

                {/* Items */}
                <div className="space-y-4 mb-6 pb-6 border-b border-warm-sand-beige">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div>
                        <p className="font-paragraph text-base text-charcoal-black">
                          {item.title}
                        </p>
                        <p className="font-paragraph text-sm text-warm-grey">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-paragraph font-medium text-charcoal-black">
                        {item.currency}{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <p className="font-paragraph text-base text-warm-grey">Subtotal</p>
                    <p className="font-paragraph text-base text-charcoal-black">
                      £{total.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="font-paragraph text-base text-warm-grey">Shipping</p>
                    <p className="font-paragraph text-base text-charcoal-black">Free</p>
                  </div>
                  <div className="border-t border-warm-sand-beige pt-3 flex justify-between">
                    <p className="font-heading text-lg font-bold text-charcoal-black">Total</p>
                    <p className="font-heading text-lg font-bold text-soft-bronze">
                      £{total.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Info */}
                <div className="mt-8 p-4 bg-warm-sand-beige/30 rounded-lg">
                  <p className="font-paragraph text-sm text-charcoal-black/70">
                    After payment, you'll receive a confirmation email with next steps to get started with your coaching package.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
