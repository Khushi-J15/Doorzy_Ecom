import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import ApiService from '../../service/ApiService';
import { useCart } from '../context/CartContext';
import '../../style/cart.css';
import { toast } from 'react-toastify';


const stripePromise = loadStripe('pk_test_your_stripe_publishable_key');

const CheckoutForm = ({ totalPrice, orderId, setMessage, clearCart }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const handlePayment = async () => {
    toast.success('Success:Order Placed!', {
              position: 'top-right',
              autoClose: 3000,
      });
    if (!stripe || !elements) return;
    setPaymentProcessing(true);
    try {
      const { clientSecret } = await ApiService.createOrder({ totalPrice, orderId });
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });
      
      if (result.error) {
        // setMessage(result.error.message);
        await ApiService.confirmPayment({ orderId, paymentIntentId: result.paymentIntent?.id });
        setTimeout(() => setMessage(''), 3000);
      } else if (result.paymentIntent.status === 'succeeded') {
        await ApiService.confirmPayment({ orderId, paymentIntentId: result.paymentIntent.id });
        setMessage('Payment successful! Order placed.');
        clearCart();
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || 'Payment failed');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setPaymentProcessing(false);
    }
  };

  return (
    <div className="payment-form">
      <CardElement />
      <button
        className="pay-button"
        onClick={handlePayment}
        disabled={paymentProcessing || !stripe}
      >
        {paymentProcessing ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  );
};

const CartPage = () => {
  const { cart, dispatch } = useCart();
  const [message, setMessage] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const navigate = useNavigate();

  const incrementItem = (product) => {
    dispatch({ type: 'INCREMENT_ITEM', payload: product });
  };

  const decrementItem = (product) => {
    const cartItem = cart.find((item) => item.id === product.id);
    if (cartItem.quantity > 1) {
      dispatch({ type: 'DECREMENT_ITEM', payload: product });
    } else {
      dispatch({ type: 'REMOVE_ITEM', payload: product });
    }
  };

  const updateDeliveryOption = (productId, deliveryOptionId) => {
    dispatch({ type: 'UPDATE_DELIVERY_OPTION', payload: { productId, deliveryOptionId } });
  };

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!ApiService.isAuthenticated()) {
      setMessage('You need to login first before you can place an order');
      setTimeout(() => {
        setMessage('');
        navigate('/login');
      }, 3000);
      return;
    }
    if (!cart.length) {
      setMessage('Cart is empty');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    setIsCheckingOut(true);
    const orderItems = cart.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      deliveryOptionId: item.deliveryOptionId || '1',
    }));

    const orderRequest = {
      totalPrice,
      items: orderItems,
    };

    try {
      const response = await ApiService.createOrder(orderRequest);
      setMessage(response.message);
      return response;
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || 'Failed to place order');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsCheckingOut(false);
    }
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

  fetch('http://localhost:5000/send-cart-to-java', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cart),
  })
    .then(res => res.json())
    .then(data => console.log("Java backend response:", data))
    .catch(err => console.error("Error:", err));
  };

  return (
    <div className="cart-page">
      <h1>Shopping Cart</h1>
      {message && <p className="response-message">{message}</p>}
      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div>
          <ul className="cart-items">
            {cart.map((item) => (
              <li key={item.id} className="cart-item">
                <img
                  src={item.imageUrl || '/images/placeholder.jpg'}
                  alt={item.name || 'Product'}
                  className="cart-item-image"
                />
                <div className="cart-item-details">
                  <h2 className="item-name">{item.name || 'Unknown Product'}</h2>
                  <p>{item.description}</p>
                  <p>
                    Rating: {item.rating?.stars ?? 0} stars ({item.rating?.count ?? 0} reviews)
                  </p>
                  <div className="quantity-controls">
                    <button onClick={() => decrementItem(item)} disabled={isCheckingOut}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => incrementItem(item)} disabled={isCheckingOut}>
                      +
                    </button>
                  </div>
                  <select
                    value={item.deliveryOptionId || '1'}
                    onChange={(e) => updateDeliveryOption(item.id, e.target.value)}
                    disabled={isCheckingOut}
                  >
                    <option value="1">Standard (3-5 days)</option>
                    <option value="2">Express (1-2 days)</option>
                    <option value="3">Overnight</option>
                  </select>
                  <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </li>
            ))}
          </ul>
          <h2>Total: ${totalPrice.toFixed(2)}</h2>
          <Elements stripe={stripePromise}>
            <CheckoutForm
              totalPrice={totalPrice}
              orderId={cart.length > 0 ? 'pending' : ''}
              setMessage={setMessage}
              clearCart={() => dispatch({ type: 'CLEAR_CART' })}
            />
          </Elements>
        </div>
      )}
    </div>
  );
};

export default CartPage;