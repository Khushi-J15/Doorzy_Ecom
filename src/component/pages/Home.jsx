import { useEffect, useState } from "react";
import '../../../styles/home.css';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import '../../style/ReactToastify.css';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { dispatch } = useCart();

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5000/api/products")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="main">Loading...</div>;
  }

  if (error) {
    return <div className="main">Error: {error}</div>;
  }

  return (
    <div className="main">
      <div className="products-grid">
        {products.map((product) => (
          <div className="product-container" key={product.id}>
            <div className="product-image-container">
              <img
                src={`/${product.image}`}
                alt={product.name}
                className="product-imagee"
              />
            </div>
            <div className="product-name">{product.name}</div>
            <div className="product-rating-container">
              <div className="product-rating-stars">⭐ {product.rating.stars}</div>
              <div className="product-rating-count">({product.rating.count})</div>
            </div>
            <div className="product-price">₹{(product.priceCents / 100).toFixed(2)}</div>
            <button
              className="add-to-cart-button"
              onClick={() => {
                dispatch({ type: "ADD_ITEM", payload: product });
                toast.success(`${product.name} added to cart!`, {
                  position: 'top-right',
                  autoClose: 3000,
                });
              }}
            >
              Add To Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;