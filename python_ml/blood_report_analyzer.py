"""
============================================================
AirSense India — Blood Report + AQI Health Risk Analyzer
============================================================
Author  : AirSense India Project
Purpose : Upload blood report → AI analyzes health markers
          → Cross-references with city AQI → Personalized
          health risk assessment & recommendations
============================================================
"""

import json
import re
import os

# ─── CONFIG ──────────────────────────────────────────────────────────────────
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "your-api-key-here")
ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"

# City AQI reference (CPCB 2023-24)
CITY_AQI = {
    "Delhi": 312, "Mumbai": 156, "Kolkata": 198, "Chennai": 89,
    "Bengaluru": 112, "Hyderabad": 98, "Ahmedabad": 187, "Pune": 134,
    "Lucknow": 267, "Kanpur": 289, "Nagpur": 121, "Patna": 245,
    "Jaipur": 176, "Surat": 163, "Gurgaon": 298, "Noida": 305,
}

# Normal reference ranges for blood markers
NORMAL_RANGES = {
    "hemoglobin":          {"min": 12.0, "max": 17.5, "unit": "g/dL",   "low_risk": "anemia → worse oxygen transport in polluted air"},
    "wbc":                 {"min": 4000, "max": 11000, "unit": "cells/µL","high_risk": "inflammation/infection → worsened by pollution"},
    "eosinophils_percent": {"min": 1,    "max": 4,     "unit": "%",       "high_risk": "allergic response → pollution triggers asthma"},
    "esr":                 {"min": 0,    "max": 20,    "unit": "mm/hr",   "high_risk": "inflammation → pollution accelerates CVD risk"},
    "creatinine":          {"min": 0.6,  "max": 1.2,   "unit": "mg/dL",  "high_risk": "kidney stress → PM2.5 worsens kidney disease"},
    "cholesterol_total":   {"min": 0,    "max": 200,   "unit": "mg/dL",  "high_risk": "CVD risk → PM2.5 increases heart attack probability"},
    "ldl":                 {"min": 0,    "max": 100,   "unit": "mg/dL",  "high_risk": "bad cholesterol → air pollution compounds CVD risk"},
    "fev1_fvc_ratio":      {"min": 0.7,  "max": 1.0,   "unit": "ratio",  "low_risk": "lung obstruction → COPD worsened by pollution"},
    "spo2":                {"min": 95,   "max": 100,   "unit": "%",       "low_risk": "low oxygen → dangerous in polluted cities"},
    "crp":                 {"min": 0,    "max": 5,     "unit": "mg/L",   "high_risk": "systemic inflammation → pollution amplifies CRP"},
}


# ─── STEP 1: SAMPLE BLOOD REPORT (simulating PDF extraction) ─────────────────
def get_sample_blood_report():
    """
    In production: use PyPDF2 or pdfplumber to extract text from uploaded PDF.
    Here we simulate a realistic Indian patient blood report.
    """
    return """
    PATHOLOGY LABORATORY REPORT
    Patient: Rahul Sharma | Age: 42 | Gender: Male
    City: Delhi | Date: 15-Jan-2024

    COMPLETE BLOOD COUNT (CBC):
    Hemoglobin:        13.2 g/dL         (Normal: 13.5-17.5)
    WBC Count:         9800 cells/µL     (Normal: 4000-11000)
    Eosinophils:       6.2%              (Normal: 1-4%) *** HIGH ***
    ESR:               28 mm/hr          (Normal: 0-20) *** HIGH ***

    KIDNEY FUNCTION TEST (KFT):
    Creatinine:        1.4 mg/dL         (Normal: 0.6-1.2) *** HIGH ***

    LIPID PROFILE:
    Total Cholesterol: 224 mg/dL         (Normal: <200) *** HIGH ***
    LDL Cholesterol:   148 mg/dL         (Normal: <100) *** HIGH ***
    HDL Cholesterol:   38 mg/dL          (Normal: >40) *** LOW ***

    PULMONARY FUNCTION:
    FEV1/FVC Ratio:    0.65              (Normal: >0.70) *** LOW ***
    SpO2:              96%               (Normal: 95-100%)

    INFLAMMATION MARKERS:
    CRP (C-Reactive Protein): 8.2 mg/L  (Normal: <5) *** HIGH ***
    """


# ─── STEP 2: PARSE BLOOD MARKERS FROM TEXT ────────────────────────────────────
def parse_blood_markers(report_text):
    """Extract numerical values from blood report text using regex."""
    extracted = {}
    patterns = {
        "hemoglobin":          r"[Hh]emoglobin[:\s]+(\d+\.?\d*)",
        "wbc":                 r"WBC[:\s]+(\d+\.?\d*)",
        "eosinophils_percent": r"[Ee]osinophils[:\s]+(\d+\.?\d*)",
        "esr":                 r"ESR[:\s]+(\d+\.?\d*)",
        "creatinine":          r"[Cc]reatinine[:\s]+(\d+\.?\d*)",
        "cholesterol_total":   r"Total Cholesterol[:\s]+(\d+\.?\d*)",
        "ldl":                 r"LDL[:\s]+(\d+\.?\d*)",
        "fev1_fvc_ratio":      r"FEV1/FVC[:\s]+(\d+\.?\d*)",
        "spo2":                r"SpO2[:\s]+(\d+\.?\d*)",
        "crp":                 r"CRP[^:]*:[:\s]+(\d+\.?\d*)",
    }
    for marker, pattern in patterns.items():
        match = re.search(pattern, report_text)
        if match:
            extracted[marker] = float(match.group(1))
    return extracted


# ─── STEP 3: ANALYZE MARKERS AGAINST NORMAL RANGES ───────────────────────────
def analyze_markers(markers, city):
    """Compare blood markers to normal ranges and flag AQI-relevant risks."""
    aqi = CITY_AQI.get(city, 150)
    analysis = {"city": city, "aqi": aqi, "flags": [], "score": 0}

    for marker, value in markers.items():
        if marker not in NORMAL_RANGES:
            continue
        ref = NORMAL_RANGES[marker]
        status = "normal"
        risk_note = ""

        if value < ref["min"]:
            status = "LOW"
            risk_note = ref.get("low_risk", "")
            analysis["score"] += 15
        elif value > ref["max"]:
            status = "HIGH"
            risk_note = ref.get("high_risk", "")
            analysis["score"] += 15

        if status != "normal":
            analysis["flags"].append({
                "marker":    marker.replace("_", " ").title(),
                "value":     value,
                "unit":      ref["unit"],
                "status":    status,
                "normal":    f"{ref['min']}-{ref['max']}",
                "aqi_risk":  risk_note,
            })

    # AQI contribution to overall risk
    if aqi > 300:   analysis["score"] += 30
    elif aqi > 200: analysis["score"] += 20
    elif aqi > 100: analysis["score"] += 10

    analysis["score"] = min(analysis["score"], 100)
    return analysis


# ─── STEP 4: AI-POWERED ANALYSIS VIA CLAUDE API ──────────────────────────────
def get_ai_analysis(report_text, analysis, city):
    """Send blood report + AQI context to Claude API for expert analysis."""
    try:
        import urllib.request
        flags_summary = "\n".join([
            f"- {f['marker']}: {f['value']} {f['unit']} ({f['status']}) → AQI Risk: {f['aqi_risk']}"
            for f in analysis["flags"]
        ])

        prompt = f"""You are a senior physician and environmental health expert in India.

PATIENT BLOOD REPORT SUMMARY:
City: {city} | Current AQI: {analysis['aqi']} | Overall Risk Score: {analysis['score']}/100

ABNORMAL MARKERS DETECTED:
{flags_summary}

Based on this blood report and the city's AQI of {analysis['aqi']}, provide:

1. OVERALL HEALTH ASSESSMENT (2-3 sentences)
2. TOP 3 AQI-SPECIFIC RISKS for this patient
3. IMMEDIATE ACTIONS (4 bullet points, India-specific)
4. DIETARY RECOMMENDATIONS (3 points)
5. WHEN TO SEE A DOCTOR (specific threshold)

Be specific, actionable, and India-context aware. Use simple language."""

        payload = json.dumps({
            "model": "claude-sonnet-4-20250514",
            "max_tokens": 1500,
            "messages": [{"role": "user", "content": prompt}]
        }).encode("utf-8")

        req = urllib.request.Request(
            ANTHROPIC_API_URL,
            data=payload,
            headers={
                "Content-Type": "application/json",
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01"
            }
        )
        with urllib.request.urlopen(req, timeout=30) as response:
            result = json.loads(response.read().decode("utf-8"))
            return result["content"][0]["text"]
    except Exception as e:
        return f"""[API not configured — Sample AI Analysis]

1. OVERALL HEALTH ASSESSMENT:
   Patient shows elevated inflammatory markers (CRP: 8.2, ESR: 28) combined with
   compromised lung function (FEV1/FVC: 0.65) in Delhi's hazardous AQI of 312.
   High LDL and cholesterol significantly increase cardiovascular risk from PM2.5 exposure.

2. TOP 3 AQI-SPECIFIC RISKS:
   → Eosinophilia (6.2%) + Delhi AQI 312 = HIGH asthma attack risk
   → LDL 148 + PM2.5 exposure = 2.3x increased heart attack probability
   → FEV1/FVC 0.65 + continuous pollution = COPD progression risk

3. IMMEDIATE ACTIONS:
   • Wear N95 mask every time you step outside — non-negotiable at AQI 312
   • Install HEPA air purifier in bedroom — run 24/7 while sleeping
   • Take prescribed bronchodilator before any outdoor activity
   • Avoid morning walks — Delhi AQI peaks 6-9 AM due to temperature inversion

4. DIETARY RECOMMENDATIONS:
   • Add turmeric + black pepper daily — reduces CRP inflammation naturally
   • Increase Omega-3 (flaxseed, walnuts) — counters PM2.5-induced LDL oxidation
   • Vitamin C & E supplements — antioxidants protect lungs from pollution damage

5. SEE A DOCTOR IF:
   SpO2 drops below 94%, breathing difficulty during rest, or chest pain.
   Schedule pulmonologist appointment within 2 weeks given FEV1/FVC of 0.65.
"""


# ─── STEP 5: GENERATE REPORT ──────────────────────────────────────────────────
def generate_report(patient_city="Delhi"):
    print("=" * 60)
    print("   AirSense India — Blood Report + AQI Health Analyzer")
    print("=" * 60)

    print("\n📋 Loading blood report...")
    report_text = get_sample_blood_report()
    print("   ✅ Report loaded")

    print("\n🔬 Parsing blood markers...")
    markers = parse_blood_markers(report_text)
    print(f"   ✅ Extracted {len(markers)} markers: {', '.join(markers.keys())}")

    print(f"\n⚠️  Analyzing against normal ranges for {patient_city} (AQI: {CITY_AQI.get(patient_city, 150)})...")
    analysis = analyze_markers(markers, patient_city)
    print(f"   ✅ Analysis complete — {len(analysis['flags'])} abnormal markers found")
    print(f"   Overall Risk Score: {analysis['score']}/100")

    print("\n" + "─" * 60)
    print("   ABNORMAL MARKERS DETECTED:")
    print("─" * 60)
    for flag in analysis["flags"]:
        print(f"   ⚠️  {flag['marker']:25s} {flag['value']:6} {flag['unit']:10s} [{flag['status']}]")
        if flag["aqi_risk"]:
            print(f"       └─ AQI Risk: {flag['aqi_risk']}")

    print("\n" + "─" * 60)
    print("   AI HEALTH ANALYSIS (Claude API):")
    print("─" * 60)
    ai_response = get_ai_analysis(report_text, analysis, patient_city)
    print(ai_response)

    # Save JSON report
    output = {
        "patient_city": patient_city,
        "city_aqi": CITY_AQI.get(patient_city, 150),
        "risk_score": analysis["score"],
        "abnormal_markers": analysis["flags"],
        "ai_analysis": ai_response,
        "generated_by": "AirSense India — Blood Report Analyzer"
    }
    with open("blood_report_analysis.json", "w") as f:
        json.dump(output, f, indent=2)
    print("\n   ✅ Full report saved: blood_report_analysis.json")
    print("\n" + "=" * 60)
    print("   ✅ Blood Report Analysis Complete!")
    print("=" * 60)

    return output


# ─── RUN ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\nChoose your city:")
    for i, city in enumerate(CITY_AQI.keys(), 1):
        print(f"  {i:2}. {city} (AQI: {CITY_AQI[city]})")

    try:
        choice = int(input("\nEnter city number (or press Enter for Delhi): ") or "1")
        city = list(CITY_AQI.keys())[choice - 1]
    except:
        city = "Delhi"

    generate_report(city)