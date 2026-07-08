export type RequestRow = {
  id: string;
  user_id: string | null;
  title: string;
  description: string;
  budget_proposed: number | null;
  final_price: number | null;
  price_justification: string | null;
  status: string | null;
  complexity: string | null;
  urgency: string | null;
  ai_phase: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type AnalysisRow = {
  id: string;
  request_id: string;
  ai_provider: string;
  summary: string | null;
  deliverables: string[] | null;
  estimated_price_fcfa: number | null;
  clarification_questions: string[] | null;
  created_at: string | null;
};

export type DeliverableRow = {
  id: string;
  request_id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_path: string | null;
  file_type: string | null;
  uploaded_by: string | null;
  created_at: string | null;
};

export type MessageRow = {
  id: string;
  request_id: string;
  sender_id: string;
  content: string;
  created_at: string | null;
  read: boolean;
  sender_name?: string;
};

export type PaymentRow = {
  id: string;
  request_id: string;
  user_id: string;
  amount: number;
  currency: string;
  provider: string;
  status: string;
  payment_provider_id: string | null;
  provider_response: any;
  completed_at: string | null;
  created_at: string | null;
};
