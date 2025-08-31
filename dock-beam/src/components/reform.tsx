import { useState } from 'react'
import { useReform } from '../hooks/useReform'

interface UserInputProps {
  onSubmit?: (data: { nome: string; cpf: string }) => void
  onSuccess?: () => void
}

export default function UserInput({ onSubmit, onSuccess }: UserInputProps) {
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { loading, error, success, createUserRecord, reset } = useReform()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const userData = { nome, cpf, email, password }
    
    // Chama callback personalizado se fornecido
    if (onSubmit) {
      onSubmit({ nome, cpf })
    }
    
    // Cria o usuário no Supabase
    await createUserRecord(userData)
    
    // Chama callback de sucesso se fornecido
    if (success && onSuccess) {
      onSuccess()
    }
  }

  const formatCPF = (value: string) => {
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, '')
    
    // Aplica a máscara XXX.XXX.XXX-XX
    if (digits.length <= 11) {
      return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    }
    return digits.slice(0, 11)
      .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setCpf(formatted)
  }

  return (
    <div style={{ maxWidth: '400px', margin: '20px auto', padding: '20px' }}>
      <h2>Dados do Usuário</h2>
      
      {/* Mensagens de status */}
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          border: '1px solid #f5c6cb', 
          borderRadius: '4px',
          marginBottom: '15px'
        }}>
          {error}
          <button 
            type="button" 
            onClick={reset}
            style={{ 
              marginLeft: '10px', 
              padding: '2px 8px', 
              fontSize: '12px',
              backgroundColor: 'transparent',
              border: '1px solid #721c24',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Tentar novamente
          </button>
        </div>
      )}
      
      {success && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          border: '1px solid #c3e6cb', 
          borderRadius: '4px',
          marginBottom: '15px'
        }}>
          Usuário criado com sucesso!
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Email:
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite seu email"
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>

        <div>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Senha:
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua senha (mínimo 6 caracteres)"
            required
            minLength={6}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>

        <div>
          <label htmlFor="nome" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Nome:
          </label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Digite seu nome completo"
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>

        <div>
          <label htmlFor="cpf" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            CPF:
          </label>
          <input
            type="text"
            id="cpf"
            value={cpf}
            onChange={handleCPFChange}
            placeholder="000.000.000-00"
            maxLength={14}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 20px',
            backgroundColor: loading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '10px',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Salvando...' : 'Enviar'}
        </button>
      </form>
    </div>
  )
}