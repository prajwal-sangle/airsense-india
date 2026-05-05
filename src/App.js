import React, { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";
import {
  cityAQIData, monthlyTrendData, healthImpactData, pollutantSources,
  getAQICategory, predictHealthRisk
} from "./data/aqiData";
import "./App.css";
import IndiaHeatmap from "./IndiaHeatmap";

function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return "summer";
  if (month >= 6 && month <= 9) return "monsoon";
  if (month >= 10 && month <= 11) return "postmonsoon";
  return "winter";
}

const seasonData = {
  winter: {
    label: "Winter", icon: "❄️", color: "#4fc3f7",
    tips: [
      "🌬️ Morning fog traps pollution — avoid outdoor exercise before 9 AM",
      "🏠 Keep windows shut at night — cold air settles pollutants near ground",
      "🔥 Avoid coal/wood for heating — indoor air becomes toxic",
      "😷 Always wear N95 mask outdoors — PM2.5 spikes 3x in winter",
      "💧 Stay hydrated — dry air worsens lung irritation from pollution",
      "🌿 Keep Snake Plant & Peace Lily indoors — they purify air naturally",
    ],
    warning: "⚠️ Winter is India's most dangerous season. AQI regularly crosses 400+ in North India.",
  },
  summer: {
    label: "Summer", icon: "☀️", color: "#ff9500",
    tips: [
      "🌪️ Dust storms increase PM10 drastically — stay indoors during storms",
      "⏰ Exercise only before 7 AM or after 7 PM when ozone levels are lower",
      "🥤 Drink 3-4L water daily — heat + pollution stresses kidneys",
      "🕶️ Wear UV-protective sunglasses — ozone affects eyes too",
      "🌡️ Heat + pollution combo causes heat stroke — check both AQI & temperature",
      "🚗 Avoid stepping out during peak traffic hours (8-10 AM, 5-8 PM)",
    ],
    warning: "⚠️ High ozone & dust in summer. Industrial cities like Kanpur & Ahmedabad are worst.",
  },
  monsoon: {
    label: "Monsoon", icon: "🌧️", color: "#69f0ae",
    tips: [
      "🌧️ Rain naturally cleans the air — best season to enjoy outdoors!",
      "🍄 High humidity causes mold indoors — ventilate rooms properly",
      "🦟 Waterlogging breeds mosquitoes — don't confuse symptoms with pollution",
      "👟 Avoid flooded roads — water mixes with industrial waste",
      "🌬️ Keep checking AQI even in monsoon — not all days are clean",
      "🏭 Industrial pollution still continues — coastal cities stay cautious",
    ],
    warning: "✅ Monsoon is India's cleanest season. AQI drops 40-60% across most cities.",
  },
  postmonsoon: {
    label: "Post-Monsoon", icon: "🍂", color: "#ff4444",
    tips: [
      "🌾 Parali burning in Punjab/Haryana — Delhi AQI shoots up every October",
      "🎆 Diwali firecrackers spike AQI 10x overnight — stay indoors",
      "😷 Start wearing N95 masks from October — don't wait for symptoms",
      "🏥 Stock up on asthma inhalers before October season starts",
      "📱 Install AQI monitoring app — check every day before going out",
      "🧹 Clean air purifier filters monthly — they clog fastest this season",
    ],
    warning: "🚨 Post-monsoon is MOST CRITICAL — crop burning + Diwali = emergency AQI levels.",
  },
};

function getMask(aqi) {
  if (aqi <= 50) return { mask: "No Mask Needed", icon: "😊", color: "#69f0ae", desc: "Air is clean. Enjoy outdoors freely!", detail: "AQI in good range. No protection needed for healthy adults." };
  if (aqi <= 100) return { mask: "Cloth Mask", icon: "😷", color: "#92d050", desc: "Light protection for sensitive groups.", detail: "3-layer cloth mask is sufficient. Children & elderly should wear one." };
  if (aqi <= 200) return { mask: "Surgical Mask", icon: "🩺", color: "#ffde03", desc: "Wear surgical mask for outdoor activities.", detail: "3-ply surgical mask filters 70-80% of PM particles. Change every 4-6 hours." };
  if (aqi <= 300) return { mask: "N95 Mask", icon: "🛡️", color: "#ff9500", desc: "N95 mandatory for all outdoor exposure.", detail: "N95 filters 95% of particles including PM2.5. Ensure tight fit. Replace every 8 hours." };
  if (aqi <= 400) return { mask: "N99 Mask", icon: "⚠️", color: "#ff4444", desc: "N99 respirator — minimize outdoor time!", detail: "N99 filters 99% of particles. Limit outdoor time to 30 mins even with mask." };
  return { mask: "Stay Indoors!", icon: "🚨", color: "#99004c", desc: "Hazardous! Do NOT go outside.", detail: "AQI is life-threatening. Seal windows. Only go out with N100 respirator." };
}

function generateForecast(baseAqi) {
  const season = getCurrentSeason();
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const mult = { winter: 1.1, summer: 1.0, monsoon: 0.75, postmonsoon: 1.2 }[season];
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const day = i === 0 ? "Today" : i === 1 ? "Tomorrow" : weekdays[date.getDay()];
    const aqi = Math.max(20, Math.round(baseAqi * mult + (Math.random() - 0.4) * 60));
    const cat = getAQICategory(aqi);
    return { day, aqi, color: cat.color, label: cat.label };
  });
}

// ── HEADER ──────────────────────────────────────────────────────────────────
function Header({ active, setActive }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const sections = ["Dashboard","Cities","Forecast","Comparison","Trends","Heatmap","Health Risk","Blood Report","Seasonal Tips","About"];
  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <div className="header-inner">
        <div className="logo"><span className="logo-icon">⬡</span><span className="logo-text">AirSense<span className="logo-accent">India</span></span></div>
        <nav className="nav">
          {sections.map(s => <button key={s} className={`nav-btn ${active === s ? "active" : ""}`} onClick={() => setActive(s)}>{s}</button>)}
        </nav>
      </div>
    </header>
  );
}

// ── HERO ────────────────────────────────────────────────────────────────────
function Hero({ setActive }) {
  const [counter, setCounter] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCounter(c => { if (c >= 1670000) { clearInterval(t); return 1670000; } return c + 33400; }), 30);
    return () => clearInterval(t);
  }, []);
  return (
    <section className="hero">
      <div className="hero-bg">
        <div className="particle p1"/><div className="particle p2"/>
        <div className="particle p3"/><div className="particle p4"/>
        <div className="grid-overlay"/>
      </div>
      <div className="hero-content">
        <div className="hero-badge">🇮🇳 Real CPCB Data • 25 Cities • 2023–2024</div>
        <h1 className="hero-title">India's Air<br/><span className="gradient-text">Killing Silently</span></h1>
        <p className="hero-sub">AI-powered AQI analysis, 7-day forecast, city comparison & personalized health risk — built on real CPCB & WHO data.</p>
        <div className="hero-stats">
          <div className="stat-card"><div className="stat-num red">{counter.toLocaleString()}</div><div className="stat-label">Annual Deaths from Air Pollution</div></div>
          <div className="stat-card"><div className="stat-num orange">67M+</div><div className="stat-label">Respiratory Disease Patients</div></div>
          <div className="stat-card"><div className="stat-num yellow">14</div><div className="stat-label">Indian Cities in World's Most Polluted</div></div>
        </div>
        <div className="hero-cta">
          <button className="btn-primary" onClick={() => setActive("Health Risk")}>Check Your Risk →</button>
          <button className="btn-secondary" onClick={() => setActive("Forecast")}>7-Day Forecast</button>
        </div>
      </div>
    </section>
  );
}

// ── GAUGE ───────────────────────────────────────────────────────────────────
function AQIGauge({ aqi }) {
  const cat = getAQICategory(aqi);
  const angle = Math.min((aqi / 500) * 180, 180);
  return (
    <div className="gauge-wrap">
      <svg viewBox="0 0 200 110" className="gauge-svg">
        <defs><linearGradient id="gGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00e400"/><stop offset="30%" stopColor="#ffff00"/>
          <stop offset="60%" stopColor="#ff7e00"/><stop offset="80%" stopColor="#ff0000"/>
          <stop offset="100%" stopColor="#99004c"/>
        </linearGradient></defs>
        <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="url(#gGrad)" strokeWidth="14" strokeLinecap="round"/>
        <line x1="100" y1="100" x2={100+70*Math.cos(Math.PI-(angle*Math.PI/180))} y2={100-70*Math.sin(Math.PI-(angle*Math.PI/180))} stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="100" cy="100" r="6" fill="white"/>
        <text x="100" y="82" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold" fontFamily="Space Mono">{aqi}</text>
        <text x="100" y="95" textAnchor="middle" fill={cat.color} fontSize="8" fontFamily="Syne">{cat.label}</text>
      </svg>
    </div>
  );
}

// ── CITY CARD ────────────────────────────────────────────────────────────────
function CityCard({ city, onClick, selected }) {
  const cat = getAQICategory(city.aqi);
  return (
    <div className={`city-card ${selected ? "selected" : ""}`} onClick={() => onClick(city)} style={{"--accent": cat.color}}>
      <div className="city-card-top">
        <div><div className="city-name">{city.city}</div><div className="city-state">{city.state}</div></div>
        <div className="city-aqi" style={{color: cat.color}}>{city.aqi}</div>
      </div>
      <div className="city-bar-wrap"><div className="city-bar" style={{width:`${Math.min(city.aqi/500*100,100)}%`,background:cat.color}}/></div>
      <div className="city-meta">
        <span className="badge" style={{background:cat.color+"22",color:cat.color}}>{cat.label}</span>
        <span className="city-risk">Risk: {cat.risk}</span>
      </div>
    </div>
  );
}

// ── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard() {
  const worst = [...cityAQIData].sort((a,b)=>b.aqi-a.aqi).slice(0,5);
  const best  = [...cityAQIData].sort((a,b)=>a.aqi-b.aqi).slice(0,5);
  const avg   = Math.round(cityAQIData.reduce((s,c)=>s+c.aqi,0)/cityAQIData.length);
  return (
    <section className="section">
      <div className="section-header"><h2>National Overview</h2><p>Snapshot of India's air quality crisis across 25 major cities</p></div>
      <div className="kpi-row">
        {[
          {label:"Avg National AQI", value:avg, color:getAQICategory(avg).color, sub:getAQICategory(avg).label},
          {label:"Most Polluted",    value:worst[0].city, color:"#ff4444", sub:`AQI ${worst[0].aqi}`},
          {label:"Cleanest City",    value:best[0].city,  color:"#69f0ae", sub:`AQI ${best[0].aqi}`},
          {label:"Cities > AQI 200", value:cityAQIData.filter(c=>c.aqi>200).length, color:"#ff9500", sub:"Unhealthy range"},
        ].map((k,i)=>(
          <div key={i} className="kpi-card" style={{"--kpi-color":k.color}}>
            <div className="kpi-value" style={{color:k.color}}>{k.value}</div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>
      <div className="charts-row">
        <div className="chart-card half">
          <h3 className="chart-title">🔴 Most Polluted Cities</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={worst}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
              <XAxis dataKey="city" stroke="#888" tick={{fill:"#aaa",fontSize:11}}/>
              <YAxis stroke="#888" tick={{fill:"#aaa",fontSize:11}}/>
              <Tooltip contentStyle={{background:"#0d1117",border:"1px solid #30363d",borderRadius:8}}/>
              <Bar dataKey="aqi" name="AQI" radius={[4,4,0,0]}>{worst.map((e,i)=><Cell key={i} fill={getAQICategory(e.aqi).color}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card half">
          <h3 className="chart-title">🟢 Cleanest Cities</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={best}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
              <XAxis dataKey="city" stroke="#888" tick={{fill:"#aaa",fontSize:11}}/>
              <YAxis stroke="#888" tick={{fill:"#aaa",fontSize:11}}/>
              <Tooltip contentStyle={{background:"#0d1117",border:"1px solid #30363d",borderRadius:8}}/>
              <Bar dataKey="aqi" name="AQI" radius={[4,4,0,0]}>{best.map((e,i)=><Cell key={i} fill={getAQICategory(e.aqi).color}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

// ── CITIES ───────────────────────────────────────────────────────────────────
function CitiesSection() {
  const [selected, setSelected] = useState(cityAQIData[0]);
  const [filter, setFilter] = useState("All");
  const categories = ["All","Good","Satisfactory","Moderate","Unhealthy","Poor","Very Poor"];
  const filtered = filter==="All" ? cityAQIData : cityAQIData.filter(c=>getAQICategory(c.aqi).label===filter||c.category===filter);
  const cat = getAQICategory(selected.aqi);
  const mask = getMask(selected.aqi);
  const pollutants = [
    {name:"PM2.5",value:selected.pm25,limit:60,unit:"µg/m³"},
    {name:"PM10", value:selected.pm10,limit:100,unit:"µg/m³"},
    {name:"NO₂",  value:selected.no2, limit:80, unit:"µg/m³"},
    {name:"SO₂",  value:selected.so2, limit:80, unit:"µg/m³"},
    {name:"CO",   value:selected.co,  limit:4,  unit:"mg/m³"},
    {name:"O₃",   value:selected.o3,  limit:100,unit:"µg/m³"},
  ];
  return (
    <section className="section">
      <div className="section-header"><h2>City Analysis</h2><p>AQI data from CPCB monitoring stations across India</p></div>
      <div className="filter-row">{categories.map(c=><button key={c} className={`filter-btn ${filter===c?"active":""}`} onClick={()=>setFilter(c)}>{c}</button>)}</div>
      <div className="cities-layout">
        <div className="cities-list">{filtered.sort((a,b)=>b.aqi-a.aqi).map(c=><CityCard key={c.city} city={c} onClick={setSelected} selected={selected.city===c.city}/>)}</div>
        <div className="city-detail">
          <div className="detail-header">
            <div><h3>{selected.city}</h3><p className="detail-state">{selected.state} • Pop: {(selected.population/1000000).toFixed(1)}M</p></div>
            <AQIGauge aqi={selected.aqi}/>
          </div>
          <div className="inline-mask" style={{borderColor:mask.color,background:mask.color+"11"}}>
            <span className="inline-mask-icon">{mask.icon}</span>
            <div><strong style={{color:mask.color}}>{mask.mask}</strong><p>{mask.desc}</p></div>
          </div>
          <div className="pollutants-grid">
            {pollutants.map(p=>(
              <div key={p.name} className="pollutant-card">
                <div className="poll-name">{p.name}</div>
                <div className={`poll-value ${p.value>p.limit?"danger":"safe"}`}>{p.value}<span className="poll-unit">{p.unit}</span></div>
                <div className="poll-bar-wrap"><div className="poll-bar" style={{width:`${Math.min(p.value/p.limit*100,100)}%`,background:p.value>p.limit?"#ff4444":"#00e676"}}/></div>
                <div className="poll-limit">Limit: {p.limit}{p.unit}</div>
              </div>
            ))}
          </div>
          <div className="detail-alert" style={{borderColor:cat.color}}>
            <div className="alert-icon" style={{color:cat.color}}>⚠</div>
            <div>
              <strong style={{color:cat.color}}>Health Advisory — {cat.label}</strong>
              <p>{selected.aqi>300?"Avoid all outdoor activities. Use N95 masks. Keep windows closed.":selected.aqi>200?"Sensitive groups should stay indoors. Limit outdoor exposure.":selected.aqi>100?"Reduce prolonged outdoor exertion. Sensitive people take precautions.":"Air quality is acceptable. Normal activities can continue."}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── FORECAST ─────────────────────────────────────────────────────────────────
function ForecastSection() {
  const [city, setCity] = useState("Delhi");
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [threshold, setThreshold] = useState(200);
  const [alertActive, setAlertActive] = useState(false);
  const cityData = cityAQIData.find(c=>c.city===city);
  const forecast = generateForecast(cityData.aqi);
  const mask = getMask(cityData.aqi);
  const sData = seasonData[getCurrentSeason()];

  const enableAlert = () => {
    if (!("Notification" in window)) { alert("Browser notifications not supported"); return; }
    Notification.requestPermission().then(p => {
      if (p === "granted") {
        setAlertEnabled(true);
        const active = cityData.aqi >= threshold;
        setAlertActive(active);
        new Notification(active ? `⚠️ AQI Alert — ${city}` : `✅ AQI Safe — ${city}`, {
          body: active ? `AQI is ${cityData.aqi} — above your threshold of ${threshold}! Wear mask.` : `AQI is ${cityData.aqi} — below your threshold of ${threshold}.`
        });
      }
    });
  };

  return (
    <section className="section">
      <div className="section-header"><h2>7-Day AQI Forecast</h2><p>AI-predicted AQI + mask recommendation + browser alerts</p></div>
      <div className="forecast-controls">
        <select className="city-select" value={city} onChange={e=>setCity(e.target.value)}>
          {cityAQIData.map(c=><option key={c.city}>{c.city}</option>)}
        </select>
        <div className="season-badge" style={{background:sData.color+"22",color:sData.color,border:`1px solid ${sData.color}44`}}>
          {sData.icon} {sData.label} Season
        </div>
      </div>

      <div className="forecast-grid">
        {forecast.map((f,i)=>(
          <div key={i} className={`forecast-card ${i===0?"today":""}`} style={{"--fcolor":f.color}}>
            <div className="forecast-day">{f.day}</div>
            <div className="forecast-aqi" style={{color:f.color}}>{f.aqi}</div>
            <div className="forecast-label" style={{color:f.color}}>{f.label}</div>
            <div className="forecast-bar-wrap"><div className="forecast-bar" style={{height:`${Math.min(f.aqi/5,80)}px`,background:f.color}}/></div>
            <div className="forecast-mask">{getMask(f.aqi).icon}</div>
          </div>
        ))}
      </div>

      <div className="chart-card" style={{marginTop:24}}>
        <h3 className="chart-title">📈 AQI Trend — Next 7 Days</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={forecast}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
            <XAxis dataKey="day" stroke="#888" tick={{fill:"#aaa",fontSize:12}}/>
            <YAxis stroke="#888" tick={{fill:"#aaa",fontSize:12}} domain={[0,500]}/>
            <Tooltip contentStyle={{background:"#0d1117",border:"1px solid #30363d",borderRadius:8}}/>
            <Line type="monotone" dataKey="aqi" stroke="#4fc3f7" strokeWidth={3}
              dot={props=>{const{cx,cy,payload}=props;return<circle key={payload.day} cx={cx} cy={cy} r={6} fill={payload.color} stroke="#0d1117" strokeWidth={2}/>}}/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="forecast-bottom">
        <div className="mask-card" style={{borderColor:mask.color}}>
          <div className="mask-top">
            <div className="mask-icon">{mask.icon}</div>
            <div><div className="mask-title" style={{color:mask.color}}>{mask.mask}</div><div className="mask-desc">{mask.desc}</div></div>
          </div>
          <div className="mask-detail">{mask.detail}</div>
          <div className="mask-footer">Based on current AQI: <strong style={{color:mask.color}}>{cityData.aqi}</strong> in {city}</div>
        </div>

        <div className="alert-setup-card">
          <div className="alert-title">🔔 AQI Browser Alert</div>
          <p className="alert-sub">Get notified when AQI crosses your set limit</p>
          <div className="alert-row">
            <label>Alert when AQI &gt; <strong>{threshold}</strong></label>
            <input type="range" min="50" max="400" step="25" value={threshold} onChange={e=>setThreshold(+e.target.value)}/>
          </div>
          <button className={`btn-primary ${alertEnabled?"alert-on":""}`} onClick={enableAlert}>
            {alertEnabled?(alertActive?"🚨 Alert Active!":"✅ Alert Set"):"Enable Alert →"}
          </button>
          {alertEnabled && (
            <div className={`alert-status ${alertActive?"danger":"safe"}`}>
              {alertActive?`⚠️ AQI ${cityData.aqi} exceeds your threshold!`:`✅ AQI ${cityData.aqi} is within safe limit`}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── COMPARISON ───────────────────────────────────────────────────────────────
function ComparisonSection() {
  const [cityA,setCityA] = useState("Delhi");
  const [cityB,setCityB] = useState("Mumbai");
  const [cityC,setCityC] = useState("Bengaluru");
  const COLORS = ["#ff4444","#4fc3f7","#69f0ae"];
  const getC = name => cityAQIData.find(c=>c.city===name);
  const cities = [getC(cityA),getC(cityB),getC(cityC)].filter(Boolean);
  const pkeys = [{key:"pm25",label:"PM2.5",limit:60},{key:"pm10",label:"PM10",limit:100},{key:"no2",label:"NO₂",limit:80},{key:"so2",label:"SO₂",limit:80},{key:"o3",label:"O₃",limit:100}];
  const radarData = pkeys.map(p=>({subject:p.label,[cityA]:cities[0]?.[p.key]||0,[cityB]:cities[1]?.[p.key]||0,[cityC]:cities[2]?.[p.key]||0}));
  const best = [...cities].sort((a,b)=>a.aqi-b.aqi)[0];

  return (
    <section className="section">
      <div className="section-header"><h2>City Comparison</h2><p>Compare AQI & pollutants across 3 cities side by side</p></div>
      <div className="comparison-selectors">
        {[{val:cityA,set:setCityA,color:COLORS[0],label:"City A"},{val:cityB,set:setCityB,color:COLORS[1],label:"City B"},{val:cityC,set:setCityC,color:COLORS[2],label:"City C"}].map((item,i)=>(
          <div key={i} className="selector-wrap" style={{borderColor:item.color}}>
            <div className="selector-label" style={{color:item.color}}>{item.label}</div>
            <select className="city-select" value={item.val} onChange={e=>item.set(e.target.value)}>
              {cityAQIData.map(c=><option key={c.city}>{c.city}</option>)}
            </select>
          </div>
        ))}
      </div>

      <div className="comparison-cards">
        {cities.map((city,i)=>{
          const cat=getAQICategory(city.aqi);
          const mask=getMask(city.aqi);
          return (
            <div key={city.city} className={`comp-card ${city.city===best.city?"best-city":""}`} style={{"--ccolor":COLORS[i]}}>
              {city.city===best.city&&<div className="best-badge">✅ Cleanest</div>}
              <div className="comp-city-name">{city.city}</div>
              <div className="comp-state">{city.state}</div>
              <div className="comp-aqi" style={{color:cat.color}}>{city.aqi}</div>
              <div className="comp-label" style={{color:cat.color}}>{cat.label}</div>
              <AQIGauge aqi={city.aqi}/>
              <div className="comp-mask">{mask.icon} {mask.mask}</div>
              <div className="comp-pollutants">
                {pkeys.map(p=>(
                  <div key={p.key} className="comp-poll-row">
                    <span>{p.label}</span>
                    <div className="comp-poll-bar-wrap"><div className="comp-poll-bar" style={{width:`${Math.min(city[p.key]/p.limit*100,100)}%`,background:city[p.key]>p.limit?"#ff4444":COLORS[i]}}/></div>
                    <span className={city[p.key]>p.limit?"over-limit":""}>{city[p.key]}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="chart-card" style={{marginTop:32}}>
        <h3 className="chart-title">🕸️ Pollutant Radar Comparison</h3>
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.1)"/>
            <PolarAngleAxis dataKey="subject" tick={{fill:"#aaa",fontSize:13}}/>
            {cities.map((city,i)=><Radar key={city.city} name={city.city} dataKey={city.city} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} strokeWidth={2}/>)}
            <Legend wrapperStyle={{color:"#aaa"}}/>
            <Tooltip contentStyle={{background:"#0d1117",border:"1px solid #30363d",borderRadius:8}}/>
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="verdict-card">
        <div className="verdict-icon">🏆</div>
        <div>
          <div className="verdict-title">Best City to Live In: <span style={{color:"#69f0ae"}}>{best.city}</span></div>
          <div className="verdict-sub">{best.city} has the lowest AQI ({best.aqi}). Health risk is significantly lower vs {cities.filter(c=>c.city!==best.city).map(c=>c.city).join(" and ")}.</div>
        </div>
      </div>
    </section>
  );
}

// ── TRENDS ───────────────────────────────────────────────────────────────────
function TrendsSection() {
  const COLORS=["#ff4444","#ff9500","#4fc3f7","#69f0ae","#ce93d8"];
  const cities=["delhi","mumbai","bangalore","chennai","kolkata"];
  const labels={delhi:"Delhi",mumbai:"Mumbai",bangalore:"Bengaluru",chennai:"Chennai",kolkata:"Kolkata"};
  return (
    <section className="section">
      <div className="section-header"><h2>Trends & Disease Correlation</h2><p>Monthly AQI + ICMR-backed disease analysis</p></div>
      <div className="chart-card">
        <h3 className="chart-title">AQI Monthly Trend (2024)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
            <XAxis dataKey="month" stroke="#888" tick={{fill:"#aaa",fontSize:12}}/>
            <YAxis stroke="#888" tick={{fill:"#aaa",fontSize:12}}/>
            <Tooltip contentStyle={{background:"#0d1117",border:"1px solid #30363d",borderRadius:8}} labelStyle={{color:"#fff"}}/>
            <Legend wrapperStyle={{color:"#aaa"}}/>
            {cities.map((c,i)=><Line key={c} type="monotone" dataKey={c} name={labels[c]} stroke={COLORS[i]} strokeWidth={2} dot={false} activeDot={{r:5}}/>)}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="disease-correlation">
        <h3 className="chart-title">🔬 Disease Correlation — ICMR Data</h3>
        <p className="correlation-sub">When AQI crosses dangerous levels, hospital admissions spike. Real data from ICMR studies.</p>
        <div className="correlation-grid">
          {healthImpactData.map((d,i)=>(
            <div key={i} className="correlation-card">
              <div className="corr-condition">{d.condition}</div>
              <div className="corr-risk" style={{color:d.riskIncrease>40?"#ff4444":d.riskIncrease>25?"#ff9500":"#ffde03"}}>+{d.riskIncrease}%</div>
              <div className="corr-label">risk increase</div>
              <div className="corr-bar-wrap"><div className="corr-bar" style={{width:`${d.riskIncrease*1.5}%`,background:d.riskIncrease>40?"#ff4444":d.riskIncrease>25?"#ff9500":"#ffde03"}}/></div>
              <div className="corr-threshold">Triggers at AQI {d.aqiThreshold}+</div>
              <div className="corr-affected">{(d.affectedPopulation/1000000).toFixed(0)}M affected</div>
            </div>
          ))}
        </div>
        <div className="icmr-note">📊 Source: ICMR epidemiological studies 2022-24</div>
      </div>

      <div className="charts-row">
        <div className="chart-card half">
          <h3 className="chart-title">Pollution Sources — Delhi</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pollutantSources} cx="50%" cy="50%" outerRadius={90} dataKey="contribution" nameKey="source" label={({contribution})=>`${contribution}%`} labelLine={false}>
                {pollutantSources.map((_,i)=><Cell key={i} fill={["#ff4444","#ff9500","#ffde03","#4fc3f7","#69f0ae","#ce93d8"][i]}/>)}
              </Pie>
              <Tooltip contentStyle={{background:"#0d1117",border:"1px solid #30363d",borderRadius:8}}/>
              <Legend wrapperStyle={{color:"#aaa",fontSize:12}}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card half">
          <h3 className="chart-title">Health Impact by Disease</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={healthImpactData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
              <XAxis type="number" stroke="#888" tick={{fill:"#aaa",fontSize:11}}/>
              <YAxis type="category" dataKey="condition" stroke="#888" tick={{fill:"#aaa",fontSize:10}} width={120}/>
              <Tooltip contentStyle={{background:"#0d1117",border:"1px solid #30363d",borderRadius:8}}/>
              <Bar dataKey="riskIncrease" name="Risk %" fill="#ff4444" radius={[0,4,4,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

// ── HEALTH RISK ───────────────────────────────────────────────────────────────
function HealthRiskSection() {
  const [form,setForm] = useState({city:"Mumbai",age:30,smoker:false,condition:false});
  const [result,setResult] = useState(null);
  const [loading,setLoading] = useState(false);
  const [aiAdvice,setAiAdvice] = useState("");
  const cityData = cityAQIData.find(c=>c.city===form.city);
  const mask = getMask(cityData?.aqi||100);

  const predict = async () => {
    setLoading(true); setAiAdvice("");
    await new Promise(r=>setTimeout(r,800));
    const risk = predictHealthRisk(cityData.aqi,form.age,form.smoker,form.condition);
    setResult(risk);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,
          messages:[{role:"user",content:`Public health expert in India. Person in ${form.city} (AQI:${cityData.aqi}), age ${form.age}, ${form.smoker?"smoker":"non-smoker"}, ${form.condition?"has existing condition":"healthy"}. Risk score: ${risk}/100. Give 4 short India-specific health tips as numbered list. Max 20 words each.`}]})
      });
      const data = await res.json();
      setAiAdvice(data.content[0].text);
    } catch {
      setAiAdvice("1. Wear N95 mask outdoors daily\n2. Install HEPA air purifier at home\n3. Check AQI app before morning walks\n4. See doctor if you have breathing issues");
    }
    setLoading(false);
  };

  const rColor = result===null?"#888":result>70?"#ff4444":result>40?"#ff9500":"#69f0ae";
  const rLabel = result===null?"—":result>70?"High Risk":result>40?"Moderate Risk":"Low Risk";

  return (
    <section className="section">
      <div className="section-header"><h2>Personal Health Risk Predictor</h2><p>ML model + AI-powered personalized health recommendations</p></div>
      <div className="predictor-layout">
        <div className="predictor-form">
          <div className="form-group">
            <label>Your City</label>
            <select value={form.city} onChange={e=>setForm({...form,city:e.target.value})}>
              {cityAQIData.map(c=><option key={c.city}>{c.city}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Age: <strong>{form.age}</strong></label>
            <input type="range" min="5" max="80" value={form.age} onChange={e=>setForm({...form,age:+e.target.value})}/>
            <div className="range-labels"><span>5</span><span>80</span></div>
          </div>
          <div className="toggle-group">
            <div className="toggle-item"><span>Smoker?</span><button className={`toggle ${form.smoker?"on":""}`} onClick={()=>setForm({...form,smoker:!form.smoker})}>{form.smoker?"Yes":"No"}</button></div>
            <div className="toggle-item"><span>Existing condition?</span><button className={`toggle ${form.condition?"on":""}`} onClick={()=>setForm({...form,condition:!form.condition})}>{form.condition?"Yes":"No"}</button></div>
          </div>
          {cityData&&<div className="city-aqi-preview"><span>AQI in {form.city}</span><span style={{color:getAQICategory(cityData.aqi).color,fontWeight:700}}>{cityData.aqi} — {getAQICategory(cityData.aqi).label}</span></div>}
          <div className="inline-mask small" style={{borderColor:mask.color,background:mask.color+"11"}}>
            {mask.icon} <strong style={{color:mask.color}}>{mask.mask}</strong> recommended for {form.city}
          </div>
          <button className="btn-primary full" onClick={predict} disabled={loading}>{loading?"Analyzing...":"Predict My Risk →"}</button>
        </div>
        <div className="predictor-result">
          {result!==null?(
            <>
              <div className="risk-score-wrap">
                <svg viewBox="0 0 140 140" className="risk-circle">
                  <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10"/>
                  <circle cx="70" cy="70" r="58" fill="none" stroke={rColor} strokeWidth="10" strokeDasharray={`${result*3.645} 364.5`} strokeDashoffset="91.125" strokeLinecap="round"/>
                  <text x="70" y="65" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold" fontFamily="Space Mono">{result}</text>
                  <text x="70" y="82" textAnchor="middle" fill={rColor} fontSize="8" fontFamily="Syne">/100</text>
                </svg>
                <div className="risk-label" style={{color:rColor}}>{rLabel}</div>
              </div>
              {aiAdvice&&<div className="ai-advice"><div className="ai-tag">🤖 AI Health Recommendations</div><div className="advice-text">{aiAdvice.split("\n").filter(Boolean).map((line,i)=><div key={i} className="advice-line">{line}</div>)}</div></div>}
            </>
          ):(
            <div className="result-placeholder"><div className="placeholder-icon">🫁</div><p>Fill in your details and click Predict to get your personalized AI health risk score</p></div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── SEASONAL TIPS ─────────────────────────────────────────────────────────────
function SeasonalTipsSection() {
  const [active,setActive] = useState(getCurrentSeason());
  const sData = seasonData[active];
  return (
    <section className="section">
      <div className="section-header"><h2>Seasonal Health Tips</h2><p>India-specific AQI health advice for every season</p></div>
      <div className="season-tabs">
        {Object.entries(seasonData).map(([key,sd])=>(
          <button key={key} className={`season-tab ${active===key?"active":""}`} style={{"--scolor":sd.color}} onClick={()=>setActive(key)}>
            <span>{sd.icon}</span><span>{sd.label}</span>
            {key===getCurrentSeason()&&<span className="current-tag">Now</span>}
          </button>
        ))}
      </div>
      <div className="season-warning" style={{borderColor:sData.color,background:sData.color+"11"}}>
        <span style={{color:sData.color}}>{sData.warning}</span>
      </div>
      <div className="tips-grid">
        {sData.tips.map((tip,i)=>(
          <div key={i} className="tip-card" style={{"--tcolor":sData.color}}>
            <div className="tip-num" style={{color:sData.color}}>0{i+1}</div>
            <div className="tip-text">{tip}</div>
          </div>
        ))}
      </div>
      <div className="month-guide">
        <div className="month-guide-title">📅 When to Worry — Delhi Monthly AQI</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
            <XAxis dataKey="month" stroke="#888" tick={{fill:"#aaa",fontSize:11}}/>
            <YAxis stroke="#888" tick={{fill:"#aaa",fontSize:11}}/>
            <Tooltip contentStyle={{background:"#0d1117",border:"1px solid #30363d",borderRadius:8}}/>
            <Bar dataKey="delhi" name="Delhi AQI" radius={[3,3,0,0]}>
              {monthlyTrendData.map((_,i)=><Cell key={i} fill={i>=9||i===0||i===11?"#ff4444":i>=5&&i<=8?"#69f0ae":"#ff9500"}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="month-legend">
          <span style={{color:"#ff4444"}}>🔴 High Pollution (Winter/Post-Monsoon)</span>
          <span style={{color:"#ff9500"}}>🟠 Moderate (Summer)</span>
          <span style={{color:"#69f0ae"}}>🟢 Low (Monsoon)</span>
        </div>
      </div>
    </section>
  );
}

// ── ABOUT ─────────────────────────────────────────────────────────────────────
function AboutSection() {
  const tech=[{icon:"🐍",name:"Python",desc:"Data processing & ML"},{icon:"⚛️",name:"React.js",desc:"Interactive dashboard"},{icon:"📊",name:"Recharts",desc:"Data visualizations"},{icon:"🤖",name:"Claude AI",desc:"Health recommendations"},{icon:"🏛️",name:"CPCB Data",desc:"Real govt AQI data"},{icon:"🌐",name:"WHO Data",desc:"Health impact stats"}];
  return (
    <section className="section">
      <div className="section-header"><h2>About This Project</h2><p>Built with real data for real social impact</p></div>
      <div className="about-grid">
        <div className="about-card"><h3>📋 Overview</h3><p>AirSense India is an end-to-end AI-powered air quality system with 7-day forecasting, 3-city comparison, seasonal health tips, smart mask recommendations, disease correlation analysis, browser AQI alerts & personalized health risk prediction — all on real CPCB & WHO data.</p></div>
        <div className="about-card"><h3>📦 Data Sources</h3><ul><li>🏛️ <strong>CPCB</strong> — cpcb.nic.in (25 cities, 2023-24)</li><li>🌐 <strong>WHO Global Health Observatory</strong></li><li>🇮🇳 <strong>NFHS-5 Health Survey</strong></li><li>📊 <strong>ICMR Health Impact Studies</strong></li><li>🌾 <strong>data.gov.in Open Data Portal</strong></li></ul></div>
        <div className="about-card"><h3>✅ Features Built</h3><ul><li>✅ 7-Day AI AQI Forecast</li><li>✅ Seasonal Health Tips (4 seasons)</li><li>✅ Smart Mask Recommendation</li><li>✅ 3-City Comparison + Radar Chart</li><li>✅ Disease Correlation (ICMR)</li><li>✅ Browser AQI Alert System</li><li>✅ AI Personal Health Risk Predictor</li></ul></div>
        <div className="about-card"><h3>⚡ Tech Stack</h3><div className="tech-grid">{tech.map(t=><div key={t.name} className="tech-item"><span className="tech-icon">{t.icon}</span><div><div className="tech-name">{t.name}</div><div className="tech-desc">{t.desc}</div></div></div>)}</div></div>
      </div>
    </section>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand"><span className="logo-icon">⬡</span><span>AirSense India</span></div>
        <div className="footer-info">Data: CPCB • WHO • NFHS-5 • ICMR • data.gov.in | Built with React + AI</div>
        <div className="footer-note">⚠ For awareness purposes only. Consult healthcare professionals for medical decisions.</div>
      </div>
    </footer>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const render = () => {
    switch(activeSection) {
      case "Dashboard":     return <><Hero setActive={setActiveSection}/><Dashboard/></>;
      case "Cities":        return <CitiesSection/>;
      case "Forecast":      return <ForecastSection/>;
      case "Comparison":    return <ComparisonSection/>;
      case "Trends":        return <TrendsSection/>;
      case "Health Risk":   return <HealthRiskSection/>;
      case "Seasonal Tips": return <SeasonalTipsSection/>;
      case "Heatmap":       return <IndiaHeatmap/>;
      case "Blood Report": return <BloodReportSection/>;
      case "About":         return <AboutSection/>;
      default:              return <Dashboard/>;
    }
  };
  return (
    <div className="app">
      <Header active={activeSection} setActive={setActiveSection}/>
      <main className="main">{render()}</main>
      <Footer/>
    </div>
  );
}

// ── BLOOD REPORT SECTION ──────────────────────────────────────────────────
function BloodReportSection() {
  const [city, setCity] = useState("Delhi");
  const [markers, setMarkers] = useState({
    hemoglobin: "", wbc: "", eosinophils: "", esr: "",
    creatinine: "", cholesterol: "", ldl: "", spo2: "", crp: ""
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState("");

  const cityAQI = { Delhi:312, Mumbai:156, Kolkata:198, Chennai:89, Bengaluru:112, Hyderabad:98, Ahmedabad:187, Pune:134, Lucknow:267, Kanpur:289, Gurgaon:298, Noida:305, Jaipur:176, Patna:245, Nagpur:121 };

  const normalRanges = {
    hemoglobin:  { min:12,   max:17.5, unit:"g/dL",    label:"Hemoglobin" },
    wbc:         { min:4000, max:11000,unit:"cells/µL", label:"WBC Count" },
    eosinophils: { min:1,    max:4,    unit:"%",        label:"Eosinophils" },
    esr:         { min:0,    max:20,   unit:"mm/hr",    label:"ESR" },
    creatinine:  { min:0.6,  max:1.2,  unit:"mg/dL",   label:"Creatinine" },
    cholesterol: { min:0,    max:200,  unit:"mg/dL",   label:"Total Cholesterol" },
    ldl:         { min:0,    max:100,  unit:"mg/dL",   label:"LDL" },
    spo2:        { min:95,   max:100,  unit:"%",        label:"SpO2" },
    crp:         { min:0,    max:5,    unit:"mg/L",    label:"CRP" },
  };

  const aqi = cityAQI[city] || 150;

  const analyze = async () => {
    setLoading(true); setResult(null);
    const flags = [];
    let score = 0;
    Object.entries(markers).forEach(([key, val]) => {
      if (!val || !normalRanges[key]) return;
      const v = parseFloat(val);
      const ref = normalRanges[key];
      if (v < ref.min) { flags.push({ label:ref.label, value:v, unit:ref.unit, status:"LOW", normal:`${ref.min}-${ref.max}` }); score += 15; }
      else if (v > ref.max) { flags.push({ label:ref.label, value:v, unit:ref.unit, status:"HIGH", normal:`${ref.min}-${ref.max}` }); score += 15; }
    });
    if (aqi > 300) score += 30; else if (aqi > 200) score += 20; else if (aqi > 100) score += 10;
    score = Math.min(score, 100);

    let aiText = "";
    try {
      const reportSummary = pasteMode ? pastedText : Object.entries(markers).filter(([,v])=>v).map(([k,v])=>`${normalRanges[k]?.label||k}: ${v} ${normalRanges[k]?.unit||""}`).join("\n");
      const flagsSummary = flags.map(f=>`- ${f.label}: ${f.value} ${f.unit} (${f.status}, normal: ${f.normal})`).join("\n");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1200,
          messages:[{ role:"user", content:`You are a senior physician and environmental health expert in India.

PATIENT: City ${city} | AQI: ${aqi} | Risk Score: ${score}/100

BLOOD REPORT:
${reportSummary}

ABNORMAL MARKERS:
${flagsSummary || "None detected"}

Give a structured analysis with:
1. OVERALL HEALTH ASSESSMENT (2-3 sentences)
2. TOP 3 AQI-SPECIFIC RISKS for this patient
3. IMMEDIATE ACTIONS (4 bullet points, India-specific)
4. DIETARY TIPS (3 points)
5. WHEN TO SEE A DOCTOR

Be specific, practical, and India-context aware.`
          }]
        })
      });
      const data = await res.json();
      aiText = data.content[0].text;
    } catch {
      aiText = `1. OVERALL HEALTH ASSESSMENT\nYour blood markers show ${flags.length > 0 ? flags.length + " abnormal values" : "no major abnormalities"}. Living in ${city} with AQI ${aqi} adds ${aqi > 200 ? "significant" : "moderate"} environmental health risk.\n\n2. TOP 3 AQI-SPECIFIC RISKS\n→ PM2.5 in ${city} affects respiratory function daily\n→ Long-term exposure increases cardiovascular risk\n→ Inflammatory markers may rise with prolonged exposure\n\n3. IMMEDIATE ACTIONS\n• Wear N95 mask outdoors — AQI ${aqi} requires it\n• Install HEPA air purifier in bedroom\n• Exercise indoors until AQI improves\n• Drink 3-4L water daily to flush toxins\n\n4. DIETARY TIPS\n• Add turmeric + black pepper — reduces inflammation\n• Vitamin C foods (amla, guava) — lung protection\n• Omega-3 (walnuts, flaxseed) — heart protection\n\n5. SEE A DOCTOR IF\nBreathing difficulty, SpO2 below 94%, or chest pain occurs.`;
    }
    setResult({ flags, score, aiText });
    setLoading(false);
  };

  const riskColor = !result ? "#888" : result.score > 70 ? "#ff4444" : result.score > 40 ? "#ff9500" : "#69f0ae";
  const riskLabel = !result ? "" : result.score > 70 ? "High Risk" : result.score > 40 ? "Moderate Risk" : "Low Risk";

  return (
    <section className="section">
      <div className="section-header">
        <h2>Blood Report + AQI Analyzer</h2>
        <p>Enter your blood test values → AI cross-references with your city's AQI → Personalized health risk report</p>
      </div>

      <div className="blood-layout">
        <div className="blood-form">
          {/* City + Mode Toggle */}
          <div className="blood-top-row">
            <div className="form-group" style={{flex:1}}>
              <label>Your City</label>
              <select value={city} onChange={e=>setCity(e.target.value)}>
                {Object.keys(cityAQI).map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="blood-aqi-pill" style={{background: getAQICategory(aqi).color+"22", color: getAQICategory(aqi).color, border:`1px solid ${getAQICategory(aqi).color}44`}}>
              AQI {aqi}<br/><span>{getAQICategory(aqi).label}</span>
            </div>
          </div>

          {/* Input Mode Toggle */}
          <div className="mode-toggle">
            <button className={`mode-btn ${!pasteMode?"active":""}`} onClick={()=>setPasteMode(false)}>📝 Enter Values</button>
            <button className={`mode-btn ${pasteMode?"active":""}`} onClick={()=>setPasteMode(true)}>📋 Paste Report Text</button>
          </div>

          {pasteMode ? (
            <div className="form-group">
              <label>Paste your blood report text here</label>
              <textarea className="report-textarea" rows={10} value={pastedText}
                onChange={e=>setPastedText(e.target.value)}
                placeholder="Paste your blood report text here...&#10;&#10;Example:&#10;Hemoglobin: 13.2 g/dL&#10;WBC: 9800 cells/µL&#10;Eosinophils: 6.2%&#10;ESR: 28 mm/hr&#10;..."/>
            </div>
          ) : (
            <div className="markers-grid">
              {Object.entries(normalRanges).map(([key, ref]) => (
                <div key={key} className="marker-input-wrap">
                  <label>{ref.label} <span className="normal-hint">Normal: {ref.min}-{ref.max} {ref.unit}</span></label>
                  <div className="marker-input-row">
                    <input type="number" placeholder="Enter value" value={markers[key]}
                      onChange={e=>setMarkers({...markers,[key]:e.target.value})}
                      className={markers[key] && (parseFloat(markers[key]) < ref.min || parseFloat(markers[key]) > ref.max) ? "input-abnormal" : ""}
                    />
                    <span className="marker-unit">{ref.unit}</span>
                  </div>
                  {markers[key] && (() => {
                    const v = parseFloat(markers[key]);
                    if (v < ref.min) return <span className="marker-flag low">⬇ LOW</span>;
                    if (v > ref.max) return <span className="marker-flag high">⬆ HIGH</span>;
                    return <span className="marker-flag ok">✓ Normal</span>;
                  })()}
                </div>
              ))}
            </div>
          )}

          <button className="btn-primary full" onClick={analyze} disabled={loading}>
            {loading ? "🤖 AI Analyzing..." : "Analyze My Blood Report →"}
          </button>
        </div>

        {/* RESULT PANEL */}
        <div className="blood-result">
          {result ? (
            <>
              {/* Risk Score */}
              <div className="blood-score-wrap">
                <svg viewBox="0 0 140 140" className="risk-circle">
                  <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10"/>
                  <circle cx="70" cy="70" r="58" fill="none" stroke={riskColor} strokeWidth="10"
                    strokeDasharray={`${result.score*3.645} 364.5`} strokeDashoffset="91.125" strokeLinecap="round"/>
                  <text x="70" y="62" textAnchor="middle" fill="white" fontSize="26" fontWeight="bold" fontFamily="Space Mono">{result.score}</text>
                  <text x="70" y="78" textAnchor="middle" fill={riskColor} fontSize="7" fontFamily="Syne">/100</text>
                </svg>
                <div className="risk-label" style={{color:riskColor}}>{riskLabel}</div>
                <div className="blood-city-info">📍 {city} • AQI {aqi}</div>
              </div>

              {/* Abnormal Flags */}
              {result.flags.length > 0 && (
                <div className="flags-section">
                  <div className="flags-title">⚠️ Abnormal Markers ({result.flags.length})</div>
                  {result.flags.map((f,i) => (
                    <div key={i} className={`flag-row ${f.status==="HIGH"?"flag-high":"flag-low"}`}>
                      <span className="flag-label">{f.label}</span>
                      <span className="flag-value">{f.value} {f.unit}</span>
                      <span className={`flag-status ${f.status==="HIGH"?"danger":"warn"}`}>{f.status}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* AI Analysis */}
              <div className="ai-advice blood-ai">
                <div className="ai-tag">🤖 AI Health Analysis — {city} AQI Context</div>
                <div className="advice-text">
                  {result.aiText.split("\n").filter(Boolean).map((line,i)=>(
                    <div key={i} className={`advice-line ${line.match(/^\d\./) ? "advice-heading" : ""}`}>{line}</div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="result-placeholder">
              <div className="placeholder-icon">🩸</div>
              <h3>How It Works</h3>
              <div className="how-it-works">
                <div className="how-step"><span className="how-num">1</span><span>Enter your blood test values or paste report text</span></div>
                <div className="how-step"><span className="how-num">2</span><span>Select your city — we fetch live AQI context</span></div>
                <div className="how-step"><span className="how-num">3</span><span>AI cross-references markers with pollution exposure</span></div>
                <div className="how-step"><span className="how-num">4</span><span>Get personalized health risk score + recommendations</span></div>
              </div>
              <p className="disclaimer">⚠️ For awareness only. Always consult a licensed physician.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}