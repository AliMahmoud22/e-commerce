// src/App.jsx
import { useState } from 'react';
import { UserContext } from './context/UserContext.jsx';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/homePage.jsx';
import MePage from './pages/MePage.jsx';
import './App.css';

function App() {
    const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{user,setUser}}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/me" element={<MePage />} />
      </Routes>
    </UserContext.Provider>
  );
}

export default App;
