import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import products from "../../../products.json";
import '../../style/categoryListPage.css';

const CategoryListPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    try {
      setLoading(true);
      setError(null);
      // Extract unique categories from products.json
      const uniqueCategories = [...new Set(products.map(product => product.category))]
        .map((name, index) => ({
          id: index + 1, // Generate IDs starting from 1
          name
        }));
      console.log("Parsed categories:", uniqueCategories); // Debug log
      setCategories(uniqueCategories);
      setLoading(false);
    } catch (err) {
      console.error("Error processing categories:", err);
      setError(err.message || 'Unable to process categories');
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
  };

  return (
    <div className="category-list">
      {loading ? (
        <p className="loading-message">Loading categories...</p>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchCategories} className="retry-button">Retry</button>
        </div>
      ) : categories.length === 0 ? (
        <div className="empty-message">
          <p>No categories available.</p>
          <button onClick={fetchCategories} className="retry-button">Refresh</button>
        </div>
      ) : (
        <div>
          <h2 className="Category-txt">Categories</h2>
          <ul>
            {categories.map((category) => (
              <li key={category.id}>
                <button onClick={() => handleCategoryClick(category.id)}>
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CategoryListPage;