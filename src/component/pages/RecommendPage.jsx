import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ApiService from '../../service/ApiService';
import '../../style/recommend.css';

const RecommendPage = () => {
  const { cart, dispatch } = useCart();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState(null);

  const addToCart = (product) => {
    try {
      console.log('Adding to cart:', product);
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          id: product.id,
          name: product.name || 'Unknown Product',
          imageUrl: product.image || '/images/placeholder.jpg', // Use imageUrl to match CartPage.jsx
          price: (product.priceCents || 1000) / 100, // Convert priceCents to price
          deliveryOptionId: '1',
          quantity: 1, // Ensure quantity is set
          rating: product.rating || { stars: 0, count: 0 }, // Add rating with fallback
        },
      });
      navigate('/cart');
    } catch (err) {
      console.error('Error in addToCart:', err);
      setError('Failed to add item to cart: ' + err.message);
    }
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      console.log('Starting fetchRecommendations');
      console.log('Is authenticated:', ApiService.isAuthenticated());

      if (!ApiService.isAuthenticated()) {
        console.log('User not authenticated');
        setError('Please log in to view recommendations');
        setLoading(false);
        return;
      }

      try {
        // Fetch user info
        console.log('Fetching user info');
        const userResponse = await axios.get('http://localhost:5000/user/my-info', {
          headers: ApiService.getHeader(),
          timeout: 10000,
        });
        console.log('User info response:', userResponse.data);
        const user = userResponse.data.user;
        if (!user || !user.name) {
          console.log('No user name found');
          setError('User information not available');
          setLoading(false);
          return;
        }
        setUsername(user.name);

        // Fetch recommended product IDs
        console.log('Fetching recommendations for:', user.name);
        const response = await axios.get(
          `http://localhost:3001/api/recommendations/${encodeURIComponent(user.name)}`,
          { timeout: 15000 }
        );
        console.log('Recommendations response:', response.data);
        const productIds = response.data || [];

        if (!productIds || productIds.length === 0) {
          console.log('No product IDs returned');
          setError('No recommendations available');
          setLoading(false);
          return;
        }

        // Fetch products by IDs
        console.log('Fetching products for IDs:', productIds);
        const productResponse = await axios.post(
          'http://localhost:5000/api/products/by-ids',
          { ids: productIds },
          { headers: ApiService.getHeader(), timeout: 10000 }
        );
        console.log('Products response:', productResponse.data);
        setProducts(productResponse.data.result || []);
        setRecommendations(productIds);
        setLoading(false);
        console.log('Fetch completed, loading set to false');
      } catch (err) {
        console.error('Error fetching recommendations:', err.message, err.response?.data);
        setError('Failed to load recommendations: ' + err.message);
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  console.log('Current state - loading:', loading, 'error:', error, 'products:', products);

  if (loading) return <div className="loading">Loading recommendations...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="recommend-page">
      <h2>Recommended Products for {username || 'Guest'}</h2>
      {products.length === 0 ? (
        <p>No recommendations available</p>
      ) : (
        <div className="product-list">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <img
                src={product.image || product.imageUrl || '/images/placeholder.jpg'}
                alt={product.name || 'Product'}
                className="product-image"
              />
              <h3>{product.name || 'Unknown Product'}</h3>
              <p>{product.category || 'Uncategorized'}</p>
              <p>${((product.priceCents || 1000) / 100).toFixed(2)}</p>
              <button
                className="add-to-cart-btn"
                onClick={() => addToCart(product)}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendPage;