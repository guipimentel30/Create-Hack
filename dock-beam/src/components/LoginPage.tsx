import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaUser, FaLock } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { supabase } from '../supabaseClient';
import '../css/LoginPage.css';

interface LoginPageProps {
  onLogin?: (userType: 'professor' | 'refugiado' | 'empresa') => void;
}

export default function LoginPage({ onLogin = () => {} }: LoginPageProps) {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const validateForm = () => {
    const newErrors = { email: '', password: '' };
    
    if (!email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const determineUserType = async (userId: string): Promise<'professor' | 'refugiado' | 'empresa'> => {
    // Check in users table (professors)
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userData) {
      return 'professor';
    }

    // Check in refugiados table
    const { data: refugiadoData } = await supabase
      .from('refugiados')
      .select('id')
      .eq('id', userId)
      .single();

    if (refugiadoData) {
      return 'refugiado';
    }

    // Check in empresas table
    const { data: empresaData } = await supabase
      .from('empresas')
      .select('id')
      .eq('id', userId)
      .single();

    if (empresaData) {
      return 'empresa';
    }

    // Default fallback - this shouldn't happen in normal flow
    throw new Error('Tipo de usuário não encontrado');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('Falha na autenticação');
      }

      // Determine user type and redirect
      const userType = await determineUserType(data.user.id);
      onLogin(userType);

    } catch (error: any) {
      console.error('Erro no login:', error);
      
      // Set appropriate error message
      if (error.message.includes('Invalid login credentials')) {
        setErrors({ email: '', password: 'Email ou senha incorretos' });
      } else if (error.message.includes('Tipo de usuário não encontrado')) {
        setErrors({ email: '', password: 'Usuário não possui perfil cadastrado' });
      } else {
        setErrors({ email: '', password: 'Erro ao fazer login. Tente novamente.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page" data-lang={i18n.language}>
      {/* Hero Section */}
      <section className="login-hero">
        <div className="login-hero__overlay"></div>
        <div className="login-hero__content">
          <div className="login-container">
            <div className="login-header">
              <h1 className="login-header__title">Bem-vindo de volta!</h1>
              <p className="login-header__subtitle">
                Entre na sua conta para continuar sua jornada
              </p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {/* Email field */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <div className="form-input-wrapper">
                  <div className="form-input-icon">
                    <FaUser />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`form-input ${errors.email ? 'form-input--error' : ''}`}
                    placeholder="seu@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="form-error">{errors.email}</p>
                )}
              </div>

              {/* Password field */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Senha
                </label>
                <div className="form-input-wrapper">
                  <div className="form-input-icon">
                    <FaLock />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`form-input ${errors.password ? 'form-input--error' : ''}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="form-input-toggle"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="form-error">{errors.password}</p>
                )}
              </div>

              {/* Remember me and forgot password */}
              <div className="form-options">
                <div className="form-checkbox">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="checkbox-input"
                  />
                  <label htmlFor="remember-me" className="checkbox-label">
                    Lembrar de mim
                  </label>
                </div>
                <a href="#" className="forgot-password">
                  Esqueceu a senha?
                </a>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn--primary login-submit"
              >
                {isLoading ? (
                  <div className="loading-content">
                    <div className="spinner"></div>
                    Entrando...
                  </div>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>

            {/* Sign up link */}
            <p className="signup-link">
              Não tem uma conta?{' '}
              <a href="#" className="signup-link__anchor">
                Cadastre-se aqui
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
