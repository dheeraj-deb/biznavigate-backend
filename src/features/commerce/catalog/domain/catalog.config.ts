// catalog.config.ts
// Maps business_type → allowed item_types and defines the attribute schema
// for each item_type. The frontend calls GET /catalog/config to get this
// and renders the add-product form dynamically.

type CatalogConfig = { item_types: string[]; labels: Record<string, string> };

// Ordered rule list — first match wins. Uses the same substring strategy as
// pipeline.service.ts pickIndustry() so both systems are always consistent.
const CATALOG_RULES: Array<{ keywords: string[]; config: CatalogConfig }> = [
  {
    keywords: ['automotive', 'used car', 'used_car', 'used_cars', 'new car', 'new_car', 'vehicle', 'dealer'],
    config: {
      item_types: ['vehicle'],
      labels: { vehicle: 'Vehicles' },
    },
  },
  {
    keywords: ['real estate', 'real_estate', 'property', 'properties', 'flat', 'apartment', 'house', 'plot', 'broker'],
    config: {
      item_types: ['property'],
      labels: { property: 'Properties' },
    },
  },
  {
    keywords: ['hotel', 'resort', 'homestay', 'cottage', 'villa'],
    config: {
      item_types: ['accommodation', 'activity'],
      labels: { accommodation: 'Rooms & Stays', activity: 'Activities' },
    },
  },
  {
    keywords: ['camp', 'camping', 'trek', 'adventure', 'retreat', 'bonfire'],
    config: {
      item_types: ['accommodation', 'activity'],
      labels: { accommodation: 'Campsites', activity: 'Activities' },
    },
  },
  {
    keywords: ['tour', 'activity', 'event venue', 'venue', 'wedding', 'party hall'],
    config: {
      item_types: ['activity', 'service'],
      labels: { activity: 'Activities', service: 'Services' },
    },
  },
  {
    keywords: ['salon', 'spa', 'barber', 'beauty'],
    config: {
      item_types: ['service'],
      labels: { service: 'Services' },
    },
  },
  {
    keywords: ['workshop', 'coaching', 'education', 'training', 'course', 'school', 'institute'],
    config: {
      item_types: ['activity', 'service'],
      labels: { activity: 'Classes', service: 'Services' },
    },
  },
  {
    keywords: ['product', 'retail', 'commerce', 'store', 'shop', 'ecom'],
    config: {
      item_types: ['physical_product'],
      labels: { physical_product: 'Products' },
    },
  },
];

/**
 * Resolve catalog config for any business_type string using substring matching.
 * Returns null for unrecognised types so callers can fall back to DEFAULT_ITEM_TYPES.
 */
export function resolveBusinessCatalogConfig(businessType: string | null | undefined): CatalogConfig | null {
  if (!businessType) return null;
  const t = businessType.toLowerCase();
  for (const rule of CATALOG_RULES) {
    if (rule.keywords.some((kw) => t.includes(kw))) return rule.config;
  }
  return null;
}

// Default when business_type is null or unrecognised
export const DEFAULT_ITEM_TYPES = [
  'physical_product',
  'accommodation',
  'activity',
  'service',
  'vehicle',
  'property',
];

// Keep the named export for any legacy exact-key lookups elsewhere
export const BUSINESS_CATALOG_CONFIG: Record<string, CatalogConfig> = Object.fromEntries(
  CATALOG_RULES.flatMap((rule) =>
    rule.keywords.map((kw) => [kw.replace(/\s/g, '_'), rule.config]),
  ),
);

// Attribute field schema per item_type.
// Each field: { type, required?, label, options? }
// Frontend reads this and renders the correct form inputs.
export const ATTRIBUTE_SCHEMAS: Record<string, Record<string, any>> = {
  physical_product: {
    brand:      { type: 'string',  label: 'Brand' },
    condition:  { type: 'select',  label: 'Condition', options: ['new', 'like_new', 'good', 'refurbished'] },
    weight:     { type: 'number',  label: 'Weight (grams)' },
    dimensions: { type: 'string',  label: 'Dimensions (e.g. 30x20x10 cm)' },
  },
  accommodation: {
    capacity:             { type: 'number',  required: true,  label: 'Max Guests' },
    total_units:          { type: 'number',  required: true,  label: 'No. of Units' },
    check_in_time:        { type: 'time',    label: 'Check-in Time' },
    check_out_time:       { type: 'time',    label: 'Check-out Time' },
    bed_type:             { type: 'string',  label: 'Bed Type (e.g. King AC, Twin, Bunk)' },
    has_ac:               { type: 'boolean', label: 'Air Conditioning' },
    has_wifi:             { type: 'boolean', label: 'WiFi' },
    has_pool:             { type: 'boolean', label: 'Swimming Pool' },
    meal_plan:            { type: 'select',  label: 'Meal Plan', options: ['none', 'breakfast', 'all_inclusive'] },
    extra_guest_charge:   { type: 'number',  label: 'Extra Guest Charge (₹/night)' },
  },
  activity: {
    total_slots:     { type: 'number',  required: true,  label: 'Total Slots per Day' },
    group_size_min:  { type: 'number',  label: 'Min Group Size' },
    group_size_max:  { type: 'number',  label: 'Max Group Size' },
    duration_hours:  { type: 'number',  label: 'Duration (hours)' },
    duration_days:   { type: 'number',  label: 'Duration (days)' },
    difficulty:      { type: 'select',  label: 'Difficulty', options: ['easy', 'moderate', 'hard'] },
    includes:        { type: 'tags',    label: "What's Included (e.g. guide, food, equipment)" },
    excludes:        { type: 'tags',    label: "What's Excluded" },
    location:        { type: 'string',  label: 'Meetup / Start Location' },
    start_times:     { type: 'tags',    label: 'Start Times (e.g. 07:00, 09:00)' },
  },
  service: {
    duration_minutes:       { type: 'number',  label: 'Duration (minutes)' },
    concurrent_slots:       { type: 'number',  label: 'Concurrent Slots (chairs/staff)' },
    requires_appointment:   { type: 'boolean', label: 'Requires Appointment' },
  },
  vehicle: {
    make:         { type: 'string',  required: true,  label: 'Make (e.g. Toyota, Honda)' },
    model_name:   { type: 'string',  required: true,  label: 'Model (e.g. Corolla, City)' },
    year:         { type: 'number',  required: true,  label: 'Year' },
    fuel_type:    { type: 'select',  label: 'Fuel Type', options: ['petrol', 'diesel', 'electric', 'hybrid', 'cng'] },
    transmission: { type: 'select',  label: 'Transmission', options: ['manual', 'automatic', 'amt'] },
    color:        { type: 'string',  label: 'Color' },
    km_driven:    { type: 'number',  label: 'KM Driven' },
    condition:    { type: 'select',  label: 'Condition', options: ['new', 'used', 'certified_pre_owned'] },
  },
  property: {
    property_type:     { type: 'select',  required: true, label: 'Property Type', options: ['flat', 'house', 'villa', 'plot', 'commercial'] },
    listing_type:      { type: 'select',  label: 'Listing Type', options: ['sale', 'rent', 'lease'] },
    bedrooms:          { type: 'number',  label: 'Bedrooms' },
    bathrooms:         { type: 'number',  label: 'Bathrooms' },
    area_sqft:         { type: 'number',  label: 'Area (sqft)' },
    locality:          { type: 'string',  label: 'Locality' },
    city:              { type: 'string',  label: 'City' },
    furnishing:        { type: 'select',  label: 'Furnishing', options: ['unfurnished', 'semi_furnished', 'furnished'] },
    possession_status: { type: 'string',  label: 'Possession Status' },
    rera_id:           { type: 'string',  label: 'RERA ID' },
  },
};
