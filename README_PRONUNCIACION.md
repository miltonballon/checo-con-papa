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
- **Umbral de 90%**: El examen solo se habilita cuando TODAS las frases de la práctica tengan una precisión de pronunciación ≥ 90%
- **Indicador Visual**: Mensaje que muestra el estado de los requisitos
- **Botón Deshabilitado**: El botón del examen se deshabilita hasta cumplir los requisitos

## Características Técnicas

### Algoritmo de Precisión
- Utiliza **Distancia de Levenshtein** para calcular la similitud entre el texto hablado y el objetivo
- Normaliza el resultado a un porcentaje (0-100%)
- Comparación insensible a mayúsculas/minúsculas

### Funcionalidades de Seguridad
- **Timeout Automático**: La grabación se detiene automáticamente después de 5 segundos
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
3. **Evaluar**: Revisa tu calificación y repite hasta obtener ≥90%
4. **Examen**: Una vez que todas las frases tengan ≥90%, el botón de examen se habilitará

## Estructura de Archivos Modificados

```
czech-learning-core.js
├── Nuevos métodos de pronunciación
├── Sistema de calificación con Levenshtein
├── Persistencia de datos de pronunciación
└── Validación de requisitos para examen

czech-learning-ui.js
├── Renderizado de botones de pronunciación
├── Manejo de eventos de grabación
├── Actualización de UI en tiempo real
└── Feedback visual de calificaciones

styles.css
├── Estilos para botones de pronunciación
├── Indicadores de calificación por colores
├── Estados de grabación (animaciones)
└── Mensajes de requisitos del examen
```

## Configuración Avanzada

### Parámetros de Reconocimiento
- **Idioma**: `cs-CZ` (Checo - República Checa)
- **Modo**: Reconocimiento de una sola frase
- **Sensibilidad**: Configurada para aprendizaje de idiomas

### Umbrales de Calificación
- **Excelente**: ≥90% (requerido para examen)
- **Bueno**: 70-89%
- **Necesita mejora**: <70%
