import { useState, useEffect, type FormEvent } from 'react'
import { useEmpresa, type SetorAtuacao } from '../hooks/useEmpresa.ts'
import { supabase } from '../supabaseClient'

import '../css/UserRegister.css'

export default function EmpresaRegister() {
  const { setores, createEmpresa, loading, error, clearError } = useEmpresa()
  const [nomeEmpresa, setNomeEmpresa] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [setorAtuacao, setSetorAtuacao] = useState('')
  const [website, setWebsite] = useState('')
  const [descricao, setDescricao] = useState('')
  const [descricaoCount, setDescricaoCount] = useState(0)
  const [nomeResponsavel, setNomeResponsavel] = useState('')
  const [emailContato, setEmailContato] = useState('')
  const [telefoneComercial, setTelefoneComercial] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Criar conta e empresa usando o hook
  const createAccount = async () => {
    if (!email || !password) {
      alert('Email e senha são obrigatórios')
      return
    }

    if (password.length < 6) {
      alert('Senha deve ter pelo menos 6 caracteres')
      return
    }

    if (!nomeEmpresa || !cnpj || !setorAtuacao || !descricao || !nomeResponsavel || !emailContato) {
      alert('Por favor, preencha todos os campos obrigatórios')
      return
    }

    if (descricao.length > 500) {
      alert('A descrição deve ter no máximo 500 caracteres')
      return
    }

    clearError()

    try {
      // 1. Criar conta no Supabase Auth
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
      })

      if (error) throw error
      if (!data.user) throw new Error('Falha ao criar usuário')

      // 2. Verificar se o usuário foi confirmado automaticamente ou precisa confirmar email
      if (data.session) {
        // Usuário foi confirmado automaticamente, criar registro completo
        await createEmpresa({
          nome_empresa: nomeEmpresa,
          cnpj,
          setor_atuacao: setorAtuacao,
          website: website || undefined,
          descricao,
          nome_responsavel: nomeResponsavel,
          email_contato: emailContato,
          telefone_comercial: telefoneComercial || undefined,
        }, data.user.id)

        alert('Conta criada com sucesso!')
      } else {
        // Usuário precisa confirmar email
        alert('Conta criada! Verifique seu email para confirmar a conta. Após confirmar, você poderá fazer login e completar seu perfil.')
        
        // Salvar dados temporariamente no localStorage para usar após confirmação
        localStorage.setItem('pendingEmpresaData', JSON.stringify({
          nome_empresa: nomeEmpresa,
          cnpj,
          setor_atuacao: setorAtuacao,
          website: website || undefined,
          descricao,
          nome_responsavel: nomeResponsavel,
          email_contato: emailContato,
          telefone_comercial: telefoneComercial || undefined,
        }))
      }

    } catch (err: unknown) {
      console.error('Erro no cadastro:', err)
      alert('Erro ao cadastrar empresa: ' + (err instanceof Error ? err.message : 'Erro desconhecido'))
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    createAccount()
  }

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

            <form onSubmit={handleSubmit} className="register-form">
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input
                  type="password"
                  placeholder="Senha (mínimo 6 caracteres)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  placeholder="Nome da Empresa"
                  value={nomeEmpresa}
                  onChange={e => setNomeEmpresa(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  placeholder="CNPJ"
                  value={cnpj}
                  onChange={e => setCnpj(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Setor de Atuação *</label>
                <select
                  value={setorAtuacao}
                  onChange={e => setSetorAtuacao(e.target.value)}
                  required
                  className="form-input"
                >
                  <option value="">Selecione um setor</option>
                  {setores.map((setor: SetorAtuacao) => (
                    <option key={setor.id} value={setor.nome}>
                      {setor.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <input
                  type="url"
                  placeholder="https://www.suaempresa.com"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  className="form-input"
                />
                <small className="form-help">Website (opcional)</small>
              </div>

              <div className="form-group">
                <label className="form-label">Sobre Nós (até 500 caracteres) *</label>
                <textarea
                  placeholder="Breve descrição da empresa"
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  required
                  maxLength={500}
                  className="form-input form-textarea"
                />
                <small className="form-help">{descricao.length}/500 caracteres</small>
              </div>

              <div className="form-group">
                <input
                  type="text"
                  placeholder="Nome do Responsável pelo Cadastro"
                  value={nomeResponsavel}
                  onChange={e => setNomeResponsavel(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input
                  type="email"
                  placeholder="E-mail de Contato"
                  value={emailContato}
                  onChange={e => setEmailContato(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input
                  type="tel"
                  placeholder="Telefone Comercial"
                  value={telefoneComercial}
                  onChange={e => setTelefoneComercial(e.target.value)}
                  className="form-input"
                />
                <small className="form-help">Telefone (opcional)</small>
              </div>

              <button type="submit" disabled={loading} className="register-submit">
                {loading ? 'Cadastrando...' : 'Cadastrar Empresa'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
