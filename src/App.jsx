import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, AdminRoute } from './service/Guard';
import Navbar from './component/common/Navbar';
import Footer from './component/common/footer';
import { CartProvider } from './component/context/CartContext';
import Home from './component/pages/Home';
import ProductDetailsPage from './component/pages/ProductDetailsPage';
import CategoryListPage from './component/pages/CategoryListPage';
import CategoryProductsPage from './component/pages/CategoryProductsPage';
import CartPage from './component/pages/CartPage';
import RegisterPage from './component/pages/RegisterPage';
import LoginPage from './component/pages/LoginPage';
import ProfilePage from './component/pages/ProfilePage';
import AddressPage from './component/pages/AddressPage';
import RecommendPage from './component/pages/RecommendPage';
import AdminPage from './component/admin/AdminPage';
import AdminCategoryPage from './component/admin/AdminCategoryPage';
import AddCategory from './component/admin/AddCategory';
import EditCategory from './component/admin/EditCategory';
import AdminProductPage from './component/admin/AdminProductPage';
import AddProductPage from './component/admin/AddProductPage';
import EditProductPage from './component/admin/EditProductPage';
import AdminOrdersPage from './component/admin/AdminOrderPage';
import ImportProducts from './component/admin/ImportProducts';


import { ToastContainer } from 'react-toastify';
import './style/ReactToastify.css';

function App() {

  return (
    <div className="App">
      <BrowserRouter>
    
      <CartProvider>
        <Navbar/>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
          <Routes>
            <Route exact path='/' element={<Home/>}/>
            <Route path='/product/:productId' element={<ProductDetailsPage/>}/>
            <Route path='/categories' element={<CategoryListPage/>}/>
            <Route path='/category/:categoryId' element={<CategoryProductsPage/>}/>
            <Route path='/cart' element={<CartPage/>}/>
            <Route path='/recommend' element={<RecommendPage/>}/>
            <Route path='/register' element={<RegisterPage/>}/>
            <Route path='/login' element={<LoginPage/>}/>
            <Route path='/profile' element={<ProtectedRoute element={<ProfilePage/>} />} />
            <Route path='/add-address' element={<ProtectedRoute element={<AddressPage/>} />} />
            <Route path='/edit-address' element={<ProtectedRoute element={<AddressPage/>} />} />

            <Route path='/admin' element={<AdminRoute element={<AdminPage/>} />} />
            
            <Route path='/admin/categories' element={<AdminRoute element={<AdminCategoryPage/>} />} />

            <Route path='/admin/add-category' element={<AdminRoute element={<AddCategory/>} />} />

            <Route path='/admin/edit-category/:categoryId' element={<AdminRoute element={<EditCategory/>} />} />

            <Route path='/admin/products' element={<AdminRoute element={<AdminProductPage/>} />} />
            <Route path='/admin/add-product' element={<AdminRoute element={<AddProductPage/>} />} />
            <Route path='/admin/edit-product/:productId' element={<AdminRoute element={<EditProductPage/>} />} />

            <Route path='/admin/orders' element={<AdminRoute element={<AdminOrdersPage/>} />} />
            <Route path='/admin/import-products' element={<AdminRoute element={<ImportProducts />} />} />

          </Routes>
        
        <Footer/>
      </CartProvider>
    
      </BrowserRouter>
    </div>
  );
}

export default App;
