import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export interface SetorAtuacao {
  id: number
  nome: string
  created_at?: string
}

interface CreateEmpresaData {
  nome_empresa: string
  cnpj: string
  setor_atuacao: string
  website?: string
  descricao: string
  nome_responsavel: string
  email_contato: string
  telefone_comercial?: string
}

interface UseEmpresaHook {
  setores: SetorAtuacao[]
  loading: boolean
  error: string | null
  createEmpresa: (empresaData: CreateEmpresaData, userId?: string) => Promise<void>
  clearError: () => void
}

export function useEmpresa(): UseEmpresaHook {
  const [setores, setSetores] = useState<SetorAtuacao[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buscar setores disponíveis
  useEffect(() => {
    fetchSetores()
  }, [])

  const fetchSetores = async () => {
    try {
      const { data, error } = await supabase
        .from('setores_atuacao')
        .select('*')
        .order('nome')

      if (error) throw error
      setSetores(data || [])
    } catch (err) {
      console.error('Erro ao buscar setores:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar setores de atuação')
    }
  }

  // Criar empresa completa
  const createEmpresa = async (empresaData: CreateEmpresaData, userId?: string) => {
    setLoading(true)
    setError(null)

    try {
      // Obter ID do usuário autenticado se não fornecido
      let finalUserId = userId
      if (!finalUserId) {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user?.id) {
          throw new Error('Usuário não autenticado')
        }
        finalUserId = session.user.id
      }

      // Verificar se empresa já existe
      const { data: existingEmpresa } = await supabase
        .from('empresas')
        .select('id')
        .eq('id', finalUserId)
        .single()

      if (existingEmpresa) {
        throw new Error('Empresa já cadastrada')
      }

      // Criar registro da empresa
      const { error: empresaError } = await supabase
        .from('empresas')
        .insert([{
          id: finalUserId,
          nome_empresa: empresaData.nome_empresa,
          cnpj: empresaData.cnpj,
          setor_atuacao: empresaData.setor_atuacao,
          website: empresaData.website || null,
          descricao: empresaData.descricao,
          nome_responsavel: empresaData.nome_responsavel,
          email_contato: empresaData.email_contato,
          telefone_comercial: empresaData.telefone_comercial || null
        }])

      if (empresaError) throw empresaError

    } catch (err) {
      console.error('Erro ao criar empresa:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return {
    setores,
    loading,
    error,
    createEmpresa,
    clearError
  }
}
