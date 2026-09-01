export const presetScenarios: any[] = [
  {
    "id": "scen_collapse_01",
    "title": "Urban Structural Collapse",
    "category": "structural_collapse",
    "severity": "CRITICAL",
    "description": "Four-story commercial building partially collapsed following a foundation rupture on 4th Main Rd. At least 4 victims trapped under heavy concrete slabs, screaming heard from basement.",
    "location": { "lat": 12.9716, "lng": 77.5946 },
    "expectedCapabilities": ["heavy_rescue", "extrication_tools", "structural_shoring", "als_medical"],
    "caller": "Metro Dispatch / Police Cruiser 101"
  },
  {
    "id": "scen_hazmat_02",
    "title": "Industrial Chlorine Gas Leak",
    "category": "hazmat",
    "severity": "HIGH",
    "description": "Pressurized 500-liter toxic chlorine storage cylinder leaking greenish-yellow vapor at Tech Park chemical depot. Two facility operators experiencing acute respiratory distress.",
    "location": { "lat": 12.9850, "lng": 77.5700 },
    "expectedCapabilities": ["hazmat_containment", "chemical_detection", "decontamination"],
    "caller": "Industrial Safety Officer"
  },
  {
    "id": "scen_highway_03",
    "title": "High-Speed Highway Multi-Car Pileup",
    "category": "traffic_collision",
    "severity": "CRITICAL",
    "description": "Massive four-vehicle pileup on the elevated express highway. Tanker truck pinned an SUV against the concrete divider. Fuel leaking, two passengers pinned inside crumpled frame.",
    "location": { "lat": 12.9600, "lng": 77.6200 },
    "expectedCapabilities": ["extrication_tools", "als_medical", "foam_fire_suppression"],
    "caller": "Highway Patrol Unit"
  },
  {
    "id": "scen_highrise_04",
    "title": "High-Rise Commercial Tower Fire",
    "category": "fire",
    "severity": "CRITICAL",
    "description": "Heavy black smoke and visible flames emanating from the 9th floor of an office high-rise. Fire alarm active, multiple occupants trapped near upper stairwell.",
    "location": { "lat": 12.9730, "lng": 77.6010 },
    "expectedCapabilities": ["high_angle_rescue", "aerial_master_stream", "fire_suppression", "als_medical"],
    "caller": "Building Security Desk"
  },
  {
    "id": "scen_flood_05",
    "title": "Flash Flood & Stranded River Vehicles",
    "category": "flood",
    "severity": "HIGH",
    "description": "Sudden monsoon cloudburst caused lake overflow. Fast-flowing 4-foot deep torrent sweeping through low-lying bypass road. Van with 3 occupants stranded against railing.",
    "location": { "lat": 12.9950, "lng": 77.5890 },
    "expectedCapabilities": ["fast_water_rescue", "flood_evacuation"],
    "caller": "Civil Defense Volunteer"
  },
  {
    "id": "scen_cardiac_06",
    "title": "Acute Cardiac Arrest in Metro Station",
    "category": "medical_trauma",
    "severity": "CRITICAL",
    "description": "55-year-old passenger collapsed on metro terminal platform, non-responsive, no palpable carotid pulse. CPR initiated by bystander with station public AED.",
    "location": { "lat": 12.9650, "lng": 77.5980 },
    "expectedCapabilities": ["als_medical", "cardiac_life_support", "patient_transport"],
    "caller": "Metro Station Master"
  },
  {
    "id": "scen_grid_07",
    "title": "Power Substation Transformer Explosion",
    "category": "fire",
    "severity": "CRITICAL",
    "description": "Catastrophic 66kV electrical transformer explosion ignited 2,000 gallons of dielectric cooling oil. Intense fireball threatening adjacent residential power grid.",
    "location": { "lat": 12.9820, "lng": 77.5650 },
    "expectedCapabilities": ["foam_fire_suppression", "gas_leak_isolation", "power_grid_shutdown"],
    "caller": "Grid Load Dispatch Center"
  },
  {
    "id": "scen_lost_08",
    "title": "Wilderness Missing Child in Dense Forest",
    "category": "other",
    "severity": "HIGH",
    "description": "8-year-old child separated from family hiking group in botanical park reserve over 3 hours ago. Temperatures dropping, dense underbrush, zero visibility.",
    "location": { "lat": 12.9600, "lng": 77.6100 },
    "expectedCapabilities": ["search_dogs", "aerial_reconnaissance", "scent_tracking"],
    "caller": "Park Ranger Unit"
  },
  {
    "id": "scen_gas_09",
    "title": "Underground Natural Gas Main Rupture",
    "category": "hazmat",
    "severity": "HIGH",
    "description": "Construction excavator struck 8-inch high-pressure natural gas distribution line. Loud roaring hiss and intense odor of mercaptan. Immediate evacuation of 200m radius needed.",
    "location": { "lat": 12.9800, "lng": 77.6500 },
    "expectedCapabilities": ["gas_leak_isolation", "hazmat_containment", "perimeter_control"],
    "caller": "Municipal Utility Dispatch"
  },
  {
    "id": "scen_exhaustion_10",
    "title": "Mass Multi-Point Incident (Fleet Stress Test)",
    "category": "structural_collapse",
    "severity": "CRITICAL",
    "description": "Secondary ceiling cave-in at logistics warehouse following primary dispatch of central task forces. Evaluates fallback fleet reallocation under resource exhaustion.",
    "location": { "lat": 13.0100, "lng": 77.5600 },
    "expectedCapabilities": ["heavy_rescue", "extrication_tools"],
    "caller": "Warehouse Supervisor"
  }
];
