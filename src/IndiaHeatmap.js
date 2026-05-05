import React, { useState } from "react";
import { cityAQIData, getAQICategory } from "./data/aqiData";

// SVG-based India map with approximate city dot positions
// No external map library needed — pure React + SVG

const CITY_POSITIONS = {
  "Delhi":         { x: 310, y: 148 },
  "Gurgaon":       { x: 302, y: 155 },
  "Noida":         { x: 318, y: 152 },
  "Agra":          { x: 320, y: 175 },
  "Lucknow":       { x: 355, y: 168 },
  "Kanpur":        { x: 348, y: 175 },
  "Varanasi":      { x: 375, y: 185 },
  "Patna":         { x: 400, y: 185 },
  "Kolkata":       { x: 430, y: 215 },
  "Jaipur":        { x: 278, y: 172 },
  "Ahmedabad":     { x: 238, y: 210 },
  "Surat":         { x: 245, y: 235 },
  "Mumbai":        { x: 242, y: 268 },
  "Pune":          { x: 252, y: 283 },
  "Nagpur":        { x: 318, y: 258 },
  "Bhopal":        { x: 305, y: 230 },
  "Indore":        { x: 290, y: 228 },
  "Hyderabad":     { x: 318, y: 310 },
  "Bengaluru":     { x: 298, y: 355 },
  "Chennai":       { x: 340, y: 345 },
  "Visakhapatnam": { x: 375, y: 285 },
  "Coimbatore":    { x: 290, y: 375 },
  "Kochi":         { x: 278, y: 395 },
  "Chandigarh":    { x: 302, y: 128 },
  "Amritsar":      { x: 285, y: 120 },
};

// Simplified India outline path (SVG)
const INDIA_PATH = `
M 285 80 L 295 75 L 310 72 L 330 75 L 345 80 L 360 85 L 375 90
L 385 100 L 390 108 L 400 112 L 415 108 L 425 115 L 430 125
L 435 140 L 440 155 L 445 170 L 448 185 L 450 200 L 448 215
L 445 228 L 440 240 L 435 252 L 428 262 L 420 270 L 410 278
L 400 285 L 395 295 L 388 308 L 380 318 L 370 328 L 360 338
L 350 348 L 342 358 L 335 368 L 328 378 L 322 388 L 315 398
L 308 408 L 300 415 L 295 408 L 288 398 L 282 388 L 278 378
L 272 368 L 268 358 L 265 345 L 262 332 L 258 318 L 255 305
L 252 292 L 248 278 L 244 265 L 240 252 L 236 238 L 232 225
L 228 212 L 225 198 L 222 185 L 220 170 L 218 155 L 218 140
L 220 125 L 222 112 L 226 100 L 232 92 L 240 86 L 250 82
L 265 79 L 278 78 L 285 80 Z
`;

export default function IndiaHeatmap() {
  const [hovered, setHovered] = useState(null);
  const [filter, setFilter] = useState("All");

  const categories = ["All", "Good", "Satisfactory", "Moderate", "Unhealthy", "Poor", "Very Poor"];

  const filtered = filter === "All"
    ? cityAQIData
    : cityAQIData.filter(c => getAQICategory(c.aqi).label === filter || c.category === filter);

  const filteredNames = new Set(filtered.map(c => c.city));

  const sortedByAqi = [...cityAQIData].sort((a, b) => b.aqi - a.aqi);

  return (
    <section className="section">
      <div className="section-header">
        <h2>India Pollution Heatmap</h2>
        <p>Visual AQI map across 25 major Indian cities — click any city dot for details</p>
      </div>

      {/* Filter */}
      <div className="filter-row">
        {categories.map(c => (
          <button key={c} className={`filter-btn ${filter === c ? "active" : ""}`} onClick={() => setFilter(c)}>{c}</button>
        ))}
      </div>

      <div className="heatmap-layout">
        {/* SVG MAP */}
        <div className="map-container">
          <div className="map-title">🇮🇳 India AQI Map — 2024</div>
          <svg viewBox="180 60 290 390" className="india-svg" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {cityAQIData.map(city => {
                const cat = getAQICategory(city.aqi);
                return (
                  <radialGradient key={city.city} id={`glow-${city.city.replace(/\s/g,"")}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={cat.color} stopOpacity="0.6"/>
                    <stop offset="100%" stopColor={cat.color} stopOpacity="0"/>
                  </radialGradient>
                );
              })}
            </defs>

            {/* India outline */}
            <path d={INDIA_PATH} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>

            {/* Heatmap glow blobs */}
            {cityAQIData.map(city => {
              const pos = CITY_POSITIONS[city.city];
              if (!pos) return null;
              const cat = getAQICategory(city.aqi);
              const radius = 20 + (city.aqi / 500) * 30;
              const opacity = filteredNames.has(city.city) ? 0.7 : 0.05;
              return (
                <circle
                  key={`blob-${city.city}`}
                  cx={pos.x} cy={pos.y}
                  r={radius}
                  fill={`url(#glow-${city.city.replace(/\s/g,"")})`}
                  opacity={opacity}
                />
              );
            })}

            {/* City dots */}
            {cityAQIData.map(city => {
              const pos = CITY_POSITIONS[city.city];
              if (!pos) return null;
              const cat = getAQICategory(city.aqi);
              const isHovered = hovered?.city === city.city;
              const isFiltered = filteredNames.has(city.city);
              const r = isHovered ? 8 : 5;
              return (
                <g key={city.city}
                  onMouseEnter={() => setHovered(city)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "pointer" }}>
                  {/* Pulse ring on hover */}
                  {isHovered && (
                    <circle cx={pos.x} cy={pos.y} r={14} fill="none" stroke={cat.color} strokeWidth="1.5" opacity="0.5"/>
                  )}
                  <circle
                    cx={pos.x} cy={pos.y} r={r}
                    fill={cat.color}
                    opacity={isFiltered ? 1 : 0.15}
                    stroke={isHovered ? "white" : "rgba(0,0,0,0.3)"}
                    strokeWidth={isHovered ? 1.5 : 0.5}
                  />
                  {/* City name label */}
                  {isFiltered && (
                    <text
                      x={pos.x + 8} y={pos.y + 4}
                      fill="rgba(255,255,255,0.75)"
                      fontSize="5.5"
                      fontFamily="Syne, sans-serif"
                      fontWeight="600">
                      {city.city}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Tooltip on hover */}
            {hovered && CITY_POSITIONS[hovered.city] && (() => {
              const pos = CITY_POSITIONS[hovered.city];
              const cat = getAQICategory(hovered.aqi);
              const tx = pos.x > 380 ? pos.x - 82 : pos.x + 12;
              const ty = pos.y > 340 ? pos.y - 52 : pos.y - 8;
              return (
                <g>
                  <rect x={tx} y={ty} width="78" height="44" rx="6"
                    fill="#0d1117" stroke={cat.color} strokeWidth="1"/>
                  <text x={tx+6} y={ty+13} fill="white" fontSize="7" fontWeight="bold" fontFamily="Syne">{hovered.city}</text>
                  <text x={tx+6} y={ty+23} fill={cat.color} fontSize="9" fontWeight="bold" fontFamily="Space Mono">AQI: {hovered.aqi}</text>
                  <text x={tx+6} y={ty+34} fill={cat.color} fontSize="6.5" fontFamily="Syne">{cat.label}</text>
                </g>
              );
            })()}
          </svg>

          {/* AQI Legend */}
          <div className="map-legend">
            {[
              {label:"Good", color:"#00e400", range:"0-50"},
              {label:"Satisfactory", color:"#92d050", range:"51-100"},
              {label:"Moderate", color:"#ffff00", range:"101-200"},
              {label:"Poor", color:"#ff7e00", range:"201-300"},
              {label:"Very Poor", color:"#ff0000", range:"301-400"},
              {label:"Severe", color:"#99004c", range:"400+"},
            ].map(l => (
              <div key={l.label} className="legend-item">
                <div className="legend-dot" style={{background: l.color}}/>
                <span>{l.label}</span>
                <span className="legend-range">{l.range}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="map-right-panel">
          {/* Hovered city detail */}
          {hovered ? (
            <div className="map-city-detail">
              <div className="map-detail-header" style={{borderColor: getAQICategory(hovered.aqi).color}}>
                <div>
                  <div className="map-detail-city">{hovered.city}</div>
                  <div className="map-detail-state">{hovered.state}</div>
                </div>
                <div className="map-detail-aqi" style={{color: getAQICategory(hovered.aqi).color}}>
                  {hovered.aqi}
                </div>
              </div>
              <div className="map-pollutants">
                {[
                  {n:"PM2.5", v:hovered.pm25, l:60},
                  {n:"PM10",  v:hovered.pm10, l:100},
                  {n:"NO₂",   v:hovered.no2,  l:80},
                  {n:"SO₂",   v:hovered.so2,  l:80},
                ].map(p => (
                  <div key={p.n} className="map-poll-row">
                    <span className="map-poll-name">{p.n}</span>
                    <div className="map-poll-bar-wrap">
                      <div className="map-poll-bar" style={{
                        width:`${Math.min(p.v/p.l*100,100)}%`,
                        background: p.v > p.l ? "#ff4444" : getAQICategory(hovered.aqi).color
                      }}/>
                    </div>
                    <span className={p.v > p.l ? "over-limit" : ""}>{p.v}</span>
                  </div>
                ))}
              </div>
              <div className="map-advisory" style={{borderColor: getAQICategory(hovered.aqi).color, background: getAQICategory(hovered.aqi).color + "11"}}>
                <strong style={{color: getAQICategory(hovered.aqi).color}}>{getAQICategory(hovered.aqi).label}</strong>
                <p>{hovered.aqi > 300 ? "Avoid outdoors. N95 mask mandatory." : hovered.aqi > 200 ? "Sensitive groups stay indoors." : hovered.aqi > 100 ? "Limit prolonged outdoor activity." : "Safe — enjoy outdoor activities."}</p>
              </div>
            </div>
          ) : (
            <div className="map-hover-hint">
              <div className="hint-icon">🗺️</div>
              <p>Hover over any city dot on the map to see detailed AQI & pollutant data</p>
            </div>
          )}

          {/* Ranking List */}
          <div className="city-ranking">
            <div className="ranking-title">📊 AQI Rankings</div>
            <div className="ranking-list">
              {sortedByAqi.filter(c => filteredNames.has(c.city)).slice(0, 10).map((city, i) => {
                const cat = getAQICategory(city.aqi);
                return (
                  <div key={city.city} className="ranking-row"
                    onMouseEnter={() => setHovered(city)}
                    onMouseLeave={() => setHovered(null)}
                    style={{cursor:"pointer", background: hovered?.city === city.city ? "var(--bg4)" : "transparent"}}>
                    <span className="rank-num" style={{color: i < 3 ? "#ff4444" : "var(--muted)"}}>#{i+1}</span>
                    <span className="rank-city">{city.city}</span>
                    <div className="rank-bar-wrap">
                      <div className="rank-bar" style={{width:`${city.aqi/500*100}%`, background: cat.color}}/>
                    </div>
                    <span className="rank-aqi" style={{color: cat.color}}>{city.aqi}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="heatmap-stats">
        {[
          {label:"Cities with AQI > 300 (Very Poor)", value: cityAQIData.filter(c=>c.aqi>300).length, color:"#ff4444"},
          {label:"Cities with AQI 200-300 (Poor)",    value: cityAQIData.filter(c=>c.aqi>200&&c.aqi<=300).length, color:"#ff9500"},
          {label:"Cities with AQI 100-200 (Moderate)", value: cityAQIData.filter(c=>c.aqi>100&&c.aqi<=200).length, color:"#ffde03"},
          {label:"Cities with AQI < 100 (Safe)",       value: cityAQIData.filter(c=>c.aqi<=100).length, color:"#69f0ae"},
        ].map((s,i) => (
          <div key={i} className="heatmap-stat-card" style={{"--sc": s.color}}>
            <div className="heatmap-stat-num" style={{color:s.color}}>{s.value}</div>
            <div className="heatmap-stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}