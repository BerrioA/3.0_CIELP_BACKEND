# Validacion MBI-ES en CIELP

## Fuentes revisadas

- MBI-ES (cuestionario en espanol, 22 items, escala 0-6, estructura de 3 subescalas).
- Aranguez Diaz & Vasquez Sempertegui (2021): evidencia psicometrica del MBI-ES en docentes (estructura trifactorial y confiabilidad adecuada).

## Estructura oficial implementada

- Cansancio emocional (CE): items 1, 2, 3, 6, 8, 13, 14, 16, 20. Rango total 0-54.
- Despersonalizacion (DP): items 5, 10, 11, 15, 22. Rango total 0-30.
- Realizacion personal (RP): items 4, 7, 9, 12, 17, 18, 19, 21. Rango total 0-48.

## Escala de respuesta

- 0: Nunca.
- 1: Pocas veces al ano o menos.
- 2: Una vez al mes o menos.
- 3: Unas pocas veces al mes.
- 4: Una vez a la semana.
- 5: Unas pocas veces a la semana.
- 6: Todos los dias.

## Rangos de referencia usados

- CE: bajo 0-18, medio 19-26, alto 27-54.
- DP: bajo 0-5, medio 6-9, alto 10-30.
- RP: bajo 0-33, medio 34-39, alto 40-48.

Nota clinica: en RP, puntajes bajos incrementan riesgo de Burnout.

## Regla de indicios de Burnout usada en el sistema

- CE con indicio: CE >= 27.
- DP con indicio: DP >= 10.
- RP con indicio: RP < 34.

## Perfil de riesgo aplicado

- 0 dimensiones con indicio: saludable.
- 1 dimension con indicio: riesgo moderado.
- 2 dimensiones con indicio: riesgo alto.
- 3 dimensiones con indicio: sindrome de Burnout severo.

## Validaciones tecnicas agregadas

- El catalogo de preguntas se valida contra la estructura oficial MBI-ES (9 CE, 5 DP, 8 RP).
- Se exige exactamente 22 respuestas por evaluacion.
- Cada respuesta debe ser un entero de 0 a 6.
- No se permiten preguntas duplicadas en un mismo envio.

## Campos de salida disponibles

Ademas del campo `diagnostico`, el backend expone `interpretacion` con:

- `risk_level`
- `affected_areas`
- `dimensions` (nivel y bandera de indicio por subescala)

Esto permite trazabilidad clinica y uso administrativo sin romper compatibilidad con el frontend actual.
