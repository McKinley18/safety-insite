import { secureStorage } from "./secureStorage";

export type Facility = {
  id: string;
  name: string;
  siteType?: string;
};

const KEY = "company_facilities";

export function getFacilities() {
  return secureStorage.get(KEY, [] as Facility[]);
}

export function setFacilities(facilities: Facility[]) {
  secureStorage.set(KEY, facilities);
}
