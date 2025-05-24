import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
export default function HomePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSortOrder] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [currentView, setCurrentView] = useState('all'); // 'all', 'featured', 'category'

  useEffect(() => {
    const fetchProducts = async () => {
      let url = `${import.meta.env.VITE_BACKEND_URL}/api/products`;
      const params = [];
      if (activeCategory) params.push(`category=${activeCategory}`);
      if (sort !== '') params.push(`sort=${sort}`);
      if (search) params.push(`name=${search}`);
      if (showFeaturedOnly) params.push(`isFeatured=${showFeaturedOnly}`);
      if (params.length) url += '?' + params.join('&');
      setIsLoading(true);
      try {
        const res = await axios.get(url);
        setProducts(res.data.Data);
        setFilteredProducts(res.data.Data);
      } catch (e) {
        console.log(`error happened ${e}`);
      }
      setIsLoading(false);
    };
    fetchProducts();
  }, [activeCategory, sort, search, showFeaturedOnly]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleSort = (order) => {
    setSortOrder(order);
  };

  const navigateToProductDetails = (productSlug) => {
    navigate(`/product/${productSlug}`);
  };

  const handleCategorySelect = (category) => {
    setActiveCategory(category);
    setShowFeaturedOnly(false);
    setCurrentView('category');
  };

  const handleShowDeals = () => {
    setShowFeaturedOnly(true);
    setActiveCategory(null);
    setCurrentView('featured');
  };

  const handleShowHome = () => {
    setActiveCategory(null);
    setShowFeaturedOnly(false);
    setCurrentView('all');
  };

  // Get featured products for the featured section
  const featuredProducts = products.filter((product) => product.isFeatured);
  // Get title for the current view
  const getViewTitle = () => {
    if (currentView === 'featured') return 'Deals & Featured Products';
    if (currentView === 'category')
      return `${
        activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)
      } Products`;
    return 'All Products';
  };

  return (
    <div>
      {/* Navbar */}
      <Header
        searchTerm={search}
        handleSearch={handleSearch}
        sortOrder={sort}
        handleSort={handleSort}
        handleCategorySelect={handleCategorySelect}
        handleShowDeals={handleShowDeals}
        currentView={currentView}
        handleShowHome={handleShowHome}
      />
      <div className="min-h-screen flex flex-col">
        {/* Main Content */}
        <main className="flex-grow">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-primary to-accent text-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                  Shop the Latest Tech
                </h1>
                <p className="mt-6 max-w-2xl mx-auto text-xl">
                  Discover amazing products at competitive prices.
                </p>
                <div className="mt-10 flex justify-center">
                  <button
                    onClick={handleShowHome}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Products Section - Only show on homepage */}
          {currentView === 'all' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Featured Products
              </h2>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : featuredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {featuredProducts.map((product) => (
                    <div
                      key={product.slug}
                      className="product-card bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer"
                      onClick={() => navigateToProductDetails(product.slug)}
                    >
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={product.imageCover}
                          alt={product.name}
                          className="product-image w-full h-full object-cover transition-transform duration-300"
                        />
                        <div className="product-overlay absolute inset-0 bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 flex flex-col justify-center items-center p-4 text-white">
                          <h3 className="text-xl font-semibold mb-2">
                            {product.name}
                          </h3>
                          <p className="text-sm text-center">
                            {product.description}
                          </p>
                          <button className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {product.name}
                        </h3>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xl font-bold text-primary">
                            ${product.price.toFixed(2)}
                          </span>
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Featured
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    No featured products found.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* All/Filtered Products Section */}
          <div className="bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">
                  {getViewTitle()}
                </h2>

                {/* Filter Controls - Mobile Responsive */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      placeholder="Filter products..."
                      value={search}
                      onChange={handleSearch}
                    />
                  </div>

                  <div className="relative">
                    <select
                      className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 appearance-none bg-white"
                      onChange={(e) => handleSort(e.target.value)}
                      value={sort}
                    >
                      <option value="">Sort by</option>
                      <option value="price">Price: Low to High</option>
                      <option value="-price">Price: High to Low</option>
                      <option value="name">Name: A-Z</option>
                      <option value="-name">Name: Z-A</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.slug}
                      className="product-card bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer"
                      onClick={() => navigateToProductDetails(product.slug)}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={product.imageCover}
                          alt={product.name}
                          className="product-image w-full h-full object-cover transition-transform duration-300"
                        />
                        <div className="product-overlay absolute inset-0 bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 flex flex-col justify-center items-center p-4 text-white">
                          <p className="text-sm text-center">
                            {product.description}
                          </p>
                          <button className="mt-3 px-3 py-1 bg-white text-primary rounded hover:bg-gray-100 transition-colors text-sm">
                            Quick View
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-md font-semibold font-sans text-gray-900">
                          {product.name}
                        </h3>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-lg font-bold text-primary">
                            {product.price.toFixed(2)} EGP
                          </span>
                          <div className="flex items-center space-x-2">
                            {product.isFeatured && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Deal
                              </span>
                            )}
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {product.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    No products found
                  </h3>
                  <p className="mt-1 text-gray-500">
                    Try adjusting your search or filter to find what you're
                    looking for.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => {
                        setSearch('');
                        setSortOrder('');
                        handleShowHome();
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Clear filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-dark text-white">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Aliest</h3>
                <p className="text-gray-300 text-sm">
                  Your one-stop shop for all your tech needs.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Shop</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>
                    <button
                      onClick={handleShowHome}
                      className="hover:text-white"
                    >
                      All Products
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleShowDeals}
                      className="hover:text-white"
                    >
                      Featured
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleCategorySelect('electronics')}
                      className="hover:text-white"
                    >
                      Electronics
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleCategorySelect('fashion')}
                      className="hover:text-white"
                    >
                      Fashion
                    </button>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Stay Connected</h3>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-300 hover:text-white">
                    <span className="sr-only">Facebook</span>
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                  <a href="#" className="text-gray-300 hover:text-white">
                    <span className="sr-only">Instagram</span>
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                  <a href="#" className="text-gray-300 hover:text-white">
                    <span className="sr-only">Twitter</span>
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2">
                    Subscribe to our newsletter
                  </h4>
                  <div className="flex">
                    <input
                      type="email"
                      placeholder="Your email"
                      className="px-3 py-2 text-gray-900 rounded-l-md w-full"
                    />
                    <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-r-md">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-700">
              <p className="text-gray-300 text-sm text-center">
                © 2023 Aliest. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
