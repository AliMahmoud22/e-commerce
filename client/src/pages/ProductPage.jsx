import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Alert from "../components/Alert";
import { UserContext } from "../context/UserContext";
export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const { user } = useContext(UserContext);

  // Check if user already reviewed
  const hasReviewed = user && reviews.some((r) => r.user?._id === user._id);

  //getting product info
  useEffect(() => {
    const getProduct = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`/api/products/${slug}`);
        setProduct(res.data.document);
        setReviews(res.data.document.reviews || []);
        setIsLoading(false);
      } catch (error) {
        setAlertMessage(
          error.response?.data?.message || "Something went wrong."
        );
        setAlertType("error");
      }
    };
    getProduct();
  }, [slug]);

  const handleImageClick = (img) => {
    setMainImage(img);
  };

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      await axios.post(`/api/cart/`, {
        quantity,
        product: product.id,
      });
      setAlertMessage(`Added to Cart`);
      setAlertType("success");
      setIsLoading(false);
    } catch (error) {
      setAlertMessage(error.response.data.message);
      setAlertType("error");
    }
  };

  // Add review handler
  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!userRating || !userComment) {
      setAlertMessage("Please provide a rating and comment.");
      setAlertType("error");
      return;
    }
    setSubmittingReview(true);
    try {
      await axios.post(
        `/api/reviews/${product.id}`,
        {
          rate: userRating,
          comment: userComment,
        },
        { withCredentials: true }
      );
      setAlertMessage("Review submitted!");
      setAlertType("success");

      // Refresh reviews
      const res = await axios.get(`/api/products/${slug}`);
      setProduct(res.data.document);
      setReviews(res.data.document.reviews || []);
      setUserRating(0);
      setUserComment("");
    } catch (error) {
      setAlertMessage(
        error.response?.data?.message || "Failed to submit review."
      );
      setAlertType("error");
    }
    setSubmittingReview(false);
  };

  return (
    <>
      <Header />
      <Alert
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertMessage("")}
      />
      <div className="max-w-4/5 mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center text-lg">Loading...</div>
        ) : product ? (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 px-9 flex flex-col md:flex-row gap-8">
              <div className="flex-shrink-0 flex flex-col items-center md:w-2/3">
                {/* Main Image */}
                <img
                  src={mainImage || product.imageCover}
                  alt={product.name}
                  className="w-full max-w-xs rounded object-cover mb-4 border-2 border-primary"
                  style={{ minHeight: 200, background: "#f3f3f3" }}
                />
                {/* Thumbnails */}
                <div className="flex gap-2">
                  {/* Show imageCover as first thumbnail */}
                  <img
                    src={product.imageCover}
                    alt="Main"
                    className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${
                      mainImage === product.imageCover
                        ? "border-primary"
                        : "border-gray-200"
                    }`}
                    onClick={() => handleImageClick(product.imageCover)}
                  />
                  {/* Show other images if available */}
                  {product.images &&
                    product.images.map(
                      (img, idx) =>
                        img && (
                          <img
                            key={idx}
                            src={img}
                            alt={`Product ${idx + 1}`}
                            className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${
                              mainImage === img
                                ? "border-primary"
                                : "border-gray-200"
                            }`}
                            onClick={() => handleImageClick(img)}
                          />
                        )
                    )}
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <p className="text-gray-600 mb-4">{product.description}</p>
                {/* Rating */}
                <div className="mb-4 flex items-center">
                  <span className="font-semibold mr-2">Rating:</span>
                  <span className="flex items-center">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${
                          i < product.ratingsAverage
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
                      </svg>
                    ))}
                    <span className="ml-4 pt-1 text-sm text-gray-500">
                      {product.ratingsCount
                        ? product.ratingsAverage.toFixed(1)
                        : "No rating"}
                    </span>
                  </span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Category: </span>
                  {product.category}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Brand: </span>
                  {product.brand}
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Price:</span>{" "}
                  <span className="text-primary font-bold text-xl">
                    ${product.price}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold">In Stock:</span>{" "}
                  {product.isInStock ? (
                    <span className="text-green-600">Yes</span>
                  ) : (
                    <span className="text-red-600">No</span>
                  )}
                </div>
                {/* Quantity Selector */}
                <div className="mb-4 flex items-center">
                  <span className="font-semibold mr-2">Quantity:</span>
                  <input
                    type="number"
                    min={1}
                    max={product.countInStock || 99}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-20 px-2 py-1 border rounded"
                    disabled={!product.isInStock}
                  />
                </div>
                <button
                  className="mt-6 px-6 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
                  disabled={product.isInStock === false || quantity < 1}
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </button>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-12 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Reviews</h2>
              {/* Add Review Form */}
              {user && !hasReviewed && (
                <form onSubmit={handleAddReview} className="mb-8">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="font-semibold">Your Rating:</span>
                    {Array.from({ length: 10 }).map((_, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setUserRating(i + 1)}
                        className="focus:outline-none"
                      >
                        <svg
                          className={`w-6 h-6 ${
                            i < userRating ? "text-yellow-400" : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  <textarea
                    className="w-full border rounded p-4 mb-2"
                    rows={3}
                    placeholder="Your comment"
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="bg-primary text-white px-4 py-2 rounded"
                    disabled={submittingReview}
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              )}
              {user && hasReviewed && (
                <div className="mb-6 text-green-700 font-semibold">
                  You have already reviewed this product.
                </div>
              )}
              {reviews.length === 0 ? (
                <div className="text-gray-500">No reviews yet.</div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review, idx) => (
                    <div key={idx} className="border-b pb-4">
                      <div className="flex items-center mb-1">
                        <span className="font-semibold text-primary mr-2">
                          {review.user?.name || "Anonymous"}
                        </span>
                        <span className="flex items-center">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < (review.rating || review.rate)
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
                            </svg>
                          ))}
                        </span>
                      </div>
                      <div className="text-gray-700 mt-2 pt-2">
                        {review.comment}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center text-red-600 text-lg">
            Product not found.
          </div>
        )}
      </div>
    </>
  );
}
