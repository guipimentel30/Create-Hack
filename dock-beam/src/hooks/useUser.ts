import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export interface Idioma {
  id: number
  nome: string
  created_at?: string
}

interface CreateUserData {
  nome: string
  cpf: string
  telefone: string
  formacao: boolean
  atuacao_em_missao: boolean
  relato: string
  idiomasIds: number[]
  file?: File
}

interface UseUserHook {
  idiomas: Idioma[]
  loading: boolean
  error: string | null
  createUser: (userData: CreateUserData, userId?: string) => Promise<void>
  uploadFile: (file: File, userId: string) => Promise<string | null>
  clearError: () => void
}

export function useUser(): UseUserHook {
  const [idiomas, setIdiomas] = useState<Idioma[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buscar idiomas disponíveis
  useEffect(() => {
    fetchIdiomas()
  }, [])

  const fetchIdiomas = async () => {
    try {
      const { data, error } = await supabase
        .from('idiomas')
        .select('*')
        .order('nome')

      if (error) throw error
      setIdiomas(data || [])
    } catch (err) {
      console.error('Erro ao buscar idiomas:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar idiomas')
    }
  }

  // Upload de arquivo para storage
  const uploadFile = async (file: File, userId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/comprovante.${fileExt}`
      const filePath = `comprovantes/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('comprovantes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Retorna o caminho do arquivo
      return filePath
    } catch (err) {
      console.error('Erro no upload:', err)
      throw err
    }
  }

  // Criar usuário completo
  const createUser = async (userData: CreateUserData, userId?: string) => {
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

      // Upload do arquivo se fornecido
      let comprovanteUrl: string | null = null
      if (userData.file) {
        comprovanteUrl = await uploadFile(userData.file, finalUserId)
      }

      // Verificar se usuário já existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', finalUserId)
        .single()

      if (existingUser) {
        throw new Error('Usuário já cadastrado')
      }

      // Criar registro do usuário
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          id: finalUserId,
          nome: userData.nome,
          cpf: userData.cpf,
          formacao: userData.formacao,
          comprovante: comprovanteUrl,
          atuacao_em_missao: userData.atuacao_em_missao,
          relato: userData.relato || null
        }])

      if (userError) throw userError

      // Associar idiomas ao usuário
      if (userData.idiomasIds.length > 0) {
        const userIdiomas = userData.idiomasIds.map(idiomaId => ({
          user_id: finalUserId,
          idioma_id: idiomaId
        }))

        const { error: idiomasError } = await supabase
          .from('user_idiomas')
          .insert(userIdiomas)

        if (idiomasError) throw idiomasError
      }

    } catch (err) {
      console.error('Erro ao criar usuário:', err)
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
    idiomas,
    loading,
    error,
    createUser,
    uploadFile,
    clearError
  }
}