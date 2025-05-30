// src/components/Header.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState, useEffect, useContext } from "react";
import logo from "../assets/logo.png";
import { UserContext } from "../context/UserContext";
import Alert from "./Alert";
export default function Header({
  searchTerm,
  handleSearch,
  sortOrder,
  handleSort,
  handleCategorySelect,
  handleShowDeals,
  currentView,
  handleShowHome,
}) {
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success"); // or 'error'
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [authChanged, setAuthChanged] = useState(false);
  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const { user, setUser } = useContext(UserContext);

  // geting user data if logged in
  useEffect(() => {
    (async () => {
      axios
        .get(`/api/users/me`, {
          withCredentials: true,
        })
        .then((res) => setUser(res.data.document))
        .catch(() => {
          setUser(null);
        });
    })();
  }, [authChanged]);

  // ESC key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setShowSignInModal(false);
        setShowSignUpModal(false);
        setShowContactModal(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Sign out handler
  const handleSignOut = async () => {
    setUser(null);
    await axios.post(`/api/users/logout`, {
      withCredentials: true,
    });
    setAlertMessage("Signed out successfully");
    setAlertType("success");
  };

  const handleSignUpClick = () => {
    setShowSignUpModal(true);
  };

  const closeSignUpModal = () => {
    setShowSignUpModal(false);
  };

  const handleSignInClick = () => {
    setShowSignInModal(true);
  };

  const closeSignInModal = () => {
    setShowSignInModal(false);
  };

  // Handlers for input changes
  const handleSignInChange = (e) => {
    setSignInData({ ...signInData, [e.target.name]: e.target.value });
  };
  const handleSignUpChange = (e) => {
    setSignUpData({ ...signUpData, [e.target.name]: e.target.value });
  };

  // Dummy submit handlers
  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/api/users/login`, signInData, {
        withCredentials: true,
      });
      setAlertMessage(response.data.message);
      setAlertType("success");
      setUser(response.data.user);
      setAuthChanged(prev => !prev)
      closeSignInModal();
      if (response.data.user.role === "admin") navigate("/admin");
    } catch (error) {
      setAlertMessage(error.response?.data?.message || "An error occurred");
      setAlertType("error");
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/api/users/signup`, signUpData, {
        withCredentials: true,
      });

      setAlertMessage(response.data.message);
      setAlertType("success");
      setUser(response.data.user);
      setAuthChanged(prev => !prev)
      closeSignUpModal();
    } catch (error) {
      setAlertMessage(error.response?.data?.message || "An error occurred");
      setAlertType("error");
    }
  };

  const handleContactClick = () => {
    setShowContactModal(true);
  };

  const closeContactModal = () => {
    setShowContactModal(false);
  };
  const handleResetPasswordClick = async () => {
    if (!signInData.email) {
      setAlertMessage("please enter your Email.");
      setAlertType("error");
      return;
    }
    try {
      await axios.post(
        `/api/users/forgotPassword`,
        { email: signInData.email },
        { withCredentials: true }
      );
      setAlertMessage("Password reset email sent!");
      setAlertType("success");
    } catch (error) {
      setAlertMessage(error.response?.data.message || "Error happened! ");
      setAlertType("error");
    }
  };
  const location = useLocation();
  const isAdmin = user && user.role === "admin";
  const isHomePage = location.pathname === "/";

  return (
    <>
      {/* Alert */}
      <Alert
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertMessage("")}
      />
      <nav className="bg-white shadow-md">
        <div className="max-w-screen mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                to="/"
                onClick={handleShowHome}
                className="h-8 w-40 flex-shrink-0 flex items-center"
              >
                <img src={logo} />
              </Link>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <Link
                  to="/"
                  onClick={handleShowHome}
                  className={`${
                    currentView === "all"
                      ? "border-b-2 border-primary text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Home
                </Link>

                {isHomePage && (
                  <>
                    <div className="dropdown relative inline-block">
                      <button className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center  pt-1 border-b-2 text-sm font-medium">
                        Categories
                        <svg
                          className="ml-1 w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </button>
                      <div className="dropdown-menu absolute z-10 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1">
                        <button
                          onClick={() => handleCategorySelect("fashion")}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          Fashion
                        </button>
                        <button
                          onClick={() => handleCategorySelect("sports")}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          Sports
                        </button>
                        <button
                          onClick={() => handleCategorySelect("electronics")}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          Electronics
                        </button>
                        <button
                          onClick={() => handleCategorySelect("other")}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          Other
                        </button>
                        <button
                          onClick={() => handleCategorySelect("beauty")}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          Beauty
                        </button>
                        <button
                          onClick={() => handleCategorySelect("home")}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          Home
                        </button>
                        <button
                          onClick={() => handleCategorySelect("books")}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          Books
                        </button>
                      </div>
                    </div>
                    <button
                      className={`${
                        currentView === "featured"
                          ? "border-b-2 border-primary text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                      onClick={handleShowDeals}
                    >
                      Deals
                    </button>
                  </>
                )}

                <button
                  onClick={handleContactClick}
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Contact
                </button>
              </div>
              {isAdmin && (
                <div className="px-5">
                  <Link
                    to="/admin"
                    className={`${
                      location.pathname === "/admin"
                        ? "border-b-2 border-primary text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Dashboard
                  </Link>
                </div>
              )}
            </div>

            <div className="flex ml-2 items-center space-x-4">
              {isHomePage && (
                <>
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
                      className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </div>

                  <div className="relative">
                    <select
                      className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm appearance-none bg-white"
                      onChange={(e) => handleSort(e.target.value)}
                      value={sortOrder}
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
                </>
              )}

              {user ? (
                <div className="flex items-center space-x-3">
                  <Link to="/cart" className="relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="22"
                      fill="currentColor"
                      className="bi bi-cart3"
                      viewBox="0 0 16 16"
                    >
                      <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .49.598l-1 5a.5.5 0 0 1-.465.401l-9.397.472L4.415 11H13a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l.84 4.479 9.144-.459L13.89 4zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
                    </svg>

                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full px-1">
                      {user.cart.length}
                    </span>
                  </Link>
                  {/* user iamge*/}
                  <Link to="/me" className="relative">
                    <img
                      src={user.photo || "/default-avatar.png"}
                      alt="User"
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                  </Link>
                  <Link
                    to="/my-orders"
                    className="px-3 py-2 text-sm font-medium inline-flex align-items  text-gray-700 rounded-3xl bg-blue-300 hover:bg-blue-400 transition  "
                  >
                    my orders
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="px-3 py-2 text-sm font-medium inline-flex align-items  text-gray-700 "
                  >
                    Sign out
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-box-arrow-right ml-2 mt-0.5"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"
                      />
                      <path
                        fillRule="evenodd"
                        d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex md:items-center md:space-x-4">
                  <button
                    onClick={handleSignInClick}
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={handleSignUpClick}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none"
                  >
                    Sign up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      {/* Sign In Modal */}
      {showSignInModal && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={closeSignInModal}
          ></div>
          <div className="relative bg-white rounded-lg max-w-md w-full mx-4 modal-content">
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button
                type="button"
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={closeSignInModal}
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sign In
                </h3>
              </div>
              <form onSubmit={handleSignInSubmit} className="space-y-4 mt-4">
                <input
                  type="text"
                  name="email"
                  placeholder="Email"
                  value={signInData.email}
                  onChange={handleSignInChange}
                  className="w-full mb-2 mt-3 px-3 py-2 rounded bg-gray-100 text-gray-900 focus:outline-none"
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={signInData.password}
                  onChange={handleSignInChange}
                  className="w-full px-3 py-2 rounded bg-gray-100 text-gray-900 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className=" w-full py-2 bg-primary mt-3  text-white rounded  transition"
                >
                  Sign In
                </button>
              </form>
              <button
                className="w-full py-2 bg-primary mt-3  text-white rounded  transition"
                onClick={handleResetPasswordClick}
              >
                Forgot Password
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Sign Up Modal */}
      {showSignUpModal && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={closeSignUpModal}
          ></div>
          <div className="relative bg-white rounded-lg max-w-md w-full mx-4 modal-content">
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button
                type="button"
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={closeSignUpModal}
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sign Up
                </h3>
              </div>
              <form onSubmit={handleSignUpSubmit} className="space-y-4 mt-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Username"
                  value={signUpData.name}
                  onChange={handleSignUpChange}
                  className="w-full px-3 py-2 rounded mt-2 bg-gray-100 text-gray-900 focus:outline-none"
                  required
                />
                <input
                  type="text"
                  name="email"
                  placeholder="Email"
                  value={signUpData.email}
                  onChange={handleSignUpChange}
                  className="w-full px-3 py-2 rounded mt-2 bg-gray-100 text-gray-900 focus:outline-none"
                  required
                />

                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={signUpData.password}
                  onChange={handleSignUpChange}
                  className="w-full px-3 py-2 rounded mt-2 bg-gray-100 text-gray-900 focus:outline-none"
                  required
                />
                <input
                  type="password"
                  name="passwordConfirm"
                  placeholder="password Confirm"
                  value={signUpData.passwordConfirm}
                  onChange={handleSignUpChange}
                  className="w-full px-3 py-2 rounded mt-2 bg-gray-100 text-gray-900 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-primary mt-2 text-white rounded "
                >
                  Sign Up
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={closeContactModal}
          ></div>
          <div className="relative bg-white rounded-lg max-w-md w-full mx-4 modal-content">
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button
                type="button"
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={closeContactModal}
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary bg-opacity-10 mb-4">
                  <svg
                    className="h-6 w-6 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Contact Us
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  We're here to help! Reach out to us using the information
                  below.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-primary"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 text-sm">
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-gray-500">support@Aliest.com</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-primary"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 text-sm">
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-gray-500">+1 (555) 123-4567</p>
                    <p className="text-gray-500 text-xs mt-1">
                      Monday-Friday, 9am-5pm EST
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-primary"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 text-sm">
                    <p className="font-medium text-gray-900">Address</p>
                    <p className="text-gray-500">123 Commerce St, Suite 100</p>
                    <p className="text-gray-500">Tech City, TC 12345</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="rounded-md bg-blue-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-blue-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1 md:flex md:justify-between">
                      <p className="text-sm text-blue-700">
                        For fastest response, please include your order number
                        when contacting us.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:text-sm"
                  onClick={closeContactModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
