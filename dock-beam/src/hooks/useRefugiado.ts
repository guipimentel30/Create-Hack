import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export interface Idioma {
  id: number
  nome: string
  created_at?: string
}

export interface AreaAtuacao {
  id: number
  nome: string
  created_at?: string
}

interface CreateRefugiadoData {
  nome: string
  cpf: string
  telefone: string
  nacionalidade: string
  resumo_experiencias: string
  idiomasIds: number[]
  areasIds: number[]
}

interface UseRefugiadoHook {
  idiomas: Idioma[]
  areas: AreaAtuacao[]
  loading: boolean
  error: string | null
  createRefugiado: (refugiadoData: CreateRefugiadoData, userId?: string) => Promise<void>
  clearError: () => void
}

export function useRefugiado(): UseRefugiadoHook {
  const [idiomas, setIdiomas] = useState<Idioma[]>([])
  const [areas, setAreas] = useState<AreaAtuacao[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buscar idiomas e áreas disponíveis
  useEffect(() => {
    fetchIdiomas()
    fetchAreas()
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

  const fetchAreas = async () => {
    try {
      const { data, error } = await supabase
        .from('areas_atuacao')
        .select('*')
        .order('nome')

      if (error) throw error
      setAreas(data || [])
    } catch (err) {
      console.error('Erro ao buscar áreas:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar áreas de atuação')
    }
  }

  // Criar refugiado completo
  const createRefugiado = async (refugiadoData: CreateRefugiadoData, userId?: string) => {
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

      // Verificar se refugiado já existe
      const { data: existingRefugiado } = await supabase
        .from('refugiados')
        .select('id')
        .eq('id', finalUserId)
        .single()

      if (existingRefugiado) {
        throw new Error('Refugiado já cadastrado')
      }

      // Criar registro do refugiado
      const { error: refugiadoError } = await supabase
        .from('refugiados')
        .insert([{
          id: finalUserId,
          nome: refugiadoData.nome,
          cpf: refugiadoData.cpf,
          telefone: refugiadoData.telefone,
          nacionalidade: refugiadoData.nacionalidade,
          resumo_experiencias: refugiadoData.resumo_experiencias || null
        }])

      if (refugiadoError) throw refugiadoError

      // Associar idiomas ao refugiado
      if (refugiadoData.idiomasIds.length > 0) {
        const refugiadoIdiomas = refugiadoData.idiomasIds.map(idiomaId => ({
          refugiado_id: finalUserId,
          idioma_id: idiomaId
        }))

        const { error: idiomasError } = await supabase
          .from('refugiado_idiomas')
          .insert(refugiadoIdiomas)

        if (idiomasError) throw idiomasError
      }

      // Associar áreas de atuação ao refugiado
      if (refugiadoData.areasIds.length > 0) {
        const refugiadoAreas = refugiadoData.areasIds.map(areaId => ({
          refugiado_id: finalUserId,
          area_id: areaId
        }))

        const { error: areasError } = await supabase
          .from('refugiado_areas')
          .insert(refugiadoAreas)

        if (areasError) throw areasError
      }

    } catch (err) {
      console.error('Erro ao criar refugiado:', err)
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
    areas,
    loading,
    error,
    createRefugiado,
    clearError
  }
}
