import { useState, type FormEvent } from 'react'
import { useUser, type Idioma } from '../hooks/useUser'
import { supabase } from '../supabaseClient'

import '../css/UserRegister.css'

export default function ProfessorSignupForm() {
  const { idiomas, createUser, loading, error, clearError } = useUser()
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [formacao, setFormacao] = useState(false)
  const [atuacaoEmMissao, setAtuacaoEmMissao] = useState(false)
  const [relato, setRelato] = useState('')
  const [selectedIdiomas, setSelectedIdiomas] = useState<number[]>([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleIdiomaChange = (idiomaId: number) => {
    setSelectedIdiomas(prev =>
      prev.includes(idiomaId) ? prev.filter(id => id !== idiomaId) : [...prev, idiomaId]
    )
  }

  // Criar conta e usuário usando o hook
  const createAccount = async () => {
    if (!email || !password) {
      alert('Email e senha são obrigatórios')
      return
    }

    if (password.length < 6) {
      alert('Senha deve ter pelo menos 6 caracteres')
      return
    }

    clearError()

    try {
      // 1. Criar conta no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      })

      if (error) throw error
      if (!data.user) throw new Error('Falha ao criar usuário')

      // 2. Criar registro completo usando o hook
      await createUser({
        nome,
        cpf,
        formacao,
        atuacao_em_missao: atuacaoEmMissao,
        relato,
        idiomasIds: selectedIdiomas,
      }, data.user.id)

      alert('Conta criada com sucesso!')

    } catch (err: unknown) {
      console.error('Erro no cadastro:', err)
      alert('Erro ao cadastrar usuário: ' + (err instanceof Error ? err.message : 'Erro desconhecido'))
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
              <h2 className="register-header__title">Cadastro de Professor</h2>
              <p className="register-header__subtitle">Complete seu perfil para começar a ensinar</p>
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
                  placeholder="Nome"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  placeholder="CPF"
                  value={cpf}
                  onChange={e => setCpf(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <fieldset className="form-fieldset">
                <legend className="form-legend">Idiomas de atuação:</legend>
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
                </div>
              </fieldset>

              <div className="form-group">
                <label className="form-checkbox-item">
                  <input
                    type="checkbox"
                    checked={formacao}
                    onChange={e => setFormacao(e.target.checked)}
                    className="checkbox-input"
                  />
                  <span className="checkbox-label">Possuo formação em pedagogia ou no setor de educação.</span>
                </label>
              </div>

             { /* <div className="form-group">
                <label className="form-label">Comprovante:</label>
                <input
                  type="file"
                  onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                  className="form-file-input"
                />
              </div>*/}

              <div className="form-group">
                <label className="form-checkbox-item">
                  <input
                    type="checkbox"
                    checked={atuacaoEmMissao}
                    onChange={e => setAtuacaoEmMissao(e.target.checked)}
                    className="checkbox-input"
                  />
                  <span className="checkbox-label">Já atuou em missão?</span>
                </label>
              </div>

              <div className="form-group">
                <textarea
                  placeholder="Conte um pouco sobre sua experiência"
                  value={relato}
                  onChange={e => setRelato(e.target.value)}
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
  )
}
