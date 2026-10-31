import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { SolarLeadSchema, type SolarLead } from '../../shared/src/schemas/models';

export async function submitSolarLead(leadData: Omit<SolarLead, 'id' | 'createdAt'>): Promise<{ success: boolean; leadId?: string; error?: string }> {
  try {
    const leadRef = doc(collection(db, 'solarLeads'));
    const fullRecord: SolarLead = {
      ...leadData,
      id: leadRef.id,
      createdAt: new Date().toISOString()
    };
    SolarLeadSchema.parse(fullRecord);
    await setDoc(leadRef, fullRecord);
    return { success: true, leadId: leadRef.id };
  } catch (err) {
    console.error('Submit solar lead error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Failed to submit quote request' };
  }
}

