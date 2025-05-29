import  { useEffect, useState, useContext } from "react";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  PhotoIcon,
  HandThumbUpIcon
} from "@heroicons/react/24/outline";
import axios from "axios";
import Alert from "../../components/Alert";
import { UserContext } from "../../context/UserContext";

export default function ProductsManagePage() {
  const { user } = useContext(UserContext);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [editingProduct, setEditingProduct] = useState({});
  const [addData, setAddData] = useState({
    name: "",
    price: "",
    stock: "",
    isFeatured: false,
    discount: "",
    imageCover: null,
    images: [],
    brand: "",
    description: "",
    category: "",
  });
  const [editData, setEditData] = useState({
    name: "",
    price: "",
    stock: "",
    isFeatured: false,
    discount: "",
    imageCover: null,
    images: [],
    brand: "",
    description: "",
    category: "",
  });
  const [addLoading, setAddLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");

  // Add product modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addImageCover, setAddImageCover] = useState(null);
  const [addImages, setAddImages] = useState([]);
  const [editImageCover, setEditImageCover] = useState(null);
  const [editImages, setEditImages] = useState([]);

  // Fetch products (with optional name filter)
  const fetchProducts = async (name = "") => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `/api/products${name ? `?name=${name}` : ""}`,
        { withCredentials: true }
      );

      setProducts(res.data.Data);
      setIsLoading(false);
    } catch (error) {
      setAlertMessage(
        error.response?.data?.message ||
          "Error happened while getting products data!"
      );
      setAlertType("error");
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchProducts();
    }
  }, [user]);

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(searchName);
  };

  // Add product handlers
  const handleAddChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddData({
      ...addData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAddImageCover = (e) => {
    setAddImageCover(e.target.files[0]);
  };
  const handleAddImages = (e) => {
    setAddImages([...e.target.files]);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      // 1. Create product (without images)
      const res = await axios.post(
        "/api/products",
        {
          name: addData.name,
          price: addData.price,
          stock: addData.stock,
          isFeatured: addData.isFeatured,
          discount: addData.discount,
          brand: addData.brand,
          description: addData.description,
          category: addData.category,
        },
        { withCredentials: true }
      );
      const productId = res.data.document?._id;
      // 2. Upload imageCover and images if provided
      if (addImageCover || addImages.length > 0) {
       
        const formData = new FormData();
        if (addImageCover) formData.append("imageCover", addImageCover);
        if (addImages.length > 0) {
          addImages.forEach((img) => formData.append("images", img));
        }

        await axios.patch(
          `/api/products/upload-product-photos/${productId}`,
          formData,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      }

      setShowAddModal(false);
      setAddData({
        name: "",
        price: "",
        stock: "",
        isFeatured: false,
        discount: "",
        brand: "",
        description: "",
        category: "",
        imageCover: null,
        images: [],
      });
      setAddImageCover(null);
      setAddImages([]);
      fetchProducts(searchName);
      setAlertMessage("Product added successfully.✅");
      setAlertType("success");
    } catch (error) {
      setAlertMessage(
        error.response?.data?.message || "Failed to add product."
      );
      setAlertType("error");
    }
    setAddLoading(false);
  };

  // Edit handlers
  const handleEditClick = (product) => {
    setEditingProduct({ slug: product.slug, id: product._id || product.id });
    setEditData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      isFeatured: product.isFeatured,
      discount: product.discount ? product.discount : "",
      brand: product.brand || "",
      description: product.description || "",
      category: product.category || "",
      imageCover: null,
      images: [],
    });
    setEditImageCover(null);
    setEditImages([]);
  };
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData({
      ...editData,
      [name]: type === "checkbox" ? checked : value,
    });
  };
  const handleEditImageCover = (e) => {
    setEditImageCover(e.target.files[0]);
  };
  const handleEditImages = (e) => {
    setEditImages([...e.target.files]);
  };

  const handleEditSave = async () => {
    try {
      // 1. Update product fields
      await axios.patch(
        `/api/products/${editingProduct.slug}`,
        {
          name: editData.name,
          price: editData.price,
          stock: editData.stock,
          isFeatured: editData.isFeatured,
          discount: editData.discount,
          brand: editData.brand,
          description: editData.description,
          category: editData.category,
        },
        { withCredentials: true }
      );
      // 2. Upload images if changed
      if (editImageCover || editImages.length > 0) {
        const formData = new FormData();
        if (editImageCover) formData.append("imageCover", editImageCover);
        if (editImages.length > 0) {
          editImages.forEach((img) => formData.append("images", img));
        }
        await axios.patch(
          `/api/products/upload-product-photos/${editingProduct.id}`,
          formData,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      }
      setEditingProduct({});
      fetchProducts(searchName);
      setAlertMessage("Product is updated.✅");
      setAlertType("success");
    } catch (err) {
      setAlertMessage(err.response?.data?.message || "Updating failed!❌");
      setAlertType("fail");
    }
  };

  // Delete handler
  const handleDelete = async (slug) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`/api/products/${slug}`, { withCredentials: true });
        fetchProducts(searchName);
      } catch (error) {
        setAlertMessage(error.response?.data?.message || "Deleting failed!❌");
        setAlertType("error");
      }
    }
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
      <Alert
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertMessage("")}
      />
      <div className="bg-white rounded-xl shadow-md p-8 min-w-fit">
        <div className="flex justify-between items-center mb-4">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              placeholder="Search by name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="border rounded px-3 py-2 mr-2"
            />
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-200"
            >
              Search
            </button>
          </form>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Add Product
          </button>
        </div>
        <table className=" min-w-full bg-white border rounded-lg">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-left">Price</th>
              <th className="py-2 px-4 border-b text-left">Stock</th>
              <th className="py-2 px-4 border-b text-left">Featured</th>
              <th className="py-2 px-4 border-b text-left">Discount</th>
              <th className="py-2 px-4 border-b text-left">Description</th>
              <th className="py-2 px-4 border-b text-left">Brand</th>
              <th className="py-2 px-4 border-b text-left">Category</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : products && products.length > 0 ? (
              products.map((product) =>
                editingProduct.slug === product.slug ? (
                  <tr key={product.slug} className="bg-gray-50">
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
                        name="price"
                        value={editData.price}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1"
                      />
                    </td>
                    <td className="py-2 px-4 border-b">
                      <input
                        name="stock"
                        value={editData.stock}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1"
                      />
                    </td>
                    <td className="py-2 px-4 border-b">
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={editData.isFeatured}
                        onChange={handleEditChange}
                        className="h-5 w-5"
                      />
                    </td>
                    <td className="py-2 px-4 border-b">
                      <input
                        name="discount"
                        value={editData.discount}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1"
                      />
                    </td>
                    <td className="py-2 px-4 border-b">
                      <input
                        name="description"
                        value={editData.description.slice(0, 25) + "..."}
                        // value={editData.description}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1"
                      />
                    </td>
                    <td className="py-2 px-4 border-b">
                      <input
                        name="brand"
                        value={editData.brand}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1"
                      />
                    </td>
                    <td className="py-2 px-4 border-b">
                      <select
                        name="category"
                        value={editData.category}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1"
                      >
                        <option value="other">Other</option>
                        <option value="sports">Sports</option>
                        <option value="beauty">Beauty</option>
                        <option value="home">Home</option>
                        <option value="books">Books</option>
                        <option value="fashion">Fashion</option>
                        <option value="electronics">Electronics</option>
                      </select>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <label className="flex items-center cursor-pointer mb-2">
                        <PhotoIcon className="h-5 w-5 text-gray-500 mr-2" />
                        <span className="text-gray-700">
                          {editImageCover ? editImageCover.name : "Image Cover"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditImageCover}
                          className="hidden"
                        />
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <PhotoIcon className="h-5 w-5 text-gray-500 mr-2" />
                        <span className="text-gray-700">
                          {editImages.length > 0
                            ? `${editImages.length} Images`
                            : "Images"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleEditImages}
                          className="hidden"
                        />
                      </label>
                      <div className="flex mt-2">
                        <button
                          onClick={handleEditSave}
                          className="text-white bg-green-600 hover:bg-green-500 px-2 py-1 rounded flex items-center mr-2"
                          type="button"
                        >
                          <HandThumbUpIcon className="h-4 w-4 mr-1" />  
                          Save
                        </button>
                        <button
                          onClick={() => setEditingProduct({})}
                          className="text-white bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded flex items-center"
                          type="button"
                        >
                          <XMarkIcon className="h-4 w-4 mr-1" />
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={product.slug} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{product.name}</td>
                    <td className="py-2 px-4 border-b">{product.price}</td>
                    <td className="py-2 px-4 border-b">{product.stock}</td>
                    <td className="py-2 px-4 border-b">
                      {product.isFeatured ? "Yes" : "No"}
                    </td>
                    <td className="py-2 px-4 border-b">{product.discount}</td>
                    <td className="py-2 px-4 border-b">
                      {product.description}
                    </td>
                    <td className="py-2 px-4 border-b">{product.brand}</td>
                    <td className="py-2 px-4 border-b">{product.category}</td>
                    <td className="py-2 px-4 border-b flex space-x-2">
                      <button
                        onClick={() => handleEditClick(product)}
                        className="bg-blue-500 hover:bg-blue-400 px-2 py-1 rounded text-white flex items-center"
                        type="button"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.slug)}
                        className="text-white bg-red-500 hover:bg-red-400 px-2 py-1 rounded flex items-center"
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
                <td colSpan={6} className="text-center py-4">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 ">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowAddModal(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-bold mb-4">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
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
                type="text"
                name="price"
                placeholder="Price"
                value={addData.price}
                onChange={handleAddChange}
                className="w-full border rounded px-3 py-2"
                required
              />
              <input
                type="text"
                name="stock"
                placeholder="Stock"
                value={addData.stock}
                onChange={handleAddChange}
                className="w-full border rounded px-3 py-2"
                required
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={addData.isFeatured}
                  onChange={handleAddChange}
                  className="h-5 w-5 mr-2"
                />
                <label htmlFor="isFeatured" className="text-gray-700">
                  Featured
                </label>
              </div>
              <input
                type="text"
                name="discount"
                placeholder="Discount"
                value={addData.discount}
                onChange={handleAddChange}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="text"
                name="brand"
                value={addData.brand}
                onChange={handleAddChange}
                placeholder="Brand"
                className="w-full border rounded px-3 py-2"
              />

              <textarea
                name="description"
                value={addData.description}
                onChange={handleAddChange}
                placeholder="Description"
                className="w-full border rounded px-3 py-2"
              />

              <select
                name="category"
                value={addData.category}
                onChange={handleAddChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select a category</option>
                <option value="other">Other</option>
                <option value="sports">Sports</option>
                <option value="beauty">Beauty</option>
                <option value="home">Home</option>
                <option value="books">Books</option>
                <option value="fashion">Fashion</option>
                <option value="electronics">Electronics</option>
              </select>
              <label className="flex items-center cursor-pointer w-full border rounded px-3 py-2 bg-gray-50 hover:bg-gray-100">
                <PhotoIcon className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-700">
                  {addImageCover ? addImageCover.name : "Image Cover"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAddImageCover}
                  className="hidden"
                />
              </label>
              <label className="flex items-center cursor-pointer w-full border rounded px-3 py-2 bg-gray-50 hover:bg-gray-100">
                <PhotoIcon className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-700">
                  {addImages.length > 0
                    ? `${addImages.length} Images`
                    : "Images"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAddImages}
                  className="hidden"
                />
              </label>
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 rounded hover:bg-primary-200"
                disabled={addLoading}
              >
                {addLoading ? "Adding..." : "Add Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
