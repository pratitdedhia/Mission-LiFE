/**
 * Gujarat Cities, Localities & DISCOMs Registry
 * Editable, extensible data structure allowing citizens to select or add custom localities.
 */

const LOCAL_STORAGE_LOCALITIES_KEY = 'life_plus_custom_localities';

export const DEFAULT_GUJARAT_REGISTRY = [
  {
    city: "Ahmedabad",
    district: "Ahmedabad",
    discom: "Torrent Power / UGVCL",
    localities: ["Navrangpura", "Bodakdev", "Satellite", "Chandkheda", "Vastrapur", "Maninagar", "Prahlad Nagar", "Gota", "Thaltej"]
  },
  {
    city: "Surat",
    district: "Surat",
    discom: "DGVCL / Torrent Power",
    localities: ["Adajan", "Vesu", "Piplod", "Varachha", "Katargam", "Pal", "Athwa Lines", "Ghod Dod Road"]
  },
  {
    city: "Gandhinagar",
    district: "Gandhinagar",
    discom: "Torrent Power / UGVCL",
    localities: ["Sector 1-10", "Sector 11-20", "Sector 21-30", "Infocity", "Kudasan", "Raysan", "Sargasan", "Bhaijipura"]
  },
  {
    city: "Vadodara",
    district: "Vadodara",
    discom: "MGVCL",
    localities: ["Alkapuri", "Gotri", "Akota", "Fatehgunj", "Manjalpur", "Karelibaug", "Vasna Road", "Waghodia Road"]
  },
  {
    city: "Rajkot",
    district: "Rajkot",
    discom: "PGVCL",
    localities: ["Kalawad Road", "University Road", "Yagnik Road", "Madhapar", "Kotecha Chowk", "Railnagar", "150 Feet Ring Road"]
  },
  {
    city: "Bhavnagar",
    district: "Bhavnagar",
    discom: "PGVCL",
    localities: ["Waghawadi Road", "Kalanala", "Ghogha Circle", "Subhashnagar", "Kaliabid"]
  },
  {
    city: "Jamnagar",
    district: "Jamnagar",
    discom: "PGVCL",
    localities: ["Patel Colony", "Digjam Circle", "Park Colony", "Oshwal Colony", "Khodiyar Colony"]
  },
  {
    city: "Kutch (Bhuj / Gandhidham)",
    district: "Kutch",
    discom: "PGVCL",
    localities: ["Mirzapar Road", "Madhapar Bhuj", "Tagore Nagar Gandhidham", "Sector 1-5 Gandhidham"]
  },
  {
    city: "Anand",
    district: "Anand",
    discom: "MGVCL",
    localities: ["Vallabh Vidyanagar", "Bakrol", "Amul Dairy Road", "Gamdi", "Jitodia"]
  },
  {
    city: "Bharuch",
    district: "Bharuch",
    discom: "DGVCL",
    localities: ["Link Road", "Zadeshwar", "Bholav", "Shaktinagar", "Ankleshwar GIDC"]
  }
];

export function getGujaratRegistry() {
  try {
    const custom = localStorage.getItem(LOCAL_STORAGE_LOCALITIES_KEY);
    if (custom) {
      const parsed = JSON.parse(custom);
      return parsed;
    }
  } catch (e) {
    console.warn("Using default Gujarat localities registry", e);
  }
  return DEFAULT_GUJARAT_REGISTRY;
}

export function saveCustomLocality(cityName, newLocality) {
  const current = getGujaratRegistry();
  const existingCity = current.find(c => c.city.toLowerCase() === cityName.toLowerCase());
  if (existingCity) {
    if (!existingCity.localities.includes(newLocality)) {
      existingCity.localities.push(newLocality);
    }
  } else {
    current.push({
      city: cityName,
      district: cityName,
      discom: "Gujarat Urja Vikas Nigam (GUVNL)",
      localities: [newLocality]
    });
  }
  try {
    localStorage.setItem(LOCAL_STORAGE_LOCALITIES_KEY, JSON.stringify(current));
  } catch (e) {}
  return current;
}

