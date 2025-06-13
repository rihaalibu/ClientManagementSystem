import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import './App.css';
import {useState} from  'react';

function App() {
  const isAuthenticated = localStorage.getItem('isAuthenticated'); // local storage is a browser storage
  return (
   <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        {console.log(isAuthenticated) } // checking if the user is authenticated 
        <Route 
          path="/*" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
        /> // if the user is authenticated, redirect to the dashboard, else redirect to the login page
        <Route path="/dashboard/*" element= {<Dashboard />} />
      </Routes>
      </div>
  );
}

export default App;
