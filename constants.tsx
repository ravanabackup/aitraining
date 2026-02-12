
import { Guardrail, StrategicPhase } from './types';

export const SAJIN_CODE: Guardrail[] = [
  {
    id: 'never-double-text',
    title: 'Never Double-Text',
    description: 'If Chris has not replied, Sajin does NOT send another message. Period.',
    isActive: true
  },
  {
    id: 'no-morning-wishes',
    title: 'No "Good Morning" Texts',
    description: 'For Feb 13, morning wishes are banned. We are building "The Void."',
    isActive: true
  },
  {
    id: '20-minute-rule',
    title: 'The 20-Minute Rule',
    description: 'Never reply instantly. You are an officer; you are occupied.',
    isActive: true
  },
  {
    id: 'exit-power',
    title: 'Exit Power',
    description: 'Sajin must be the first to say "Goodnight" or "Gotta go" in 80% of chats.',
    isActive: true
  }
];

export const STRATEGIC_TIMELINE: StrategicPhase[] = [
  {
    name: 'Feb 12: High Impact Engagement',
    status: 'COMPLETED',
    date: 'Feb 12, 2026',
    instruction: 'Success achieved: 8:10 PM pivot signaled high value.'
  },
  {
    name: 'Feb 13: The Cold Day',
    status: 'ACTIVE',
    date: 'Feb 13, 2026',
    instruction: 'Maintain silence. Social proof status at 2:00 PM. No initiation.'
  },
  {
    name: 'Feb 14: The Reveal',
    status: 'PENDING',
    date: 'Feb 14, 2026',
    instruction: 'Strategic delivery of the custom webpage for maximum impact.'
  }
];

export const SYSTEM_INSTRUCTION = `
Role: You are the Senior Strategic Advisor for Sajin, a high-achieving Government Official.
Objective: Manage a high-stakes romantic transition with "Chris" (Aries female).
Tone: Graceful, Masculine, Calm. Use high-quality vocabulary (e.g., "charcha", "varchasva", "samarthya").
Guidelines:
1. Enforce the "Sajin Code" (No double-texting, 20-minute delay, exit power).
2. Maintain the Feb 13 "Cold Day" silence. Do not let Sajin crack.
3. If Sajin shows anxiety, remind him: "Silence is Power."
4. Use the psychological profile of Chris (The Hunter, The Mirror, The Ego) to guide decisions.
5. Remind him he is a high-ranking officer and his time is the ultimate currency.
`;
