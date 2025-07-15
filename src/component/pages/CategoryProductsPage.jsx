import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import products from "../../../products.json";
import ProductList from "../common/ProductList";
import Pagination from "../common/Pagination";
import '../../style/home.css';

const CategoryProductsPage = () => {
  const { categoryId } = useParams();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 8;

  // Map category IDs to names
  const categoryMap = [...new Set(products.map(product => product.category))]
    .reduce((map, name, index) => ({
      ...map,
      [index + 1]: name
    }), {});

  useEffect(() => {
    fetchProducts();
  }, [categoryId, currentPage]);

  const fetchProducts = () => {
    try {
      setLoading(true);
      setError(null);
      const categoryName = categoryMap[categoryId];
      if (!categoryName) {
        throw new Error('Invalid category ID');
      }
      // Filter products by category
      const matchedProducts = products.filter(product => product.category === categoryName);
      console.log(`Products for category ${categoryName}:`, matchedProducts); // Debug log
      setTotalPages(Math.ceil(matchedProducts.length / itemsPerPage));
      setFilteredProducts(
        matchedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
      );
      setLoading(false);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message || 'Unable to fetch products');
      setLoading(false);
    }
  };

  return (
    <div className="category-products-page">
      {loading ? (
        <p className="loading-message">Loading products...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : filteredProducts.length === 0 ? (
        <p className="empty-message">No products found in this category.</p>
      ) : (
        <div>
          <h1>{categoryMap[categoryId] || 'Products'}</h1>
          <ProductList products={filteredProducts} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
    </div>
  );
};

export default CategoryProductsPage;