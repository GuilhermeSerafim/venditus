
export type SituacaoNegocio = 'NEGOCIANDO' | 'GANHO' | 'PERDIDO';

export interface MesaNegocios {
    id: string;
    organization_id: string;
    responsavel_id: string;
    lead_id: string | null;
    empresa: string;
    data_reuniao: string; // ISO date string
    compareceu: boolean;
    pix_compromisso: boolean;
    situacao: SituacaoNegocio;
    motivo_perda: string | null;
    valor_negocio: number;
    notas: string | null;
    created_at: string;
    updated_at: string;
}

export interface ScoreConfig {
    id: string;
    organization_id: string;
    event_type: string;
    points: number;
    description: string;
    is_active: boolean;
}

export interface ScoreEvent {
    id: string;
    user_id: string;
    organization_id: string;
    event_type: string;
    points: number;
    reference_id: string | null;
    reference_table: string | null;
    metadata: Record<string, any>; // JSON
    created_at: string;
}

export interface UserScore {
    user_id: string;
    organization_id: string;
    total_score: number;
    updated_at: string;
}

export interface UserDailyActivity {
    id: string;
    user_id: string;
    organization_id: string;
    activity_date: string; // Date string (YYYY-MM-DD)
    posts_count: number;
    interactions_count: number;
    completed: boolean;
    created_at: string;
}
