import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export interface Turma {
  id: string
  semestre_ano: string
  nivel_proficiencia: string
  professor_id: string
  created_at: string
  updated_at: string
  idioma: {
    id: number
    nome: string
  }
  professor: {
    id: string
    nome: string
    email: string
  }
  horarios: TurmaHorario[]
  refugiados: RefugiadoTurma[]
}

export interface TurmaHorario {
  id: string
  dia_semana: string
  horario_inicio: string
  horario_fim: string
}

export interface RefugiadoTurma {
  id: string
  status: string
  data_inscricao: string
  refugiado: {
    id: string
    nome: string
    nacionalidade: string
  }
}

interface UseTurmasHook {
  turmas: Turma[]
  loading: boolean
  error: string | null
  fetchTurmas: () => Promise<void>
  getTurmaById: (id: string) => Turma | undefined
  clearError: () => void
}

export function useTurmas(): UseTurmasHook {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buscar turmas do professor logado
  const fetchTurmas = async () => {
    setLoading(true)
    setError(null)

    try {
      // Obter ID do usuário autenticado
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id) {
        throw new Error('Usuário não autenticado')
      }

      // Buscar turmas do professor com dados relacionados
      const { data, error } = await supabase
        .from('turmas')
        .select(`
          id,
          semestre_ano,
          nivel_proficiencia,
          professor_id,
          created_at,
          updated_at,
          idioma:idiomas(id, nome),
          professor:users(id, nome),
          horarios:turma_horarios(
            id,
            dia_semana,
            horario_inicio,
            horario_fim
          ),
          refugiados:refugiado_turmas(
            id,
            status,
            data_inscricao,
            refugiado:refugiados(
              id,
              nome,
              nacionalidade
            )
          )
        `)
        .eq('professor_id', session.user.id)
        .order('semestre_ano', { ascending: false })

      if (error) throw error
      setTurmas(data || [])
    } catch (err) {
      console.error('Erro ao buscar turmas:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar turmas')
    } finally {
      setLoading(false)
    }
  }

  // Buscar turmas ao montar o componente
  useEffect(() => {
    fetchTurmas()
  }, [])

  // Buscar turma específica por ID
  const getTurmaById = (id: string): Turma | undefined => {
    return turmas.find(turma => turma.id === id)
  }

  const clearError = () => {
    setError(null)
  }

  return {
    turmas,
    loading,
    error,
    fetchTurmas,
    getTurmaById,
    clearError
  }
}
