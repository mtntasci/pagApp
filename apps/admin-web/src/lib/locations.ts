export interface Neighborhood {
  id: string;
  name: string;
}

export interface District {
  id: string;
  cityId?: string;
  name: string;
  neighborhoods?: Neighborhood[];
}

export interface City {
  id: string;
  name: string;
  districts: District[];
}

let cachedLocations: City[] | null = null;

export async function fetchLocations(): Promise<City[]> {
  if (cachedLocations && cachedLocations.length > 0) {
    return cachedLocations;
  }

  try {
    const res = await fetch('/api/v1/admin/locations');
    const json = await res.json();
    if (json.success && json.data?.cities) {
      cachedLocations = json.data.cities;
      return cachedLocations || [];
    }
  } catch (err) {
    console.error('Failed to fetch locations from database:', err);
  }
  return [];
}
