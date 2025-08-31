import { useState, type FormEvent } from 'react'
import { useUser, type Idioma } from '../hooks/useUser'
import { supabase } from '../supabaseClient'

import '../css/UserRegister.css';

// --- Helper Functions for Validation & Masking ---

/**
 * Validates an email format using a regular expression.
 * @param email The email string to validate.
 * @returns `true` if the email format is valid, otherwise `false`.
 */
const isEmailValid = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a Brazilian CPF number, including check digits.
 * @param cpf The CPF string, which can include formatting.
 * @returns `true` if the CPF is valid, otherwise `false`.
 */
const isCPFValid = (cpf: string): boolean => {
  const cleanCpf = cpf.replace(/\D/g, '');
  if (cleanCpf.length !== 11 || /^(\d)\1+$/.test(cleanCpf)) {
    return false;
  }
  let sum = 0;
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCpf.substring(i - 1, i)) * (11 - i);
  }
  let rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(cleanCpf.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCpf.substring(i - 1, i)) * (12 - i);
  }
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(cleanCpf.substring(10, 11))) return false;
  return true;
};

/**
 * Validates a Brazilian phone number (10 or 11 digits).
 * @param phone The phone number string, which can include formatting.
 * @returns `true` if the phone number is valid, otherwise `false`.
 */
const isPhoneValid = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};

/** Formats a string into the CPF format (XXX.XXX.XXX-XX). */
const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .slice(0, 14);
};

/** Formats a string into the Brazilian phone format ((XX) XXXXX-XXXX). */
const formatPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{4})/, '$1-$2')
    .replace(/(\d{4})(\d{4})/, '$1-$2') 
    .slice(0, 15);
};

export default function ProfessorSignupForm() {
  const { idiomas, createUser, loading, error: apiError, clearError } = useUser();
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState(''); // New state for phone number
  const [formacao, setFormacao] = useState(false);
  const [atuacaoEmMissao, setAtuacaoEmMissao] = useState(false);
  const [relato, setRelato] = useState('');
  const [selectedIdiomas, setSelectedIdiomas] = useState<number[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // State to hold form validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleIdiomaChange = (idiomaId: number) => {
    setSelectedIdiomas(prev =>
      prev.includes(idiomaId) ? prev.filter(id => id !== idiomaId) : [...prev, idiomaId]
    )
  }

  /**
   * Validates all required form fields and updates the errors state.
   * @returns `true` if the form is valid, otherwise `false`.
   */
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!nome.trim()) newErrors.nome = "O nome é obrigatório.";
    if (!isEmailValid(email)) newErrors.email = "Por favor, insira um email válido.";
    if (password.length < 6) newErrors.password = "A senha deve ter pelo menos 6 caracteres.";
    if (!isCPFValid(cpf)) newErrors.cpf = "O CPF informado é inválido.";
    if (!isPhoneValid(telefone)) newErrors.telefone = "O telefone é inválido. Use (XX) XXXXX-XXXX.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createAccount = async () => {
    clearError();
    try {
      // 1. Create account in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { nome, cpf, telefone } // Include phone in metadata
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('Falha ao criar usuário');

      // 2. Create the full user record
      await createUser({
        nome,
        cpf,
        telefone, // Pass phone to your hook
        formacao,
        atuacao_em_missao: atuacaoEmMissao,
        relato,
        idiomasIds: selectedIdiomas,
      }, data.user.id);

      alert('Conta criada com sucesso! Verifique seu email para confirmar.');
    } catch (err: unknown) {
      console.error('Erro no cadastro:', err);
      alert('Erro ao cadastrar usuário: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Validate the form before attempting to create an account
    if (validateForm()) {
      createAccount();
    }
  };

  // Generic handler to update state and clear errors
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, fieldName: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setter(e.target.value);
      if (errors[fieldName]) {
          setErrors(prev => ({ ...prev, [fieldName]: '' }));
      }
  };

  return (
    <div className="user-register-page">
      <div className="register-hero">
        <div className="register-hero__overlay"></div>
        <div className="register-hero__content">
          <div className="register-container">
            <div className="register-header">
              <h2 className="register-header__title">Cadastro de Professor</h2>
              <p className="register-header__subtitle">Complete seu perfil para começar a ensinar</p>
            </div>

            <form onSubmit={handleSubmit} className="register-form" noValidate>
              {/* Email */}
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={handleInputChange(setEmail, 'email')}
                  required
                  className={`form-input ${errors.email ? 'form-input--error' : ''}`}
                />
                {errors.email && <p className="form-error-message">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Senha (mínimo 6 caracteres)"
                  value={password}
                  onChange={handleInputChange(setPassword, 'password')}
                  required
                  minLength={6}
                  className={`form-input ${errors.password ? 'form-input--error' : ''}`}
                />
                {errors.password && <p className="form-error-message">{errors.password}</p>}
              </div>

              {/* Nome */}
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={nome}
                  onChange={handleInputChange(setNome, 'nome')}
                  required
                  className={`form-input ${errors.nome ? 'form-input--error' : ''}`}
                />
                {errors.nome && <p className="form-error-message">{errors.nome}</p>}
              </div>

              {/* CPF */}
              <div className="form-group">
                <input
                  type="text"
                  placeholder="CPF (000.000.000-00)"
                  value={cpf}
                  onChange={(e) => {
                    setCpf(formatCPF(e.target.value));
                    if (errors.cpf) setErrors(prev => ({...prev, cpf: ''}));
                  }}
                  required
                  maxLength={14}
                  className={`form-input ${errors.cpf ? 'form-input--error' : ''}`}
                />
                {errors.cpf && <p className="form-error-message">{errors.cpf}</p>}
              </div>

              {/* Telefone (New Field) */}
              <div className="form-group">
                <input
                  type="tel"
                  placeholder="Telefone ((00) 00000-0000)"
                  value={telefone}
                   onChange={(e) => {
                    setTelefone(formatPhone(e.target.value));
                    if (errors.telefone) setErrors(prev => ({...prev, telefone: ''}));
                  }}
                  required
                  maxLength={15}
                  className={`form-input ${errors.telefone ? 'form-input--error' : ''}`}
                />
                {errors.telefone && <p className="form-error-message">{errors.telefone}</p>}
              </div>
              
              {/* Idiomas */}
              <fieldset className="form-fieldset">
                <legend className="form-legend">Idiomas de atuação:</legend>
                <div className="form-checkbox-group">
                  {idiomas.map((idioma: Idioma) => (
                    <label key={idioma.id} className="form-checkbox-item">
                      <input type="checkbox" checked={selectedIdiomas.includes(idioma.id)} onChange={() => handleIdiomaChange(idioma.id)} className="checkbox-input" />
                      <span className="checkbox-label">{idioma.nome}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              
              {/* Checkboxes */}
              <div className="form-group">
                <label className="form-checkbox-item">
                  <input type="checkbox" checked={formacao} onChange={e => setFormacao(e.target.checked)} className="checkbox-input" />
                  <span className="checkbox-label">Possuo formação em pedagogia ou no setor de educação.</span>
                </label>
              </div>

              <div className="form-group">
                <label className="form-checkbox-item">
                  <input type="checkbox" checked={atuacaoEmMissao} onChange={e => setAtuacaoEmMissao(e.target.checked)} className="checkbox-input" />
                  <span className="checkbox-label">Já atuou em missão?</span>
                </label>
              </div>
              
              {/* Relato */}
              <div className="form-group">
                <textarea
                  placeholder="Conte um pouco sobre sua experiência"
                  value={relato}
                  onChange={handleInputChange(setRelato, 'relato')}
                  className="form-input form-textarea"
                />
              </div>

              <button type="submit" disabled={loading} className="register-submit">
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}