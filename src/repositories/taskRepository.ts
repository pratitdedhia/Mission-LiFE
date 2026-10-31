import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { TaskSchema, type Task } from '../../shared/src/schemas/models';

export async function getActiveTasks(): Promise<Task[]> {
  try {
    const snap = await getDocs(collection(db, 'tasks'));
    if (!snap.empty) {
      const tasks: Task[] = [];
      snap.forEach(d => {
        try {
          tasks.push(TaskSchema.parse(d.data()));
        } catch (e) {
          console.warn('Task parsing warning for id:', d.id, e);
        }
      });
      if (tasks.length > 0) {
        return tasks.sort((a, b) => a.order - b.order);
      }
    }
  } catch (err) {
    console.warn('Failed to load tasks from Firestore, serving initial validated seed set:', err);
  }

  // Fallback catalog compliant with 7 LiFE themes
  return [
    {
      id: 'task_energy_ac24',
      themeId: 'save_energy',
      titleKey: 'tasks.ac24.title',
      descriptionKey: 'tasks.ac24.desc',
      impactSummary: 'Save 2.4 kWh per 8-hr cooling cycle',
      basePoints: 50,
      co2SavingsKg: 2.0,
      requiresPhotoProof: true,
      active: true,
      order: 1
    },
    {
      id: 'task_energy_peak_shift',
      themeId: 'save_energy',
      titleKey: 'tasks.peakShift.title',
      descriptionKey: 'tasks.peakShift.desc',
      impactSummary: 'Avoid peak peaker emission and save ToD tariffs',
      basePoints: 60,
      co2SavingsKg: 3.2,
      requiresPhotoProof: false,
      active: true,
      order: 2
    },
    {
      id: 'task_energy_solar_feasibility',
      themeId: 'save_energy',
      titleKey: 'tasks.solarCalc.title',
      descriptionKey: 'tasks.solarCalc.desc',
      impactSummary: 'Assess rooftop potential for PM Surya Ghar',
      basePoints: 80,
      co2SavingsKg: 6.0,
      requiresPhotoProof: false,
      active: true,
      order: 3
    },
    {
      id: 'task_water_bucket_bath',
      themeId: 'save_water',
      titleKey: 'tasks.bucketBath.title',
      descriptionKey: 'tasks.bucketBath.desc',
      impactSummary: 'Save 65 liters of treated municipal water',
      basePoints: 40,
      co2SavingsKg: 0.6,
      requiresPhotoProof: false,
      active: true,
      order: 4
    },
    {
      id: 'task_plastic_cloth_bag',
      themeId: 'reduce_plastic',
      titleKey: 'tasks.clothBag.title',
      descriptionKey: 'tasks.clothBag.desc',
      impactSummary: 'Eliminate 3 single-use polybags on grocery run',
      basePoints: 30,
      co2SavingsKg: 0.4,
      requiresPhotoProof: true,
      active: true,
      order: 5
    },
    {
      id: 'task_food_millet_thali',
      themeId: 'sustainable_food',
      titleKey: 'tasks.milletThali.title',
      descriptionKey: 'tasks.milletThali.desc',
      impactSummary: 'Support low-water climate-resilient Gujarati millets',
      basePoints: 45,
      co2SavingsKg: 1.2,
      requiresPhotoProof: true,
      active: true,
      order: 6
    },
    {
      id: 'task_waste_segregation',
      themeId: 'waste_reduction',
      titleKey: 'tasks.wasteSeg.title',
      descriptionKey: 'tasks.wasteSeg.desc',
      impactSummary: 'Separate wet compostable organic waste at source',
      basePoints: 50,
      co2SavingsKg: 1.8,
      requiresPhotoProof: true,
      active: true,
      order: 7
    },
    {
      id: 'task_lifestyle_walk_short',
      themeId: 'healthy_lifestyle',
      titleKey: 'tasks.walkShort.title',
      descriptionKey: 'tasks.walkShort.desc',
      impactSummary: 'Walk or cycle for neighborhood errands under 2 km',
      basePoints: 40,
      co2SavingsKg: 0.8,
      requiresPhotoProof: false,
      active: true,
      order: 8
    },
    {
      id: 'task_ewaste_collection',
      themeId: 'e_waste',
      titleKey: 'tasks.ewasteHub.title',
      descriptionKey: 'tasks.ewasteHub.desc',
      impactSummary: 'Safely deposit old phone chargers & lithium cells at GEDA center',
      basePoints: 70,
      co2SavingsKg: 2.5,
      requiresPhotoProof: true,
      active: true,
      order: 9
    }
  ];
}

