import { useContext, useState } from 'react';
import { UserContext } from '../context/UserContext';
import Header from '../components/Header';
import axios from 'axios';
import Alert from '../components/Alert';

export default function MePage() {
  const { user, setUser } = useContext(UserContext);

  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  // Password update state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    passwordConfirm: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  if (!user) {
    return (
      <>
        <Header />
        <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow text-center">
          <p className="text-lg">Please sign in to view your account.</p>
        </div>
      </>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Update user datas
      let data = {};
      if (form.username) data.name = form.username;
      if (form.email) data.email = form.email;
      console.log(data);
      const res = await axios.patch('/api/users/me', data, {
        withCredentials: true,
      });
      setUser(res.data.user);
      setAlertMessage('Profile updated!');
      setAlertType('success');
    } catch (err) {
      console.log(err)
      setAlertMessage(err.response?.data?.message || 'Update failed');
      setAlertType('error');
    }
    setLoading(false);
  };

  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    if (!photo) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('photo', photo);
      console.log(user.id);
      const res = await axios.patch(
        `/api/users/upload-photo/${user._id}`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );
      setUser(res.data.user);
      setAlertMessage('Photo updated!');
      setAlertType('success');
    } catch (err) {
      setAlertMessage(err.response?.data?.message || 'Photo upload failed');
      setAlertType('error');
    }
    setLoading(false);
  };
  // Password update handlers
  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    try {
      await axios.patch(
        '/api/users/updatePassword',
        {
          password: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          newPasswordConfirm: passwordData.passwordConfirm,
        },
        { withCredentials: true },
      );
      setAlertMessage('Password updated!');
      setAlertType('success');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        passwordConfirm: '',
      });
    } catch (err) {
      setAlertMessage(err.response?.data?.message || 'Password update failed');
      setAlertType('error');
    }
    setPasswordLoading(false);
  };
  return (
    <>
      {/* Alert */}
      <Alert
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertMessage('')}
      />
      <Header />
      <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-6">My Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Username</label>
            <input
              type="text"
              name="username"
              placeholder={`${user.name}`}
              value={form.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              name="email"
              placeholder={`${user.email}`}
              value={form.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-primary text-white rounded mt-2"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
        <hr style={{ marginTop: '10px' }} />
        <form onSubmit={handlePhotoUpload} className="space-y-6 mt-3">
          <div className="flex items-center space-x-4">
            <img
              src={user.photo}
              alt="User"
              className="w-20 h-20 rounded-full object-cover border"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="block text-blue-800 cursor-pointer"
            />
          </div>
          <button
            type="submit"
            className="py-2 px-4 bg-primary text-white rounded"
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Upload Photo'}
          </button>
        </form>

        {/* Password Update Section */}
        <hr style={{ marginTop: '10px' }} />
        <h3 className="text-xl font-bold mb-4">Change Password</h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">
              Confirm New Password
            </label>
            <input
              type="password"
              name="passwordConfirm"
              value={passwordData.passwordConfirm}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-primary text-white rounded mt-2"
            disabled={passwordLoading}
          >
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </>
  );
}
