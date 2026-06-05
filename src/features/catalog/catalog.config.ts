// catalog.config.ts
// Maps business_type → allowed item_types and defines the attribute schema
// for each item_type. The frontend calls GET /catalog/config to get this
// and renders the add-product form dynamically.

export const BUSINESS_CATALOG_CONFIG: Record<
  string,
  { item_types: string[]; labels: Record<string, string> }
> = {
  product_seller: {
    item_types: ['physical_product'],
    labels: { physical_product: 'Products' },
  },
  hotel: {
    item_types: ['accommodation'],
    labels: { accommodation: 'Rooms & Villas' },
  },
  resort: {
    item_types: ['accommodation', 'activity'],
    labels: { accommodation: 'Stays', activity: 'Activities' },
  },
  camping: {
    item_types: ['accommodation', 'activity'],
    labels: { accommodation: 'Campsites', activity: 'Activities' },
  },
  salon: {
    item_types: ['service'],
    labels: { service: 'Services' },
  },
  workshop: {
    item_types: ['activity', 'service'],
    labels: { activity: 'Classes', service: 'Services' },
  },
};

// Default when business_type is null or unrecognised
export const DEFAULT_ITEM_TYPES = [
  'physical_product',
  'accommodation',
  'activity',
  'service',
];

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
};
