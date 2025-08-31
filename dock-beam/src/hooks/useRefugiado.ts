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

export interface Vaga {
  id: string
  titulo: string
  idioma_id: number
  area_atuacao_id: number
  descricao?: string
  requisitos?: string
  salario_min?: number
  salario_max?: number
  status: 'ativa' | 'encerrada' | 'pausada'
  created_at: string
  updated_at: string
  idioma: {
    id: number
    nome: string
  }
  area_atuacao: {
    id: number
    nome: string
  }
  candidaturas_count: number
}

export interface TurmaDisponivel {
  id: string
  semestre_ano: string
  nivel_proficiencia: string
  idioma: {
    id: number
    nome: string
  }
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
  vagas: Vaga[]
  turmasDisponiveis: TurmaDisponivel[]
  loading: boolean
  vagasLoading: boolean
  turmasLoading: boolean
  error: string | null
  vagasError: string | null
  turmasError: string | null
  createRefugiado: (refugiadoData: CreateRefugiadoData, userId?: string) => Promise<void>
  fetchVagasDisponiveis: () => Promise<void>
  fetchTurmasDisponiveis: () => Promise<void>
  clearError: () => void
  createCandidatura: (vagaId: string) => Promise<void>
}

export function useRefugiado(): UseRefugiadoHook {
  const [idiomas, setIdiomas] = useState<Idioma[]>([])
  const [areas, setAreas] = useState<AreaAtuacao[]>([])
  const [vagas, setVagas] = useState<Vaga[]>([])
  const [turmasDisponiveis, setTurmasDisponiveis] = useState<TurmaDisponivel[]>([])
  const [loading, setLoading] = useState(false)
  const [vagasLoading, setVagasLoading] = useState(false)
  const [turmasLoading, setTurmasLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [vagasError, setVagasError] = useState<string | null>(null)
  const [turmasError, setTurmasError] = useState<string | null>(null)

  // Buscar idiomas e áreas disponíveis
  useEffect(() => {
    fetchIdiomas()
    fetchAreas()
    fetchVagasDisponiveis()
    fetchTurmasDisponiveis()
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

  const fetchVagasDisponiveis = async () => {
    setVagasLoading(true)
    setVagasError(null)

    try {
      const { data, error } = await supabase
        .from('vagas')
        .select(`
          id,
          titulo,
          idioma_id,
          area_atuacao_id,
          descricao,
          requisitos,
          salario_min,
          salario_max,
          status,
          created_at,
          updated_at,
          idioma:idiomas(id, nome),
          area_atuacao:areas_atuacao(id, nome)
        `)
        .eq('status', 'ativa')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Buscar contagem de candidaturas para cada vaga
      const vagasWithCounts = await Promise.all(
        (data || []).map(async (vaga) => {
          const { count } = await supabase
            .from('candidaturas')
            .select('*', { count: 'exact', head: true })
            .eq('vaga_id', vaga.id)

          return {
            ...vaga,
            candidaturas_count: count || 0
          }
        })
      )

      setVagas(vagasWithCounts)
    } catch (err) {
      console.error('Erro ao buscar vagas:', err)
      setVagasError(err instanceof Error ? err.message : 'Erro ao carregar vagas')
    } finally {
      setVagasLoading(false)
    }
  }

  const fetchTurmasDisponiveis = async () => {
    setTurmasLoading(true)
    setTurmasError(null)

    try {
      const { data, error } = await supabase
        .from('turmas')
        .select(`
          id,
          semestre_ano,
          nivel_proficiencia,
          idioma:idiomas(id, nome)
        `)
        .order('semestre_ano', { ascending: false })

      if (error) throw error

      setTurmasDisponiveis(data || [])
    } catch (err) {
      console.error('Erro ao buscar turmas:', err)
      setTurmasError(err instanceof Error ? err.message : 'Erro ao carregar turmas')
    } finally {
      setTurmasLoading(false)
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

  const createCandidatura = async (vagaId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id) {
        throw new Error('Usuário não autenticado. Faça login novamente.')
      }

      // Verificar se o usuário é um refugiado registrado
      const { data: refugiado, error: refugiadoError } = await supabase
        .from('refugiados')
        .select('id')
        .eq('id', session.user.id)
        .single()

      if (refugiadoError || !refugiado) {
        throw new Error('Usuário não encontrado como refugiado. Complete seu cadastro primeiro.')
      }

      const { error } = await supabase
        .from('candidaturas')
        .insert([{
          vaga_id: vagaId,
          refugiado_id: session.user.id
        }])

      if (error) {
        if (error.code === '23505') {
          throw new Error('Você já se candidatou a esta vaga.')
        }
        throw new Error(`Erro no banco de dados: ${error.message}`)
      }
    } catch (err) {
      console.error('Erro ao criar candidatura:', err)
      throw err
    }
  }

  const clearError = () => {
    setError(null)
  }

  return {
    idiomas,
    areas,
    vagas,
    turmasDisponiveis,
    loading,
    vagasLoading,
    turmasLoading,
    error,
    vagasError,
    turmasError,
    createRefugiado,
    fetchVagasDisponiveis,
    fetchTurmasDisponiveis,
    clearError,
    createCandidatura
  }
}
