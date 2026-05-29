/**
 * Property amenities — keep aligned with backend/src/schemas/amenities.ts
 */

export const PROPERTY_AMENITIES = [
  "parking",
  "generator",
  "water_heater",
  "security",
  "gym",
  "swimming_pool",
  "cctv",
  "elevator",
  "furnished",
  "serviced",
] as const;

export type PropertyAmenity = (typeof PROPERTY_AMENITIES)[number];

export const PROPERTY_AMENITY_LABELS: Record<PropertyAmenity, string> = {
  parking: "Parking",
  generator: "Generator",
  water_heater: "Water Heater",
  security: "Security",
  gym: "Gym",
  swimming_pool: "Swimming Pool",
  cctv: "CCTV",
  elevator: "Elevator",
  furnished: "Furnished",
  serviced: "Serviced",
};

export const PROPERTY_TYPES = ["flat", "duplex", "studio", "room"] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  flat: "Flat",
  duplex: "Duplex",
  studio: "Studio",
  room: "Room",
};

export const NIGERIAN_CITIES = [
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Ibadan",
  "Enugu",
] as const;
