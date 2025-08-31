import { useState, useEffect, type FormEvent } from 'react'
import { useRefugiado, type Idioma, type AreaAtuacao } from '../hooks/useRefugiado'
import { supabase } from '../supabaseClient'
import '../css/UserRegister.css' // Certifique-se de que este CSS contém as classes de erro adicionadas abaixo
import { useTranslation } from 'react-i18next';

// --- Funções de Validação e Máscara (fora do componente para otimização) ---

/**
 * Valida o formato de um e-mail.
 * @param email - O e-mail a ser validado.
 * @returns `true` se o e-mail for válido, `false` caso contrário.
 */
const isEmailValid = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida um número de CPF brasileiro.
 * @param cpf - O CPF (pode conter máscara).
 * @returns `true` se o CPF for válido, `false` caso contrário.
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
 * Valida um número de telefone brasileiro (fixo ou celular).
 * @param phone - O telefone (pode conter máscara).
 * @returns `true` se o telefone for válido, `false` caso contrário.
 */
const isPhoneValid = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};

/**
 * Formata um valor de string para o formato de CPF.
 */
const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .slice(0, 14);
};

/**
 * Formata um valor de string para o formato de telefone brasileiro.
 */
const formatPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{4})/, '$1-$2')
    .replace(/(\d{4})(\d{4})/, '$1-$2') // Para telefones fixos
    .slice(0, 15);
};


export default function RefugiadoRegister() {
  const { idiomas, areas, createRefugiado, loading, error: apiError, clearError } = useRefugiado();
  const { t } = useTranslation();
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [nacionalidade, setNacionalidade] = useState('');
  const [resumoExperiencias, setResumoExperiencias] = useState('');
  const [selectedIdiomas, setSelectedIdiomas] = useState<number[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<number[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAreasDropdownOpen, setIsAreasDropdownOpen] = useState(false);
  const [showOutroIdioma, setShowOutroIdioma] = useState(false);
  const [outroIdioma, setOutroIdioma] = useState('');
  
  // Novo estado para armazenar os erros de validação do formulário
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // --- Handlers de Input com Máscara e Limpeza de Erros ---

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
    if (errors.cpf) setErrors(prev => ({ ...prev, cpf: '' }));
  };
  
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(formatPhone(e.target.value));
    if (errors.telefone) setErrors(prev => ({ ...prev, telefone: '' }));
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, fieldName: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setter(e.target.value);
      if (errors[fieldName]) {
          setErrors(prev => ({ ...prev, [fieldName]: '' }));
      }
  };


  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleIdiomaChange = (idiomaId: number) => {
    setSelectedIdiomas(prev =>
      prev.includes(idiomaId) ? prev.filter(id => id !== idiomaId) : [...prev, idiomaId]
    );
  };

  const handleOutroIdiomaToggle = () => {
    setShowOutroIdioma(!showOutroIdioma);
    if (showOutroIdioma) {
      setOutroIdioma('');
    }
  };

  const handleAreaChange = (areaId: number) => {
    setSelectedAreas(prev =>
      prev.includes(areaId) ? prev.filter(id => id !== areaId) : [...prev, areaId]
    );
  };

  const getSelectedAreasText = () => {
    if (selectedAreas.length === 0) return t('refugiadoRegister.selectAreas');
    if (selectedAreas.length === 1) {
      const area = areas.find(a => a.id === selectedAreas[0]);
      return area?.nome || '';
    }
    return `${selectedAreas.length} áreas selecionadas`;
  };
  
  /**
   * Valida todos os campos do formulário e atualiza o estado de erros.
   * @returns `true` se o formulário for válido, `false` caso contrário.
   */
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
  
    if (!nome.trim()) newErrors.nome = t('refugiadoRegister.errors.nome');
    if (!isEmailValid(email)) newErrors.email = t('refugiadoRegister.errors.email');
    if (password.length < 6) newErrors.password = t('refugiadoRegister.errors.password');
    if (!isCPFValid(cpf)) newErrors.cpf = t('refugiadoRegister.errors.cpf');
    if (!isPhoneValid(telefone)) newErrors.telefone = t('refugiadoRegister.errors.telefone');
    if (!nacionalidade.trim()) newErrors.nacionalidade = t('refugiadoRegister.errors.nacionalidade');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const createAccount = async () => {
    clearError();

    try {
      // 1. Criar conta no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            nome,
            cpf,
            telefone,
            nacionalidade
          }
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('Falha ao criar usuário');

      // 2. Processar registro do refugiado
      const refugiadoData = {
        nome,
        cpf,
        telefone,
        nacionalidade,
        resumo_experiencias: resumoExperiencias,
        idiomasIds: selectedIdiomas,
        areasIds: selectedAreas,
      };

      if (data.session) {
        await createRefugiado(refugiadoData, data.user.id);
        alert(t('refugiadoRegister.success'));
      } else {
        localStorage.setItem('pendingRefugiadoData', JSON.stringify(refugiadoData));
        alert(t('refugiadoRegister.pending'));
      }

    } catch (err: unknown) {
      console.error('Erro no cadastro:', err);
      alert(t('refugiadoRegister.error') + (err instanceof Error ? err.message : 'Erro desconhecido'));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Valida o formulário antes de tentar criar a conta
    if (validateForm()) {
      createAccount();
    }
  };

  return (
    <div className="user-register-page">
      <div className="register-hero">
        <div className="register-hero__overlay"></div>
        <div className="register-hero__content">
          <div className="register-container">
            <div className="register-header">
              <h2 className="register-header__title">{t('refugiadoRegister.title')}</h2>
              <p className="register-header__subtitle">{t('refugiadoRegister.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="register-form" noValidate>
              {/* --- Email --- */}
              <div className="form-group">
                <input
                  type="email"
                  placeholder={t('refugiadoRegister.emailPlaceholder')}
                  value={email}
                  onChange={handleInputChange(setEmail, 'email')}
                  required
                  className={`form-input ${errors.email ? 'form-input--error' : ''}`}
                />
                {errors.email && <p className="form-error-message">{errors.email}</p>}
              </div>

              {/* --- Senha --- */}
              <div className="form-group">
                <input
                  type="password"
                  placeholder={t('refugiadoRegister.passwordPlaceholder')}
                  value={password}
                  onChange={handleInputChange(setPassword, 'password')}
                  required
                  minLength={6}
                  className={`form-input ${errors.password ? 'form-input--error' : ''}`}
                />
                {errors.password && <p className="form-error-message">{errors.password}</p>}
              </div>

              {/* --- Nome --- */}
              <div className="form-group">
                <input
                  type="text"
                  placeholder={t('refugiadoRegister.nomePlaceholder')}
                  value={nome}
                  onChange={handleInputChange(setNome, 'nome')}
                  required
                  className={`form-input ${errors.nome ? 'form-input--error' : ''}`}
                />
                {errors.nome && <p className="form-error-message">{errors.nome}</p>}
              </div>

              {/* --- CPF --- */}
              <div className="form-group">
                <input
                  type="text"
                  placeholder={t('refugiadoRegister.cpfPlaceholder')}
                  value={cpf}
                  onChange={handleCpfChange}
                  required
                  maxLength={14}
                  className={`form-input ${errors.cpf ? 'form-input--error' : ''}`}
                />
                {errors.cpf && <p className="form-error-message">{errors.cpf}</p>}
              </div>
              
              {/* --- Telefone --- */}
              <div className="form-group">
                <input
                  type="tel"
                  placeholder={t('refugiadoRegister.telefonePlaceholder')}
                  value={telefone}
                  onChange={handleTelefoneChange}
                  required
                  maxLength={15}
                  className={`form-input ${errors.telefone ? 'form-input--error' : ''}`}
                />
                {errors.telefone && <p className="form-error-message">{errors.telefone}</p>}
              </div>

              {/* --- Nacionalidade --- */}
              <div className="form-group">
                <input
                  type="text"
                  placeholder={t('refugiadoRegister.nacionalidadePlaceholder')}
                  value={nacionalidade}
                  onChange={handleInputChange(setNacionalidade, 'nacionalidade')}
                  required
                  className={`form-input ${errors.nacionalidade ? 'form-input--error' : ''}`}
                />
                {errors.nacionalidade && <p className="form-error-message">{errors.nacionalidade}</p>}
              </div>

              {/* --- Idiomas --- */}
              <div className="form-group">
                <label htmlFor="idiomas" className="form-label">{t('refugiadoRegister.languages')}</label>
                <div className="form-checkbox-group">
                  {idiomas.map((idioma: Idioma) => (
                    <label key={idioma.id} className="form-checkbox-item">
                      <input
                        type="checkbox"
                        checked={selectedIdiomas.includes(idioma.id)}
                        onChange={() => handleIdiomaChange(idioma.id)}
                        className="checkbox-input"
                      />
                      <span className="checkbox-label">{idioma.nome}</span>
                    </label>
                  ))}
                  <label className="form-checkbox-item">
                    <input type="checkbox" checked={showOutroIdioma} onChange={handleOutroIdiomaToggle} className="checkbox-input" />
                    <span className="checkbox-label">{t('refugiadoRegister.outroIdioma')}</span>
                  </label>
                  {showOutroIdioma && (
                    <div className="form-group">
                      <input type="text" placeholder={t('refugiadoRegister.outroIdiomaPlaceholder')} value={outroIdioma} onChange={e => setOutroIdioma(e.target.value)} className="form-input" />
                    </div>
                  )}
                </div>
                {errors.idiomas && <span className="error-message">{errors.idiomas}</span>}
              </div>

              {/* --- Áreas de Atuação --- */}
              <div className="form-group">
                <label htmlFor="areas" className="form-label">{t('refugiadoRegister.workAreas')}</label>
                <div className="dropdown-container">
                  <button 
                    type="button" 
                    className="dropdown-toggle" 
                    onClick={() => setIsAreasDropdownOpen(!isAreasDropdownOpen)}
                  >
                    {getSelectedAreasText()}
                    <span className="dropdown-arrow">▼</span>
                  </button>
                  {isAreasDropdownOpen && (
                    <div className="dropdown-menu">
                      {areas.map((area: AreaAtuacao) => (
                        <label key={area.id} className="dropdown-item">
                          <input
                            type="checkbox"
                            checked={selectedAreas.includes(area.id)}
                            onChange={() => handleAreaChange(area.id)}
                            className="checkbox-input"
                          />
                          <span className="checkbox-label">{area.nome}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {errors.areas && <span className="error-message">{errors.areas}</span>}
              </div>
              
              {/* --- Resumo de Experiências --- */}
              <div className="form-group">
                <label htmlFor="resumoExperiencias" className="form-label">{t('refugiadoRegister.experience')}</label>
                <textarea
                  id="resumoExperiencias"
                  className={`form-input form-textarea ${errors.resumoExperiencias ? 'error' : ''}`}
                  value={resumoExperiencias}
                  onChange={(e) => setResumoExperiencias(e.target.value)}
                  placeholder={t('refugiadoRegister.experiencePlaceholder')}
                  rows={4}
                />
                {errors.resumoExperiencias && <span className="error-message">{errors.resumoExperiencias}</span>}
              </div>

              <button type="submit" disabled={loading} className="register-submit">
                {loading ? t('refugiadoRegister.registering') : t('refugiadoRegister.registerButton')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}