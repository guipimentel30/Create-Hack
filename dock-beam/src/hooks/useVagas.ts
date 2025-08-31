import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

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
  candidaturas?: Candidatura[]
}

export interface Candidatura {
  id: string
  vaga_id: string
  refugiado_id: string
  status: 'aplicado' | 'em_analise' | 'aprovado' | 'reprovado' | 'entrevista_agendada'
  data_aplicacao: string
  notas?: string
  link_entrevista?: string
  data_entrevista?: string
  refugiado: {
    id: string
    nome: string
    idade?: number
    nacionalidade?: string
  }
}

export interface CreateVagaData {
  titulo: string
  idioma_id: number
  area_atuacao_id: number
  descricao?: string
  requisitos?: string
  salario_min?: number
  salario_max?: number
}

interface UseVagasHook {
  vagas: Vaga[]
  loading: boolean
  error: string | null
  stats: {
    vagasAbertas: number
    novosCandidatos: number
  }
  fetchVagas: () => Promise<void>
  getVagaById: (id: string) => Vaga | undefined
  getCandidaturasByVaga: (vagaId: string) => Promise<Candidatura[]>
  updateCandidaturaStatus: (candidaturaId: string, status: string, notas?: string) => Promise<void>
  encerrarVaga: (vagaId: string) => Promise<void>
  createVaga: (vagaData: CreateVagaData) => Promise<string>
  updateVaga: (vagaId: string, vagaData: CreateVagaData) => Promise<void>
  deleteVaga: (vagaId: string) => Promise<void>
  clearError: () => void
}

export function useVagas(): UseVagasHook {
  const [vagas, setVagas] = useState<Vaga[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({ vagasAbertas: 0, novosCandidatos: 0 })

  const fetchVagas = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id) {
        throw new Error('Usuário não autenticado')
      }

      // Buscar vagas da empresa com dados relacionados
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
        .eq('empresa_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Buscar contagem de candidaturas para cada vaga
      const vagasWithCounts = await Promise.all(
        (data || []).map(async (vaga: any) => {
          const { count } = await supabase
            .from('candidaturas')
            .select('*', { count: 'exact', head: true })
            .eq('vaga_id', vaga.id)

          return {
            ...vaga,
            idioma: Array.isArray(vaga.idioma) ? vaga.idioma[0] : vaga.idioma,
            area_atuacao: Array.isArray(vaga.area_atuacao) ? vaga.area_atuacao[0] : vaga.area_atuacao,
            candidaturas_count: count || 0
          } as Vaga
        })
      )

      setVagas(vagasWithCounts)

      // Calcular estatísticas
      const vagasAbertas = vagasWithCounts.filter(v => v.status === 'ativa').length
      
      // Candidatos dos últimos 7 dias
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const { count: novosCandidatos } = await supabase
        .from('candidaturas')
        .select('*', { count: 'exact', head: true })
        .in('vaga_id', vagasWithCounts.map(v => v.id))
        .gte('data_aplicacao', sevenDaysAgo.toISOString())

      setStats({ vagasAbertas, novosCandidatos: novosCandidatos || 0 })

    } catch (err) {
      console.error('Erro ao buscar vagas:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar vagas')
    } finally {
      setLoading(false)
    }
  }

  const getCandidaturasByVaga = async (vagaId: string): Promise<Candidatura[]> => {
    try {
      const { data, error } = await supabase
        .from('candidaturas')
        .select(`
          id,
          vaga_id,
          refugiado_id,
          status,
          data_aplicacao,
          notas,
          link_entrevista,
          data_entrevista,
          refugiado:refugiados(
            id,
            nome,
            idade,
            nacionalidade
          )
        `)
        .eq('vaga_id', vagaId)
        .order('data_aplicacao', { ascending: false })

      if (error) throw error
      const processedCandidaturas = (data || []).map((candidatura: any) => ({
        ...candidatura,
        refugiado: candidatura.refugiado || null
      })) as Candidatura[]
      
      return processedCandidaturas
    } catch (err) {
      console.error('Erro ao buscar candidaturas:', err)
      throw err
    }
  }

  const updateCandidaturaStatus = async (
    candidaturaId: string, 
    status: string, 
    notas?: string
  ): Promise<void> => {
    try {
      const updateData: { status: string; notas?: string } = { status }
      if (notas !== undefined) updateData.notas = notas

      const { error } = await supabase
        .from('candidaturas')
        .update(updateData)
        .eq('id', candidaturaId)

      if (error) throw error
      
      // Refresh vagas to update counts
      await fetchVagas()
    } catch (err) {
      console.error('Erro ao atualizar candidatura:', err)
      throw err
    }
  }

  const encerrarVaga = async (vagaId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('vagas')
        .update({ status: 'encerrada' })
        .eq('id', vagaId)

      if (error) throw error
      
      // Refresh vagas
      await fetchVagas()
    } catch (err) {
      console.error('Erro ao encerrar vaga:', err)
      throw err
    }
  }

  const updateVaga = async (vagaId: string, vagaData: CreateVagaData): Promise<void> => {
    try {
      const { error } = await supabase
        .from('vagas')
        .update(vagaData)
        .eq('id', vagaId)

      if (error) throw error
      
      // Refresh vagas
      await fetchVagas()
    } catch (err) {
      console.error('Erro ao atualizar vaga:', err)
      throw err
    }
  }

  const deleteVaga = async (vagaId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('vagas')
        .delete()
        .eq('id', vagaId)

      if (error) throw error
      
      // Refresh vagas
      await fetchVagas()
    } catch (err) {
      console.error('Erro ao deletar vaga:', err)
      throw err
    }
  }

  const createVaga = async (vagaData: CreateVagaData): Promise<string> => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await supabase
        .from('vagas')
        .insert([
          {
            empresa_id: session.user.id,
            ...vagaData,
            status: 'ativa'
          }
        ])
        .select()

      if (error) throw error

      await fetchVagas()

      return data[0].id
    } catch (err) {
      console.error('Erro ao criar vaga:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchVagas()
  }, [])

  const getVagaById = (id: string): Vaga | undefined => {
    return vagas.find(vaga => vaga.id === id)
  }

  const clearError = () => {
    setError(null)
  }

  return {
    vagas,
    loading,
    error,
    stats,
    fetchVagas,
    getVagaById,
    getCandidaturasByVaga,
    updateCandidaturaStatus,
    encerrarVaga,
    createVaga,
    updateVaga,
    deleteVaga,
    clearError
  }
}
