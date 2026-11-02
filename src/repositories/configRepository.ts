import { 
  type EmissionFactors,
  type SubsidyRules,
  type DiscomTariff
} from '../../shared/src/schemas/config';
import { 
  getEmissionFactorsConfig, 
  getSubsidyRulesConfig, 
  getTariffsConfig 
} from '../services/configService';

/**
 * Repository to retrieve verified reference configs from Firestore config/*
 * Delegates to configService. Never hardcodes values.
 */
export async function getEmissionFactors(): Promise<EmissionFactors> {
  const { data } = await getEmissionFactorsConfig();
  return data as unknown as EmissionFactors;
}

export async function getSubsidyRules(): Promise<SubsidyRules> {
  const { data } = await getSubsidyRulesConfig();
  return data as unknown as SubsidyRules;
}

export async function getDiscomTariff(discomId: string = 'UGVCL'): Promise<DiscomTariff> {
  const { data } = await getTariffsConfig();
  const tariffs = data as any;
  const match = tariffs.discoms?.[discomId] || (Array.isArray(tariffs.discoms) ? tariffs.discoms[0] : null);
  if (!match) {
    throw new Error(`Tariff configuration for DISCOM "${discomId}" not found in config/tariffs.`);
  }
  return match as DiscomTariff;
}
