import { useState } from 'react';
import './App.css';
import './css/RTL.css';
import './i18n';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import JoinUs from './components/JoinUs.tsx';
import Footer from './components/Footer.jsx';
import AboutUsPage from './components/AboutUsPage.tsx';
import LoginPage from './components/LoginPage.tsx';
import UserRegister from './components/UserRegister.tsx';
import RefugiadoRegister from './components/RefugiadoRegister.tsx';
import EmpresaRegister from './components/EmpresaRegister.tsx';
import UserTypeSelection from './components/UserTypeSelection.tsx';
import ProfessorDashboard from './components/ProfessorDashboard.tsx';
import RefugiadoDashboard from './components/RefugiadoDashboard.tsx';
import EmpresaDashboard from './components/EmpresaDashboard.tsx';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const handleUserTypeSelection = (type: 'refugiado' | 'empresa' | 'professor') => {
    switch (type) {
      case 'refugiado':
        setCurrentPage('refugiado-register');
        break;
      case 'empresa':
        setCurrentPage('empresa-register');
        break;
      case 'professor':
        setCurrentPage('professor-register');
        break;
    }
  };

  const handleLogin = (userType: 'professor' | 'refugiado' | 'empresa') => {
    switch (userType) {
      case 'professor':
        setCurrentPage('professor-dashboard');
        break;
      case 'refugiado':
        setCurrentPage('refugiado-dashboard');
        break;
      case 'empresa':
        setCurrentPage('empresa-dashboard');
        break;
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'about':
        return <AboutUsPage />;
      case 'login':
        return <LoginPage onLogin={handleLogin} />;
      case 'register':
        return <UserTypeSelection onSelectType={handleUserTypeSelection} />;
      case 'refugiado-register':
        return <RefugiadoRegister />;
      case 'empresa-register':
        return <EmpresaRegister />;
      case 'professor-register':
        return <UserRegister />;
      case 'professor-dashboard':
        return <ProfessorDashboard />;
      case 'refugiado-dashboard':
        return <RefugiadoDashboard />;
      case 'empresa-dashboard':
        return <EmpresaDashboard />;
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
