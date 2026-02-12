
export interface Guardrail {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
}

export interface StrategicPhase {
  name: string;
  status: 'COMPLETED' | 'ACTIVE' | 'PENDING';
  date: string;
  instruction: string;
}

export interface AdvisorMessage {
  role: 'advisor' | 'user';
  text: string;
  timestamp: number;
}
