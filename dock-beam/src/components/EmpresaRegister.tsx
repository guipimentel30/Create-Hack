import { useState, type FormEvent } from 'react'
import { useEmpresa, type SetorAtuacao } from '../hooks/useEmpresa.ts'
import { supabase } from '../supabaseClient'

import '../css/UserRegister.css'

// --- Helper Functions for Validation & Masking ---

const isEmailValid = (email: string): boolean => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isCNPJValid = (cnpj: string): boolean => {
  if (!cnpj) return false;
  const cleanCnpj = cnpj.replace(/\D/g, '');
  if (cleanCnpj.length !== 14 || /^(\d)\1+$/.test(cleanCnpj)) {
    return false;
  }
  let size = cleanCnpj.length - 2;
  let numbers = cleanCnpj.substring(0, size);
  const digits = cleanCnpj.substring(size);
  let sum = 0;
  let pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  size = size + 1;
  numbers = cleanCnpj.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;
  return true;
};

const isPhoneValid = (phone: string): boolean => {
  if (!phone) return true; // Phone is optional, so it's valid if empty
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};

const formatCNPJ = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18);
};

const formatPhone = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{4})/, '$1-$2')
    .replace(/(\d{4})(\d{4})/, '$1-$2')
    .slice(0, 15);
};


export default function EmpresaRegister() {
  const { setores, createEmpresa, loading, error: apiError, clearError } = useEmpresa();

  // Form states
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [setorAtuacao, setSetorAtuacao] = useState('');
  const [website, setWebsite] = useState('');
  const [descricao, setDescricao] = useState('');
  const [nomeResponsavel, setNomeResponsavel] = useState('');
  const [emailContato, setEmailContato] = useState('');
  const [telefoneComercial, setTelefoneComercial] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State for validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Account validation
    if (!isEmailValid(email)) newErrors.email = "Email de acesso inválido.";
    if (password.length < 6) newErrors.password = "A senha deve ter no mínimo 6 caracteres.";

    // Company data validation
    if (!nomeEmpresa.trim()) newErrors.nomeEmpresa = "O nome da empresa é obrigatório.";
    if (!isCNPJValid(cnpj)) newErrors.cnpj = "CNPJ inválido.";
    if (!setorAtuacao) newErrors.setorAtuacao = "Selecione um setor de atuação.";
    if (!descricao.trim()) newErrors.descricao = "A descrição é obrigatória.";
    if (descricao.length > 500) newErrors.descricao = "A descrição deve ter no máximo 500 caracteres.";

    // Contact validation
    if (!nomeResponsavel.trim()) newErrors.nomeResponsavel = "O nome do responsável é obrigatório.";
    if (!isEmailValid(emailContato)) newErrors.emailContato = "O email de contato é inválido.";
    if (!isPhoneValid(telefoneComercial)) newErrors.telefoneComercial = "O telefone comercial é inválido.";

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
          data: {
            nome_empresa: nomeEmpresa,
            cnpj,
            nome_responsavel: nomeResponsavel
          }
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('Falha ao criar usuário');

      // 2. Prepare data for the company profile
      const empresaData = {
        nome_empresa: nomeEmpresa,
        cnpj,
        setor_atuacao: setorAtuacao,
        website: website || undefined,
        descricao,
        nome_responsavel: nomeResponsavel,
        email_contato: emailContato,
        telefone_comercial: telefoneComercial || undefined,
      };

      if (data.session) {
        await createEmpresa(empresaData, data.user.id);
        alert('Conta criada com sucesso!');
      } else {
        localStorage.setItem('pendingEmpresaData', JSON.stringify(empresaData));
        alert('Conta criada! Verifique seu email para confirmar a conta.');
      }

    } catch (err: unknown) {
      console.error('Erro no cadastro:', err);
      alert('Erro ao cadastrar empresa: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createAccount();
    }
  };

  // Generic handler to update state and clear the associated error
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, fieldName: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
              <h2 className="register-header__title">Cadastro de Empresa</h2>
              <p className="register-header__subtitle">Registre sua empresa para encontrar talentos</p>
            </div>

            <form onSubmit={handleSubmit} className="register-form" noValidate>
              {/* --- DADOS DE ACESSO --- */}
              <fieldset className="form-fieldset">
                <legend className="form-legend">Dados de Acesso</legend>
                <div className="form-group">
                  <input type="email" placeholder="Email de Acesso" value={email} onChange={handleInputChange(setEmail, 'email')} required className={`form-input ${errors.email ? 'form-input--error' : ''}`} />
                  {errors.email && <p className="form-error-message">{errors.email}</p>}
                </div>
                <div className="form-group">
                  <input type="password" placeholder="Senha (mínimo 6 caracteres)" value={password} onChange={handleInputChange(setPassword, 'password')} required minLength={6} className={`form-input ${errors.password ? 'form-input--error' : ''}`} />
                  {errors.password && <p className="form-error-message">{errors.password}</p>}
                </div>
              </fieldset>

              {/* --- DADOS DA EMPRESA --- */}
              <fieldset className="form-fieldset">
                <legend className="form-legend">Dados da Empresa</legend>
                <div className="form-group">
                  <input type="text" placeholder="Nome da Empresa" value={nomeEmpresa} onChange={handleInputChange(setNomeEmpresa, 'nomeEmpresa')} required className={`form-input ${errors.nomeEmpresa ? 'form-input--error' : ''}`} />
                  {errors.nomeEmpresa && <p className="form-error-message">{errors.nomeEmpresa}</p>}
                </div>
                <div className="form-group">
                  <input type="text" placeholder="CNPJ (00.000.000/0000-00)" value={cnpj} onChange={(e) => { setCnpj(formatCNPJ(e.target.value)); if (errors.cnpj) setErrors(p => ({...p, cnpj: ''})) }} required maxLength={18} className={`form-input ${errors.cnpj ? 'form-input--error' : ''}`} />
                  {errors.cnpj && <p className="form-error-message">{errors.cnpj}</p>}
                </div>
                <div className="form-group">
                  <select value={setorAtuacao} onChange={handleInputChange(setSetorAtuacao, 'setorAtuacao')} required className={`form-input ${errors.setorAtuacao ? 'form-input--error' : ''}`}>
                    <option value="">Selecione um setor de atuação</option>
                    {setores.map((setor: SetorAtuacao) => (
                      <option key={setor.id} value={setor.nome}>{setor.nome}</option>
                    ))}
                  </select>
                  {errors.setorAtuacao && <p className="form-error-message">{errors.setorAtuacao}</p>}
                </div>
                <div className="form-group">
                  <input type="url" placeholder="https://www.suaempresa.com (Opcional)" value={website} onChange={handleInputChange(setWebsite, 'website')} className="form-input" />
                </div>
                <div className="form-group">
                  <textarea placeholder="Breve descrição da empresa (até 500 caracteres)" value={descricao} onChange={handleInputChange(setDescricao, 'descricao')} required maxLength={500} className={`form-input form-textarea ${errors.descricao ? 'form-input--error' : ''}`} />
                  <small className="form-help">{descricao.length}/500 caracteres</small>
                  {errors.descricao && <p className="form-error-message">{errors.descricao}</p>}
                </div>
              </fieldset>

              {/* --- DADOS DE CONTATO --- */}
              <fieldset className="form-fieldset">
                <legend className="form-legend">Dados de Contato</legend>
                <div className="form-group">
                  <input type="text" placeholder="Nome do Responsável" value={nomeResponsavel} onChange={handleInputChange(setNomeResponsavel, 'nomeResponsavel')} required className={`form-input ${errors.nomeResponsavel ? 'form-input--error' : ''}`} />
                  {errors.nomeResponsavel && <p className="form-error-message">{errors.nomeResponsavel}</p>}
                </div>
                <div className="form-group">
                  <input type="email" placeholder="E-mail de Contato" value={emailContato} onChange={handleInputChange(setEmailContato, 'emailContato')} required className={`form-input ${errors.emailContato ? 'form-input--error' : ''}`} />
                  {errors.emailContato && <p className="form-error-message">{errors.emailContato}</p>}
                </div>
                <div className="form-group">
                  <input type="tel" placeholder="Telefone Comercial (Opcional)" value={telefoneComercial} onChange={(e) => { setTelefoneComercial(formatPhone(e.target.value)); if(errors.telefoneComercial) setErrors(p => ({...p, telefoneComercial: ''})) }} className={`form-input ${errors.telefoneComercial ? 'form-input--error' : ''}`} />
                  {errors.telefoneComercial && <p className="form-error-message">{errors.telefoneComercial}</p>}
                </div>
              </fieldset>

              <button type="submit" disabled={loading} className="register-submit">
                {loading ? 'Cadastrando...' : 'Cadastrar Empresa'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}