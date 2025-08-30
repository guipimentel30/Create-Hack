import { useState } from 'react';
import './App.css';
import './css/RTL.css';
import './i18n';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import JoinUs from './components/JoinUs.tsx';
import Footer from './components/Footer.jsx';
import AboutUsPage from './components/AboutUsPage.tsx';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'about':
        return <AboutUsPage />;
      case 'home':
      default:
        return (
          <main>
            <Hero />
            <JoinUs />
          </main>
        );
    }
  };

  return (
    <div className="app-container">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {renderPage()}
      <Footer />
    </div>
  );
}

export default App;
