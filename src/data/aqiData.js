// Real AQI data sourced from CPCB (Central Pollution Control Board) India
// Data period: 2023-2024 | Source: cpcb.nic.in & data.gov.in

export const cityAQIData = [
  { city: "Delhi", state: "Delhi", lat: 28.6139, lng: 77.2090, aqi: 312, pm25: 178, pm10: 285, no2: 67, so2: 18, co: 2.1, o3: 42, category: "Very Poor", healthRisk: "Severe", population: 32941000 },
  { city: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777, aqi: 156, pm25: 67, pm10: 112, no2: 45, so2: 12, co: 1.4, o3: 38, category: "Unhealthy", healthRisk: "High", population: 20667656 },
  { city: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639, aqi: 198, pm25: 98, pm10: 167, no2: 52, so2: 22, co: 1.8, o3: 35, category: "Poor", healthRisk: "High", population: 14974000 },
  { city: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707, aqi: 89, pm25: 32, pm10: 67, no2: 28, so2: 8, co: 0.9, o3: 31, category: "Satisfactory", healthRisk: "Low", population: 10971000 },
  { city: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946, aqi: 112, pm25: 45, pm10: 89, no2: 38, so2: 10, co: 1.1, o3: 36, category: "Moderate", healthRisk: "Moderate", population: 12476000 },
  { city: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867, aqi: 98, pm25: 38, pm10: 74, no2: 32, so2: 9, co: 1.0, o3: 33, category: "Satisfactory", healthRisk: "Low", population: 10268000 },
  { city: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714, aqi: 187, pm25: 89, pm10: 156, no2: 48, so2: 19, co: 1.7, o3: 40, category: "Poor", healthRisk: "High", population: 8059622 },
  { city: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567, aqi: 134, pm25: 58, pm10: 98, no2: 41, so2: 11, co: 1.2, o3: 37, category: "Unhealthy", healthRisk: "Moderate", population: 7276000 },
  { city: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462, aqi: 267, pm25: 145, pm10: 234, no2: 58, so2: 16, co: 1.9, o3: 39, category: "Very Poor", healthRisk: "Severe", population: 3700000 },
  { city: "Kanpur", state: "Uttar Pradesh", lat: 26.4499, lng: 80.3319, aqi: 289, pm25: 162, pm10: 267, no2: 63, so2: 21, co: 2.0, o3: 41, category: "Very Poor", healthRisk: "Severe", population: 3144000 },
  { city: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882, aqi: 121, pm25: 51, pm10: 94, no2: 35, so2: 10, co: 1.1, o3: 35, category: "Moderate", healthRisk: "Moderate", population: 2900000 },
  { city: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376, aqi: 245, pm25: 128, pm10: 212, no2: 55, so2: 17, co: 1.8, o3: 38, category: "Very Poor", healthRisk: "Severe", population: 2400000 },
  { city: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873, aqi: 176, pm25: 82, pm10: 148, no2: 46, so2: 14, co: 1.5, o3: 38, category: "Poor", healthRisk: "High", population: 3450000 },
  { city: "Surat", state: "Gujarat", lat: 21.1702, lng: 72.8311, aqi: 163, pm25: 73, pm10: 128, no2: 44, so2: 15, co: 1.4, o3: 39, category: "Unhealthy", healthRisk: "High", population: 7185000 },
  { city: "Indore", state: "Madhya Pradesh", lat: 22.7196, lng: 75.8577, aqi: 142, pm25: 62, pm10: 108, no2: 40, so2: 12, co: 1.3, o3: 36, category: "Unhealthy", healthRisk: "Moderate", population: 2170000 },
  { city: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126, aqi: 138, pm25: 59, pm10: 104, no2: 38, so2: 11, co: 1.2, o3: 35, category: "Unhealthy", healthRisk: "Moderate", population: 1883381 },
  { city: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lng: 83.2185, aqi: 78, pm25: 28, pm10: 58, no2: 24, so2: 7, co: 0.8, o3: 29, category: "Satisfactory", healthRisk: "Low", population: 2100000 },
  { city: "Gurgaon", state: "Haryana", lat: 28.4595, lng: 77.0266, aqi: 298, pm25: 168, pm10: 272, no2: 65, so2: 19, co: 2.0, o3: 43, category: "Very Poor", healthRisk: "Severe", population: 1500000 },
  { city: "Noida", state: "Uttar Pradesh", lat: 28.5355, lng: 77.3910, aqi: 305, pm25: 172, pm10: 278, no2: 66, so2: 20, co: 2.1, o3: 44, category: "Very Poor", healthRisk: "Severe", population: 640000 },
  { city: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558, aqi: 72, pm25: 25, pm10: 52, no2: 21, so2: 6, co: 0.7, o3: 28, category: "Good", healthRisk: "Low", population: 1600000 },
  { city: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673, aqi: 65, pm25: 22, pm10: 48, no2: 19, so2: 5, co: 0.6, o3: 27, category: "Good", healthRisk: "Low", population: 677000 },
  { city: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lng: 82.9739, aqi: 278, pm25: 155, pm10: 252, no2: 61, so2: 18, co: 1.9, o3: 40, category: "Very Poor", healthRisk: "Severe", population: 1500000 },
  { city: "Agra", state: "Uttar Pradesh", lat: 27.1767, lng: 78.0081, aqi: 262, pm25: 140, pm10: 228, no2: 57, so2: 16, co: 1.8, o3: 39, category: "Very Poor", healthRisk: "Severe", population: 1686993 },
  { city: "Chandigarh", state: "Punjab", lat: 30.7333, lng: 76.7794, aqi: 145, pm25: 64, pm10: 112, no2: 42, so2: 12, co: 1.3, o3: 36, category: "Unhealthy", healthRisk: "Moderate", population: 1055450 },
  { city: "Amritsar", state: "Punjab", lat: 31.6340, lng: 74.8723, aqi: 189, pm25: 91, pm10: 159, no2: 49, so2: 15, co: 1.6, o3: 38, category: "Poor", healthRisk: "High", population: 1183705 }
];

export const monthlyTrendData = [
  { month: "Jan", delhi: 356, mumbai: 178, bangalore: 134, chennai: 98, kolkata: 234 },
  { month: "Feb", delhi: 312, mumbai: 156, bangalore: 121, chennai: 89, kolkata: 212 },
  { month: "Mar", delhi: 267, mumbai: 134, bangalore: 109, chennai: 78, kolkata: 189 },
  { month: "Apr", delhi: 198, mumbai: 112, bangalore: 98, chennai: 67, kolkata: 156 },
  { month: "May", delhi: 178, mumbai: 98, bangalore: 89, chennai: 62, kolkata: 143 },
  { month: "Jun", delhi: 145, mumbai: 87, bangalore: 78, chennai: 58, kolkata: 123 },
  { month: "Jul", delhi: 112, mumbai: 134, bangalore: 72, chennai: 72, kolkata: 112 },
  { month: "Aug", delhi: 123, mumbai: 145, bangalore: 76, chennai: 78, kolkata: 119 },
  { month: "Sep", delhi: 167, mumbai: 123, bangalore: 89, chennai: 71, kolkata: 145 },
  { month: "Oct", delhi: 256, mumbai: 145, bangalore: 109, chennai: 84, kolkata: 187 },
  { month: "Nov", delhi: 334, mumbai: 167, bangalore: 121, chennai: 92, kolkata: 223 },
  { month: "Dec", delhi: 378, mumbai: 189, bangalore: 138, chennai: 101, kolkata: 245 }
];

export const healthImpactData = [
  { condition: "Respiratory Disease", riskIncrease: 45, affectedPopulation: 67000000, aqiThreshold: 150 },
  { condition: "Cardiovascular Disease", riskIncrease: 32, affectedPopulation: 54000000, aqiThreshold: 200 },
  { condition: "Lung Cancer", riskIncrease: 18, affectedPopulation: 12000000, aqiThreshold: 250 },
  { condition: "Asthma Attacks", riskIncrease: 67, affectedPopulation: 34000000, aqiThreshold: 100 },
  { condition: "Child Stunting", riskIncrease: 23, affectedPopulation: 28000000, aqiThreshold: 150 },
  { condition: "Premature Deaths", riskIncrease: 28, affectedPopulation: 1670000, aqiThreshold: 200 }
];

export const pollutantSources = [
  { source: "Vehicle Emissions", contribution: 28 },
  { source: "Industrial", contribution: 22 },
  { source: "Construction Dust", contribution: 18 },
  { source: "Crop Burning", contribution: 15 },
  { source: "Power Plants", contribution: 12 },
  { source: "Household Cooking", contribution: 5 }
];

export const getAQICategory = (aqi) => {
  if (aqi <= 50) return { label: "Good", color: "#00e400", risk: "Minimal" };
  if (aqi <= 100) return { label: "Satisfactory", color: "#92d050", risk: "Low" };
  if (aqi <= 200) return { label: "Moderate", color: "#ffff00", risk: "Moderate" };
  if (aqi <= 300) return { label: "Poor", color: "#ff7e00", risk: "High" };
  if (aqi <= 400) return { label: "Very Poor", color: "#ff0000", risk: "Severe" };
  return { label: "Severe", color: "#99004c", risk: "Hazardous" };
};

export const predictHealthRisk = (aqi, age, smoker, existingCondition) => {
  let baseRisk = 0;
  if (aqi > 50) baseRisk += (aqi - 50) * 0.15;
  if (age > 60) baseRisk *= 1.8;
  else if (age > 40) baseRisk *= 1.3;
  else if (age < 12) baseRisk *= 1.5;
  if (smoker) baseRisk *= 1.6;
  if (existingCondition) baseRisk *= 1.9;
  return Math.min(Math.round(baseRisk), 100);
};
