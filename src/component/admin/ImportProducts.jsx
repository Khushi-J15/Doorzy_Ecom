import React, { useState } from 'react';
  import ApiService from '../../service/ApiService';
  import { toast } from 'react-toastify';

  function ImportProducts() {
    const [status, setStatus] = useState('');
    const [error, setError] = useState(null);

    const importProducts = async () => {
      if (!ApiService.isAuthenticated()) {
        setError('Please log in as an admin to import products');
        toast.error('Please log in as an admin');
        return;
      }
      if (!ApiService.isAdmin()) {
        setError('Only admins can import products');
        toast.error('Only admins can import products');
        return;
      }

      setStatus('Importing products...');
      setError(null);

      try {
        // Fetch products.json from public folder
        const response = await fetch('http://localhost:5173/products.json');
        if (!response.ok) throw new Error('Failed to fetch products.json');
        const productsData = await response.json();

        for (const product of productsData) {
          const { name, description, price, categoryId, imageUrl } = product;

          // Fetch image as Blob if imageUrl is provided
          let image = null;
          if (imageUrl) {
            try {
              const imageResponse = await fetch(`http://localhost:5173${imageUrl}`);
              if (!imageResponse.ok) throw new Error(`Failed to fetch image: ${imageUrl}`);
              const blob = await imageResponse.blob();
              image = new File([blob], imageUrl.split('/').pop(), { type: blob.type });
            } catch (err) {
              console.warn(`Skipping image for ${name}: ${err.message}`);
              toast.warn(`Skipping image for ${name}`);
              image = null;
            }
          }

          const formData = new FormData();
          formData.append('categoryId', categoryId);
          formData.append('name', name);
          formData.append('description', description);
          formData.append('price', price);
          if (image) {
            formData.append('image', image);
          }

          try {
            await ApiService.addProduct(formData);
            console.log(`Imported product: ${name}`);
            toast.success(`Imported product: ${name}`);
          } catch (err) {
            console.warn(`Failed to import product ${name}: ${err.message}`);
            toast.warn(`Failed to import product ${name}`);
          }
        }
        setStatus('All products imported successfully!');
        toast.success('All products imported successfully!');
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
        setStatus('');
      }
    };

    return (
      <div>
        <h1>Import Products from JSON</h1>
        <button onClick={importProducts}>Import Products</button>
        {status && <p style={{ color: 'green' }}>{status}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    );
  }

  export default ImportProducts;