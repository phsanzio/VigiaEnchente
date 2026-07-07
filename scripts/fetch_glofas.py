"""
Baixa dados de vazao simulada (river_discharge) da Open-Meteo Flood API (GloFAS)
para as coordenadas de Sabara/MG. Periodo: 1997-2025.

Uso:
    python3 src/fetch_glofas.py

Saida:
    data/external/glofas_vazao.csv
"""

import urllib3
import requests
import pandas as pd
from pathlib import Path

# Desabilitar aviso de SSL (API publica, somente leitura)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Coordenadas de Sabara/MG (centro da cidade, proximo ao Rio das Velhas)
LAT = -19.88
LON = -43.80

# Periodo com dados validos no GloFAS para essa coordenada
# (antes de 1997 retorna tudo NaN)
START_DATE = "1997-01-01"
END_DATE = "2025-12-31"

OUTPUT_PATH = Path(__file__).parent.parent / "data" / "external" / "glofas_vazao.csv"


def fetch_glofas():
    """Baixa vazao diaria do GloFAS via Open-Meteo Flood API."""

    url = "https://flood-api.open-meteo.com/v1/flood"
    params = {
        "latitude": LAT,
        "longitude": LON,
        "daily": "river_discharge",
        "start_date": START_DATE,
        "end_date": END_DATE,
    }

    print(f"Baixando dados GloFAS de {START_DATE} a {END_DATE}...")
    print(f"URL: {url}")
    print(f"Coordenadas: lat={LAT}, lon={LON}")

    response = requests.get(url, params=params, timeout=60, verify=False)
    response.raise_for_status()

    data = response.json()

    if "daily" not in data:
        raise ValueError(f"Resposta inesperada da API: {list(data.keys())}")

    daily = data["daily"]
    df = pd.DataFrame(
        {
            "data": pd.to_datetime(daily["time"]),
            "vazao_glofas_m3s": daily["river_discharge"],
        }
    )

    # Remover linhas com vazao nula
    nulos_antes = df["vazao_glofas_m3s"].isna().sum()
    df = df.dropna(subset=["vazao_glofas_m3s"]).reset_index(drop=True)

    # Garantir diretorio de saida existe
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    df.to_csv(OUTPUT_PATH, index=False)
    print(f"\nSalvo em: {OUTPUT_PATH}")
    print(f"Registros: {len(df)} (removidos {nulos_antes} nulos)")
    print(f"Periodo: {df['data'].min().date()} a {df['data'].max().date()}")
    print(f"Vazao media: {df['vazao_glofas_m3s'].mean():.2f} m3/s")
    print(f"Vazao maxima: {df['vazao_glofas_m3s'].max():.2f} m3/s")

    return df


if __name__ == "__main__":
    fetch_glofas()
