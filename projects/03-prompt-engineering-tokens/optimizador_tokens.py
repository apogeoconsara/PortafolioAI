"""
Estima el ahorro de tokens al pasar de un prompt "antes" (abierto, sin
restricciones de formato ni longitud) a un prompt "después" (con rol,
formato de salida explícito y límites de longitud).

Nota de metodología: el ahorro real de un prompt optimizado no viene
principalmente del tamaño del prompt de entrada, sino de que un prompt sin
restricciones ("explica con detalle", "sé lo más completo posible") produce
respuestas largas y abiertas, mientras que un prompt con restricciones
explícitas (número de elementos, palabras por celda, formato de tabla) acota
la respuesta del modelo. Por eso esta estimación compara la LONGITUD ESPERADA
DE LA RESPUESTA en ambos casos, usando las propias restricciones del prompt
optimizado como base del cálculo, y un rango de referencia típico para
respuestas abiertas equivalentes.

Heurística de conversión palabras -> tokens: ~1.3 tokens por palabra en
español/inglés, un valor de referencia estándar para estimaciones rápidas.
"""

TOKENS_POR_PALABRA = 1.3
COSTO_POR_1K_TOKENS_USD = 0.002  # referencia genérica para el cálculo de ahorro

# palabras_respuesta_antes: estimado para una respuesta abierta equivalente,
# sin restricciones de longitud ni formato.
# palabras_respuesta_despues: calculado directamente de las restricciones
# explícitas del prompt optimizado (ver prompts_ingenieria.md).
CASOS = [
    {
        "nombre": "Generación de casos de prueba",
        "palabras_respuesta_antes": 480,
        "palabras_respuesta_despues": 6 * 5 * 10,  # 6 filas x 5 columnas x ~10 palabras/celda
    },
    {
        "nombre": "Resumen de reporte semanal",
        "palabras_respuesta_antes": 300,
        "palabras_respuesta_despues": 9 * 12,  # 9 viñetas x 12 palabras máx.
    },
    {
        "nombre": "Revisión de checklist de diseño",
        "palabras_respuesta_antes": 350,
        "palabras_respuesta_despues": 4 * (2 + 10),  # 4 criterios x (etiqueta + comentario máx. 10 palabras)
    },
]


def a_tokens(palabras):
    return round(palabras * TOKENS_POR_PALABRA)


def calcular_ahorro():
    filas = []
    for caso in CASOS:
        tokens_antes = a_tokens(caso["palabras_respuesta_antes"])
        tokens_despues = a_tokens(caso["palabras_respuesta_despues"])
        ahorro_pct = round((1 - tokens_despues / tokens_antes) * 100)
        ahorro_costo = (tokens_antes - tokens_despues) / 1000 * COSTO_POR_1K_TOKENS_USD
        filas.append(
            {
                "nombre": caso["nombre"],
                "tokens_antes": tokens_antes,
                "tokens_despues": tokens_despues,
                "ahorro_pct": ahorro_pct,
                "ahorro_costo_usd": round(ahorro_costo, 5),
            }
        )
    return filas


def imprimir_tabla(filas):
    print(f"{'Prompt':<38}{'Tokens antes':>14}{'Tokens después':>16}{'Ahorro':>10}")
    for f in filas:
        print(
            f"{f['nombre']:<38}{f['tokens_antes']:>14}{f['tokens_despues']:>16}"
            f"{str(f['ahorro_pct']) + '%':>10}"
        )


if __name__ == "__main__":
    imprimir_tabla(calcular_ahorro())
