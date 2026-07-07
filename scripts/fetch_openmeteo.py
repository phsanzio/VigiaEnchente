"""
Baixa dados meteorologicos historicos do Open-Meteo para Sabara/MG.
Periodo: 1997-2025.

Uso:
    python3 src/fetch_openmeteo.py

Saida:
    data/external/meteo_historico.csv
"""

import urllib3
import requests
import pandas as pd
from pathlib import Path

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

LAT = -19.88
LON = -43.80
START_DATE = "1997-01-01"
END_DATE = "2025-12-31"

OUTPUT_PATH = Path(__file__).parent.parent / "data" / "external" / "meteo_historico.csv"


def fetch_meteo():
    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": LAT,
        "longitude": LON,
        "start_date": START_DATE,
        "end_date": END_DATE,
        "daily": ",".join([
            "temperature_2m_max",
            "temperature_2m_min",
            "relative_humidity_2m_mean",
            "wind_speed_10m_max",
            "et0_fao_evapotranspiration",
            "surface_pressure_mean",
        ]),
        "timezone": "America/Sao_Paulo",
    }

    print(f"Baixando dados meteorologicos de {START_DATE} a {END_DATE}...")
    print(f"Coordenadas: lat={LAT}, lon={LON}")

    response = requests.get(url, params=params, timeout=120, verify=False)
    response.raise_for_status()
    data = response.json()

    if "daily" not in data:
        raise ValueError(f"Resposta inesperada: {list(data.keys())}")

    daily = data["daily"]
    df = pd.DataFrame({
        "data": pd.to_datetime(daily["time"]),
        "temp_max": daily["temperature_2m_max"],
        "temp_min": daily["temperature_2m_min"],
        "umidade_media": daily["relative_humidity_2m_mean"],
        "vento_max": daily["wind_speed_10m_max"],
        "evapotranspiracao": daily["et0_fao_evapotranspiration"],
        "pressao_media": daily["surface_pressure_mean"],
    })

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUTPUT_PATH, index=False)

    print(f"\nSalvo: {OUTPUT_PATH}")
    print(f"Registros: {len(df)}")
    print(f"Periodo: {df['data'].min().date()} a {df['data'].max().date()}")
    print(f"Nulos por coluna:")
    print(df.isna().sum().to_string())

    return df


if __name__ == "__main__":
    fetch_meteo()
