import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../css/UserRegister.css';

interface CreateVagaData {
  titulo: string;
  idioma_id: number;
  area_atuacao_id: number;
  descricao?: string;
  requisitos?: string;
  salario_min?: number;
  salario_max?: number;
}

interface VagaFormProps {
  onSubmit: (vagaData: CreateVagaData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface Idioma {
  id: number;
  nome: string;
}

interface AreaAtuacao {
  id: number;
  nome: string;
}

export default function VagaForm({ onSubmit, onCancel, loading = false }: VagaFormProps) {
  const [formData, setFormData] = useState<CreateVagaData>({
    titulo: '',
    idioma_id: 0,
    area_atuacao_id: 0,
    descricao: '',
    requisitos: '',
    salario_min: undefined,
    salario_max: undefined
  });
  
  const [idiomas, setIdiomas] = useState<Idioma[]>([]);
  const [areas, setAreas] = useState<AreaAtuacao[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchIdiomas();
    fetchAreas();
  }, []);

  const fetchIdiomas = async () => {
    try {
      const { data, error } = await supabase
        .from('idiomas')
        .select('id, nome')
        .order('nome');
      
      if (error) throw error;
      setIdiomas(data || []);
    } catch (err) {
      console.error('Erro ao buscar idiomas:', err);
    }
  };

  const fetchAreas = async () => {
    try {
      const { data, error } = await supabase
        .from('areas_atuacao')
        .select('id, nome')
        .order('nome');
      
      if (error) throw error;
      setAreas(data || []);
    } catch (err) {
      console.error('Erro ao buscar áreas:', err);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'Título é obrigatório';
    }

    if (!formData.idioma_id || formData.idioma_id === 0) {
      newErrors.idioma_id = 'Selecione um idioma';
    }

    if (!formData.area_atuacao_id || formData.area_atuacao_id === 0) {
      newErrors.area_atuacao_id = 'Selecione uma área';
    }

    if (formData.salario_min && formData.salario_max && formData.salario_min > formData.salario_max) {
      newErrors.salario_max = 'Salário máximo deve ser maior que o mínimo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('Erro ao criar vaga:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateVagaData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="user-register-page">
      <div className="register-hero">
        <div className="register-hero__overlay"></div>
        <div className="register-hero__content">
          <div className="register-container">
            <div className="register-header">
              <h2 className="register-header__title">➕ Criar Nova Vaga</h2>
              <p className="register-header__subtitle">Preencha as informações da vaga para atrair os melhores candidatos</p>
            </div>
            
            <form className="register-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Título da Vaga *</label>
                <input
                  type="text"
                  className={`form-input ${errors.titulo ? 'form-input--error' : ''}`}
                  value={formData.titulo}
                  onChange={(e) => handleInputChange('titulo', e.target.value)}
                  placeholder="Ex: Professor de Inglês - Básico"
                  disabled={submitting}
                />
                {errors.titulo && <span className="error-text">{errors.titulo}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Idioma *</label>
                <select
                  className={`form-input ${errors.idioma_id ? 'form-input--error' : ''}`}
                  value={formData.idioma_id}
                  onChange={(e) => handleInputChange('idioma_id', parseInt(e.target.value))}
                  disabled={submitting}
                >
                  <option value={0}>Selecione um idioma</option>
                  {idiomas.map((idioma) => (
                    <option key={idioma.id} value={idioma.id}>
                      {idioma.nome}
                    </option>
                  ))}
                </select>
                {errors.idioma_id && <span className="error-text">{errors.idioma_id}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Área *</label>
                <select
                  className={`form-input ${errors.area_atuacao_id ? 'form-input--error' : ''}`}
                  value={formData.area_atuacao_id}
                  onChange={(e) => handleInputChange('area_atuacao_id', parseInt(e.target.value))}
                  disabled={submitting}
                >
                  <option value={0}>Selecione uma área</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.nome}
                    </option>
                  ))}
                </select>
                {errors.area_atuacao_id && <span className="error-text">{errors.area_atuacao_id}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Descrição da Vaga</label>
                <textarea
                  className="form-input form-textarea"
                  value={formData.descricao || ''}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  placeholder="Descreva as responsabilidades e objetivos da vaga..."
                  rows={4}
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Requisitos</label>
                <textarea
                  className="form-input form-textarea"
                  value={formData.requisitos || ''}
                  onChange={(e) => handleInputChange('requisitos', e.target.value)}
                  placeholder="Liste os requisitos necessários para a vaga..."
                  rows={4}
                  disabled={submitting}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Salário Mínimo (R$)</label>
                  <input
                    type="number"
                    className={`form-input ${errors.salario_min ? 'form-input--error' : ''}`}
                    value={formData.salario_min || ''}
                    onChange={(e) => handleInputChange('salario_min', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="0,00"
                    min="0"
                    step="0.01"
                    disabled={submitting}
                  />
                  {errors.salario_min && <span className="error-text">{errors.salario_min}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Salário Máximo (R$)</label>
                  <input
                    type="number"
                    className={`form-input ${errors.salario_max ? 'form-input--error' : ''}`}
                    value={formData.salario_max || ''}
                    onChange={(e) => handleInputChange('salario_max', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="0,00"
                    min="0"
                    step="0.01"
                    disabled={submitting}
                  />
                  {errors.salario_max && <span className="error-text">{errors.salario_max}</span>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button
                  type="button"
                  className="job-action-btn secondary"
                  onClick={onCancel}
                  disabled={submitting}
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="register-submit"
                  disabled={submitting || loading}
                  style={{ flex: 2 }}
                >
                  {submitting || loading ? (
                    <div className="loading-content">
                      <div className="spinner"></div>
                      Criando vaga...
                    </div>
                  ) : (
                    '➕ Criar Vaga'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
