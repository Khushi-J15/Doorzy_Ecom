import { useEffect, useState} from "react";
import { useLocation } from "react-router-dom";
import '../../../styles/home.css';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import '../../style/ReactToastify.css';


function Home() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { dispatch } = useCart();
  const location = useLocation();
  const BASE_URL = import.meta.env.VITE_API_URL || "https://doorzy-ecom-1.onrender.com";  
  useEffect(() => {
    setLoading(true);
    fetch(`${BASE_URL}/api/products`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get("search")?.toLowerCase() || "";
    if (searchQuery) {
      const filtered = products.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchQuery) ||
          product.description?.toLowerCase().includes(searchQuery)
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [location.search, products]);

  const addToCart = (product) => {
    try {
      const cartItem = {
        id: product.id,
        name: product.name || "Unknown Product",
        imageUrl: product.image || "/images/placeholder.jpg",
        price: (product.priceCents || 1000) / 100,
        description: product.description || "No description available",
        rating: product.rating || { stars: 0, count: 0 },
        quantity: 1,
        deliveryOptionId: "1",
      };
      console.log("Adding to cart:", cartItem);
      dispatch({ type: "ADD_ITEM", payload: cartItem });
      toast.success(`${product.name} added to cart!`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      console.error("Error in addToCart:", err);
      toast.error("Failed to add item to cart", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  if (loading) {
    return <div className="main">Loading...</div>;
  }

  if (error) {
    return <div className="main">Error: {error}</div>;
  }

  return (
    <div className="main">
      <div className="products-grid">
        {filteredProducts.map((product) => {
          const searchQuery = new URLSearchParams(location.search).get("search")?.toLowerCase();
          const isHighlighted =
            searchQuery &&
            (product.name?.toLowerCase().includes(searchQuery) ||
              product.description?.toLowerCase().includes(searchQuery));
          return (
            <div
              className={`product-container ${isHighlighted ? "highlight" : ""}`}
              key={product.id}
            >
              <div className="product-image-container">
                <img
                  src={product.image || "/images/placeholder.jpg"}
                  alt={product.name || "Product"}
                  className="product-imagee"
                />
              </div>
              <div className="product-name">{product.name}</div>
              <div className="product-rating-container">
                <div className="product-rating-stars">⭐ {product.rating?.stars ?? 0}</div>
                <div className="product-rating-count">({product.rating?.count ?? 0})</div>
              </div>
              <div className="product-price">
                ₹{(product.priceCents / 100).toFixed(2)}
              </div>
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
          );
        })}
      </div>
    </div>
  );
}

export default Home;