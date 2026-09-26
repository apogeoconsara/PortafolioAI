"""
Agente de soporte técnico con clasificación de intención, recuperación sobre
una base de conocimiento y escalamiento a humano cuando la confianza es baja.

Este mismo patrón (clasificar -> recuperar -> decidir si responder o escalar)
es el que se usa al integrar un LLM real como Mistral o Copilot: aquí se
implementa con reglas simples para que sea legible y ejecutable sin API keys.
"""

import json


UMBRAL_CONFIANZA = 0.15  # fracción mínima de palabras clave que deben coincidir


class AgenteSoporte:
    def __init__(self, ruta_kb):
        with open(ruta_kb, encoding="utf-8") as f:
            self.kb = json.load(f)

    def _score(self, texto, entrada_kb):
        texto = texto.lower()
        palabras_clave = entrada_kb["palabras_clave"]
        coincidencias = sum(1 for palabra in palabras_clave if palabra in texto)
        return coincidencias / len(palabras_clave)

    def clasificar(self, texto):
        mejor_entrada = None
        mejor_score = 0.0
        for entrada in self.kb:
            score = self._score(texto, entrada)
            if score > mejor_score:
                mejor_score = score
                mejor_entrada = entrada
        return mejor_entrada, mejor_score

    def responder(self, texto):
        entrada, score = self.clasificar(texto)
        if entrada and score >= UMBRAL_CONFIANZA:
            return {
                "estado": "respondido",
                "intencion": entrada["intencion"],
                "confianza": round(score, 2),
                "respuesta": entrada["respuesta"],
            }
        return {
            "estado": "escalado_a_humano",
            "intencion": entrada["intencion"] if entrada else "desconocida",
            "confianza": round(score, 2),
            "respuesta": (
                "No tengo suficiente confianza para responder esto directamente. "
                "Se creó un ticket para que un ingeniero del equipo lo revise."
            ),
        }


def demo():
    agente = AgenteSoporte("kb.json")
    preguntas_demo = [
        "¿Cómo configuro mi entorno local?",
        "Encontré un bug raro al guardar el reporte",
        "¿Cuál es el sentido de la vida?",
    ]
    for pregunta in preguntas_demo:
        resultado = agente.responder(pregunta)
        print(f"\nPregunta: {pregunta}")
        print(f"Estado: {resultado['estado']} (confianza={resultado['confianza']})")
        print(f"Respuesta: {resultado['respuesta']}")


if __name__ == "__main__":
    demo()
