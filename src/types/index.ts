export type TripType = "one-way" | "round-trip";

export interface RouteConfig {
  origin: string;
  destination: string;
  tripType: TripType;
  months: string[]; // "YYYY-MM"
  tripLengthWeeks: number; // 1-52
}

export interface FlightResult {
  departure: string; // ISO date
  return?: string;   // ISO date, round-trip only
  price: number;
  airline?: string;
  url?: string;
  gs?: string;
}

export interface ScanResult {
  id: string;
  timestamp: number;
  config: RouteConfig;
  results: FlightResult[];
}
