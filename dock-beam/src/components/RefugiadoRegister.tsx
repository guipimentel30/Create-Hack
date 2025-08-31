import { useState, useEffect, type FormEvent } from 'react'
import { useRefugiado, type Idioma, type AreaAtuacao } from '../hooks/useRefugiado'
import { supabase } from '../supabaseClient'

import '../css/UserRegister.css'

export default function RefugiadoRegister() {
  const { idiomas, areas, createRefugiado, loading, error, clearError } = useRefugiado()
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [telefone, setTelefone] = useState('')
  const [nacionalidade, setNacionalidade] = useState('')
  const [resumoExperiencias, setResumoExperiencias] = useState('')
  const [selectedIdiomas, setSelectedIdiomas] = useState<number[]>([])
  const [selectedAreas, setSelectedAreas] = useState<number[]>([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isAreasDropdownOpen, setIsAreasDropdownOpen] = useState(false)
  const [showOutroIdioma, setShowOutroIdioma] = useState(false)
  const [outroIdioma, setOutroIdioma] = useState('')

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleIdiomaChange = (idiomaId: number) => {
    setSelectedIdiomas(prev =>
      prev.includes(idiomaId) ? prev.filter(id => id !== idiomaId) : [...prev, idiomaId]
    )
  }

  const handleOutroIdiomaToggle = () => {
    setShowOutroIdioma(!showOutroIdioma)
    if (showOutroIdioma) {
      setOutroIdioma('')
    }
  }

  const handleAreaChange = (areaId: number) => {
    setSelectedAreas(prev =>
      prev.includes(areaId) ? prev.filter(id => id !== areaId) : [...prev, areaId]
    )
  }

  const getSelectedAreasText = () => {
    if (selectedAreas.length === 0) return 'Selecione as áreas de interesse'
    if (selectedAreas.length === 1) {
      const area = areas.find(a => a.id === selectedAreas[0])
      return area?.nome || ''
    }
    return `${selectedAreas.length} áreas selecionadas`
  }

  // Criar conta e refugiado usando o hook
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
          emailRedirectTo: window.location.origin,
          data: {
            nome,
            cpf,
            telefone,
            nacionalidade
          }
        }
      })

      if (error) throw error
      if (!data.user) throw new Error('Falha ao criar usuário')

      // 2. Verificar se o usuário foi confirmado automaticamente ou precisa confirmar email
      if (data.session) {
        // Usuário foi confirmado automaticamente, criar registro completo
        await createRefugiado({
          nome,
          cpf,
          telefone,
          nacionalidade,
          resumo_experiencias: resumoExperiencias,
          idiomasIds: selectedIdiomas,
          areasIds: selectedAreas,
        }, data.user.id)

        alert('Conta criada com sucesso!')
      } else {
        // Usuário precisa confirmar email
        alert('Conta criada! Verifique seu email para confirmar a conta. Após confirmar, você poderá fazer login e completar seu perfil.')
        
        // Salvar dados temporariamente no localStorage para usar após confirmação
        localStorage.setItem('pendingRefugiadoData', JSON.stringify({
          nome,
          cpf,
          telefone,
          nacionalidade,
          resumo_experiencias: resumoExperiencias,
          idiomasIds: selectedIdiomas,
          areasIds: selectedAreas,
        }))
      }

    } catch (err: unknown) {
      console.error('Erro no cadastro:', err)
      alert('Erro ao cadastrar refugiado: ' + (err instanceof Error ? err.message : 'Erro desconhecido'))
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
              <h2 className="register-header__title">Cadastro de Refugiado</h2>
              <p className="register-header__subtitle">Complete seu perfil para encontrar oportunidades</p>
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
                  placeholder="Nome completo"
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

              <div className="form-group">
                <input
                  type="tel"
                  placeholder="Número de telefone"
                  value={telefone}
                  onChange={e => setTelefone(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  placeholder="Nacionalidade"
                  value={nacionalidade}
                  onChange={e => setNacionalidade(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <fieldset className="form-fieldset">
                <legend className="form-legend">Idiomas que você fala:</legend>
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
                    <input
                      type="checkbox"
                      checked={showOutroIdioma}
                      onChange={handleOutroIdiomaToggle}
                      className="checkbox-input"
                    />
                    <span className="checkbox-label">Outros</span>
                  </label>
                  {showOutroIdioma && (
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="Digite o(s) idioma(s)"
                        value={outroIdioma}
                        onChange={e => setOutroIdioma(e.target.value)}
                        className="form-input"
                      />
                    </div>
                  )}
                </div>
              </fieldset>

              <fieldset className="form-fieldset">
                <legend className="form-legend">Áreas de atuação/interesse:</legend>
                <div className="dropdown-container">
                  <button
                    type="button"
                    className="dropdown-toggle"
                    onClick={() => setIsAreasDropdownOpen(!isAreasDropdownOpen)}
                  >
                    {getSelectedAreasText()}
                    <span className={`dropdown-arrow ${isAreasDropdownOpen ? 'open' : ''}`}>▼</span>
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
              </fieldset>

              <div className="form-group">
                <textarea
                  placeholder="Conte um pouco sobre sua experiência profissional"
                  value={resumoExperiencias}
                  onChange={e => setResumoExperiencias(e.target.value)}
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
