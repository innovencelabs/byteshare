import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ComingSoon from './pages/ComingSoon';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <div>
        
        <Routes>
          <Route exact path="/" element={<ComingSoon />}></Route>
          <Route path="*" element={<NotFound />}></Route>
        </Routes>
        
      </div>
    </Router>
  );
}

export default App;
