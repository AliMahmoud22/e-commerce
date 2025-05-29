import { useState, useEffect } from "react";
import axios from "axios";
import Alert from "../../components/Alert";
import {
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  HandThumbUpIcon,
} from "@heroicons/react/24/outline";
const ReviewsManagePage = () => {
  const [reviews, setReviews] = useState([]);
  const [searchTermUsername, setSearchTermUsername] = useState("");
  const [searchTermProductName, setSearchTermProductName] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingReview, setEditingReview] = useState({
    username: "",
    productName: "",
    rate: "",
    comment: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = async () => {
    let url = "/api/reviews";
    if (searchTermUsername && searchTermProductName)
      url += `/${searchTermProductName}/${searchTermUsername}`;
    try {
      setIsLoading(true);
      const res = await axios.get(url);
      
      setReviews(res.data.document ? res.data.document : res.data.Data);
    } catch (err) {
      setAlertMessage(err.response?.data?.message || "Failed to fetch reviews");
      setAlertType("error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchReviews();
  };
  const handleEditReview = (e) => {
    setEditingReview({ ...editingReview, [e.target.name]: e.target.value });
  };
  const handleEditReviewClick = (review) => {
    setEditingReviewId(review._id || review.id);
    setEditingReview({
      username: review.user.name,
      productName: review.product.name,
      rate: review.rate,
      comment: review.comment,
    });
  };

  const handleSaveReview = async () => {
    try {
      await axios.patch(
        `/api/reviews/${editingReview.productName}/${editingReview.username}`,
        editingReview
      );
      setAlertMessage("Review updated successfully");
      setAlertType("success");
      setEditingReviewId(null);
      fetchReviews();
    } catch (err) {
      setAlertMessage(err.response?.data?.message || "Failed to update review");
      setAlertType("error");
    }
  };

  const handleDeleteReview = async (productName, username) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await axios.delete(`/api/reviews/${productName}/${username}`);
        setAlertMessage("Review deleted successfully");
        setAlertType("success");
        fetchReviews();
      } catch (err) {
        setAlertMessage(
          err.response?.data?.message || "Failed to delete review"
        );
        setAlertType("error");
      }
    }
  };

  return (
    <>
      <Alert
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertMessage("")}
      />
      <div className="bg-white rounded-xl m shadow-md p-8">
        <div className="flex justify-between items-center mb-4">
          <form onSubmit={handleSearch} className="flex">
            <input
              className="border rounded px-3 py-2 mr-2"
              type="text"
              value={searchTermUsername}
              onChange={(e) => setSearchTermUsername(e.target.value)}
              placeholder="Search by Username"
            />
            <input
              className="border rounded px-3 py-2 mr-2"
              type="text"
              value={searchTermProductName}
              onChange={(e) => setSearchTermProductName(e.target.value)}
              placeholder="Search by Product Name"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 flex items-center"
            >
              {" "}
              <MagnifyingGlassIcon className="h-5 w-5 mr-1" />
              Search
            </button>
          </form>
        </div>
        <table className="min-w-full  bg-white border rounded-lg">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left">Username</th>
              <th className="py-2 px-4 border-b text-left">Product Name</th>
              <th className="py-2 px-4 border-b text-left">Rate</th>
              <th className="py-2 px-4 border-b text-left">Comment</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : reviews && reviews.length > 0 ? (
              reviews.map((review) =>
                editingReviewId === (review._id || review.id) ? (
                  <tr key={review._id || review.id} className="bg-gray-50">
                    <td className="py-2 px-4 border-b">{review.user.name}</td>
                    <td className="py-2 px-4 border-b">
                      {review.product.name}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <input
                        name="rate"
                        value={editingReview.rate}
                        onChange={handleEditReview}
                        className="border rounded px-2 py-1"
                      />
                    </td>
                    <td className="py-2 px-4 border-b">
                      <input
                        name="comment"
                        value={editingReview.comment}
                        onChange={handleEditReview}
                        className="border rounded px-2 py-1"
                      />
                    </td>
                    <td className="py-2 flex px-4 border-b">
                      <button
                        onClick={handleSaveReview}
                        className="rounded bg-green-600 text-white flex items-center px-2 py-1 mr-2 hover:bg-green-500"
                        type="button"
                      >
                        <HandThumbUpIcon className="h-4 w-4 mr-1" />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingReviewId(null)}
                        className="rounded bg-gray-600 text-white px-2 flex items-center py-1 hover:bg-gray-500"
                        type="button"
                      >
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        Cancel
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr
                    key={review._id || review.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="py-2 px-4 border-b">{review.user.name}</td>
                    <td className="py-2 px-4 border-b">
                      {review.product.name}
                    </td>
                    <td className="py-2 px-4 border-b">{review.rate}</td>
                    <td className="py-2 px-4 border-b">{review.comment}</td>
                    <td className="py-2 px-4 border-b flex space-x-2">
                      <button
                        onClick={() => handleEditReviewClick(review)}
                        className="rounded flex items-center bg-blue-500 text-white px-2 py-1 mr-2 hover:bg-blue-400"
                        type="button"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteReview(
                            review.product.name,
                            review.user.name
                          )
                        }
                        className="rounded bg-red-500 flex items-center text-white px-4 py-1 mr-2 hover:bg-red-400"
                        type="button"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              )
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  No reviews found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ReviewsManagePage;
