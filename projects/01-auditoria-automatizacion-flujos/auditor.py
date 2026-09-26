"""
Auditor de automatización con IA.

Lee un inventario de tareas de un equipo de ingeniería y calcula:
- Horas/mes consumidas por tarea.
- Un score de "automatizable con IA" (0-3) según tres señales objetivas.
- Ahorro estimado si se automatiza (el % de ahorro depende del score, no es
  un promedio inventado: refleja cuánta intervención humana sigue siendo
  necesaria una vez introducida la IA).

Uso:
    python auditor.py tareas_ejemplo.csv
"""

import csv
import sys

# Ahorro esperado por nivel de score. Score 3 = totalmente automatizable con
# revisión ligera; score 0 = requiere rediseño del proceso antes de automatizar.
AHORRO_POR_SCORE = {0: 0.10, 1: 0.20, 2: 0.50, 3: 0.80}


def cargar_tareas(ruta_csv):
    with open(ruta_csv, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def calcular_hallazgos(tareas):
    hallazgos = []
    for t in tareas:
        horas_mes = float(t["horas_por_ocurrencia"]) * float(t["ocurrencias_por_mes"])
        score = (
            int(t["es_repetitiva"])
            + int(t["es_texto_o_datos"])
            + int(t["error_bajo_costo"])
        )
        ahorro_pct = AHORRO_POR_SCORE[score]
        ahorro_horas = horas_mes * ahorro_pct
        hallazgos.append(
            {
                "tarea": t["tarea"],
                "horas_mes": round(horas_mes, 1),
                "score_ia": score,
                "ahorro_horas_mes": round(ahorro_horas, 1),
                "ahorro_pct": int(ahorro_pct * 100),
            }
        )
    return sorted(hallazgos, key=lambda h: h["ahorro_horas_mes"], reverse=True)


def imprimir_resumen(hallazgos):
    print(f"{'Tarea':<45}{'Horas/mes':>10}{'Score IA':>10}{'Ahorro estimado/mes':>22}")
    for h in hallazgos:
        ahorro_txt = f"{h['ahorro_horas_mes']} h ({h['ahorro_pct']}%)"
        print(f"{h['tarea']:<45}{h['horas_mes']:>10}{h['score_ia']:>10}{ahorro_txt:>22}")


def escribir_csv(hallazgos, ruta_salida="hallazgos.csv"):
    with open(ruta_salida, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f, fieldnames=["tarea", "horas_mes", "score_ia", "ahorro_horas_mes", "ahorro_pct"]
        )
        writer.writeheader()
        writer.writerows(hallazgos)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python auditor.py <archivo_tareas.csv>")
        sys.exit(1)

    tareas = cargar_tareas(sys.argv[1])
    hallazgos = calcular_hallazgos(tareas)
    imprimir_resumen(hallazgos)
    escribir_csv(hallazgos)
    print("\nHallazgos guardados en hallazgos.csv (listo para Confluence/Jira).")
