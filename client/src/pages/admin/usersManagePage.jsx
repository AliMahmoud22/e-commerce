import { useEffect, useState, useContext } from "react";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  PhotoIcon,
  MagnifyingGlassIcon,
  HandThumbUpIcon 
} from "@heroicons/react/24/outline";
import axios from "axios";
import Alert from "../../components/Alert";
import { UserContext } from "../../context/UserContext";

export default function UsersPage() {
  const { user } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [editData, setEditData] = useState({ name: "", email: "", role: "" });
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");

  // Add user modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addData, setAddData] = useState({
    name: "",
    email: "",
    role: "user",
    password: "",
    passwordConfirm: "",
  });
  const [addLoading, setAddLoading] = useState(false);
  const [photo, setPhoto] = useState("");
  // Fetch users (with optional email filter)
  const fetchUsers = async (email = "") => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `/api/users${email ? `?email=${email}` : ""}`,
        {
          withCredentials: true,
        }
      );
      setUsers(res.data.Data || res.data); 
      setIsLoading(false);
    } catch (error) {
      setAlertMessage(
        error.response?.data?.message ||
          "Error happened while getting users data!"
      );
      setAlertType("error");
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchUsers();
    }
  }, [user]);

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(searchEmail);
  };

  // Edit handlers
  const handleEditClick = (user) => {
    setEditingUserId(user._id || user.id);
    setEditData({ name: user.name, email: user.email, role: user.role });
  };
  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };
  const handleEditSave = async () => {
    axios
      .patch(`/api/users/${editingUserId}`, editData, {
        withCredentials: true,
      })
      .then(() => {
        setEditingUserId(null);
        fetchUsers(searchEmail);
        setAlertMessage("user is Updated.✅");
        setAlertType("success");
      })
      .catch((err) => {
        setAlertMessage(err.response?.data?.message || "updating failed!❌");
        setAlertType("fail");
      });
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`/api/users/${id}`, { withCredentials: true });
        fetchUsers(searchEmail);
      } catch (error) {
        setAlertMessage(error.response?.data?.message || "deleting failed!❌");
        setAlertType("error");
      }
    }
  };

  // Add user handlers
  const handleAddChange = (e) => {
    setAddData({ ...addData, [e.target.name]: e.target.value });
  };
  const handleImageChange = (e) => {
    setPhoto(e.target.files[0]);
  };
  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      const newUser = await axios.post("/api/users", addData, {
        withCredentials: true,
      });

      // 2. If a photo is selected, upload it using FormData
      if (photo) {
        const formData = new FormData();
        formData.append("photo", photo);

        await axios.patch(
          `/api/users/upload-photo/${newUser.data.document._id}`,
          formData,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      }

      setPhoto("");
      setShowAddModal(false);
      setAddData({
        name: "",
        email: "",
        role: "user",
        password: "",
        passwordConfirm: "",
      });
      fetchUsers(searchEmail);
      setAlertMessage("User added successfully.✅");
      setAlertType("success");
    } catch (error) {
      setAlertMessage(error.response?.data?.message || "Adding user failed!❌");
      setAlertType("error");
    }
    setAddLoading(false);
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="p-8 text-center text-red-600 text-lg font-semibold">
        Access denied. Admins only.
      </div>
    );
  }
  return (
    <>
      {/* Alert */}
      <Alert
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertMessage("")}
      />
      <div className="bg-white rounded-xl m shadow-md p-8">
        <div className="flex justify-between items-center mb-4">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              placeholder="Search by email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="border rounded px-3 py-2 mr-2"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 flex items-center"
            >
              <MagnifyingGlassIcon className="h-5 w-5 mr-1" />
              Search
            </button>
          </form>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Add User
          </button>
        </div>
        <table className="min-w-full  bg-white border rounded-lg">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-left">Email</th>
              <th className="py-2 px-4 border-b text-left">Role</th>
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
            ) : users && users.length > 0 ? (
              users
                .filter((user) => user.role !== "admin")
                .map((user) =>
                  editingUserId === (user._id || user.id) ? (
                    <tr key={user._id || user.id} className="bg-gray-50">
                      <td className="py-2 px-4 border-b">
                        <input
                          name="name"
                          value={editData.name}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1"
                        />
                      </td>
                      <td className="py-2 px-4 border-b">
                        <input
                          name="email"
                          value={editData.email}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1"
                        />
                      </td>
                      <td className="py-2 px-4 border-b">
                        <select
                          name="role"
                          value={editData.role}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-2 px-4 flex border-b">
                        <button
                          onClick={handleEditSave}
                          className="bg-green-600 rounded px-2 py-1 flex items-center text-white hover:bg-green-500"
                          type="button"
                        >
                          <HandThumbUpIcon className="h-4 w-4 mr-1" />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingUserId(null)}
                          className="bg-gray-600 rounded px-2 py-1 text-white flex items-center ml-2 hover:bg-gray-500"
                          type="button"
                        >
                          <XMarkIcon className="h-4 w-4 mr-1" />
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={user._id || user.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{user.name}</td>
                      <td className="py-2 px-4 border-b">{user.email}</td>
                      <td className="py-2 px-4 border-b">{user.role}</td>
                      <td className="py-2 px-4 border-b flex space-x-2">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="rounded flex items-center bg-blue-500 text-white px-2 py-1 mr-2 hover:bg-blue-400"
                          type="button"
                         
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user._id || user.id)}
                          className="rounded flex items-center bg-red-500 text-white px-2 py-1 mr-2 hover:bg-red-400"
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
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 ">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowAddModal(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-bold mb-4">Add New User</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={addData.name}
                onChange={handleAddChange}
                className="w-full border rounded px-3 py-2"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={addData.email}
                onChange={handleAddChange}
                className="w-full border rounded px-3 py-2"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={addData.password}
                onChange={handleAddChange}
                className="w-full border rounded px-3 py-2"
                required
              />
              <input
                type="password"
                name="passwordConfirm"
                placeholder="confirm Password"
                value={addData.passwordConfirm}
                onChange={handleAddChange}
                className="w-full border rounded px-3 py-2"
                required
              />
              <select
                name="role"
                value={addData.role}
                onChange={handleAddChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <div>
                <label
                  htmlFor="photo-upload"
                  className="flex items-center cursor-pointer w-full border rounded px-3 py-2 bg-gray-50 hover:bg-gray-100"
                >
                  <PhotoIcon className="h-6 w-6 text-gray-500 mr-2" />
                  <span className="text-gray-700">
                    {photo ? photo.name : "Upload Photo"}
                  </span>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    name="photo"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 rounded hover:bg-primary-200"
                disabled={addLoading}
              >
                {addLoading ? "Adding..." : "Add User"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
