# Características de Pronunciación - Aprende Checo con Papá

## Nuevas Funcionalidades Implementadas

### 🎤 Sistema de Pronunciación
- **Botón "Pronunciar"**: Cada frase en la página de práctica ahora tiene un botón de pronunciación junto al botón "Escuchar"
- **Reconocimiento de Voz**: Utiliza la Web Speech Recognition API para evaluar la pronunciación
- **Calificación en Tiempo Real**: Muestra el porcentaje de precisión de la pronunciación

### 📊 Sistema de Calificación
- **Escala de Colores**:
  - 🔴 Rojo (0-69%): Necesita mejora
  - 🟡 Amarillo (70-89%): Buena pronunciación
  - 🟢 Verde (90-100%): Excelente pronunciación
- **Persistencia**: Las calificaciones se guardan automáticamente en localStorage

### 📋 Requisitos para el Examen
- **Umbral Configurable**: El examen solo se habilita cuando TODAS las frases de la práctica tengan una precisión de pronunciación ≥ al umbral configurado (por defecto 89%)
- **Indicador Visual**: Mensaje que muestra el estado de los requisitos
- **Botón Deshabilitado**: El botón del examen se deshabilita hasta cumplir los requisitos

## Configuración

### Archivo de Configuración (`config.json`)

La aplicación ahora utiliza un archivo de configuración JSON para personalizar los parámetros de pronunciación:

```json
{
  "pronunciation": {
    "thresholds": {
      "excellent": 89,
      "good": 70,
      "needsImprovement": 0
    },
    "examRequirement": 89,
    "timeout": 5000,
    "language": "cs-CZ"
  },
  "exam": {
    "passingPercentage": 90,
    "questionsPerSection": 10
  },
  "ui": {
    "autoAdvanceDelay": 1000,
    "notificationDuration": 4000
  }
}
```

### Parámetros Configurables

#### Pronunciación
- **`thresholds.excellent`**: Umbral para calificación "Excelente" (por defecto: 89%)
- **`thresholds.good`**: Umbral para calificación "Bueno" (por defecto: 70%)
- **`thresholds.needsImprovement`**: Umbral para calificación "Necesita mejora" (por defecto: 0%)
- **`examRequirement`**: Puntuación mínima requerida para habilitar el examen (por defecto: 89%)
- **`timeout`**: Tiempo máximo de grabación en milisegundos (por defecto: 5000ms)
- **`language`**: Idioma para reconocimiento de voz (por defecto: "cs-CZ")

#### Examen
- **`passingPercentage`**: Porcentaje mínimo para aprobar el examen (por defecto: 90%)
- **`questionsPerSection`**: Número de preguntas por sección (por defecto: 10)

#### Interfaz de Usuario
- **`autoAdvanceDelay`**: Tiempo de espera antes de avanzar automáticamente (por defecto: 1000ms)
- **`notificationDuration`**: Duración de las notificaciones (por defecto: 4000ms)

### Valores por Defecto

Si el archivo `config.json` no está disponible o no se puede cargar, la aplicación utilizará valores por defecto internos que mantienen la funcionalidad original.

## Características Técnicas

### Algoritmo de Precisión
- Utiliza **Distancia de Levenshtein** para calcular la similitud entre el texto hablado y el objetivo
- Normaliza el resultado a un porcentaje (0-100%)
- Comparación insensible a mayúsculas/minúsculas

### Funcionalidades de Seguridad
- **Timeout Configurable**: La grabación se detiene automáticamente después del tiempo configurado (por defecto 5 segundos)
- **Manejo de Errores**: Mensajes informativos si el navegador no soporta reconocimiento de voz
- **Prevención de Grabaciones Múltiples**: Solo una grabación activa a la vez

### Persistencia de Datos
- **localStorage Separado**: Los datos de pronunciación se guardan independientemente del progreso general
- **Limpieza Automática**: Los datos se limpian al reiniciar el progreso

## Compatibilidad del Navegador

### Navegadores Soportados
- ✅ Chrome/Chromium (recomendado)
- ✅ Edge
- ⚠️ Safari (soporte limitado)
- ❌ Firefox (no soporta Web Speech Recognition)

### Requisitos
- Conexión a internet (para el reconocimiento de voz)
- Permiso de micrófono
- Navegador con soporte para Web Speech Recognition API

## Uso

1. **Escuchar**: Haz clic en "🔊 Escuchar" para oír la pronunciación correcta
2. **Practicar**: Haz clic en "🎤 Pronunciar" y di la frase en checo
3. **Evaluar**: Revisa tu calificación y repite hasta obtener el puntaje requerido (configurable, por defecto ≥89%)
4. **Examen**: Una vez que todas las frases tengan el puntaje requerido, el botón de examen se habilitará

## Estructura de Archivos Modificados

```
czech-learning-core.js
├── Nuevos métodos de pronunciación
├── Sistema de calificación con Levenshtein
├── Persistencia de datos de pronunciación
├── Validación de requisitos para examen
└── Sistema de configuración con config.json

czech-learning-ui.js
├── Renderizado de botones de pronunciación
├── Manejo de eventos de grabación
├── Actualización de UI en tiempo real
├── Feedback visual de calificaciones
└── Integración con sistema de configuración

config.json
├── Configuración de umbrales de pronunciación
├── Parámetros de examen
├── Configuración de UI
└── Valores por defecto

styles.css
├── Estilos para botones de pronunciación
├── Indicadores de calificación por colores
├── Estados de grabación (animaciones)
└── Mensajes de requisitos del examen
```

## Configuración Avanzada

### Parámetros de Reconocimiento
- **Idioma**: Configurable vía `config.json` (por defecto: `cs-CZ` - Checo - República Checa)
- **Modo**: Reconocimiento de una sola frase
- **Sensibilidad**: Configurada para aprendizaje de idiomas

### Umbrales de Calificación
- **Excelente**: ≥89% (configurable - requerido para examen)
- **Bueno**: 70-88% (configurable)
- **Necesita mejora**: <70% (configurable)
