# 📄 ResuMe — Creador de Currículums y Cartas de Presentación Optimizado para ATS con IA

<p align="center">
  <a href="https://resume-teal-omega.vercel.app">
    <img src="https://img.shields.io/badge/Demostración_en_Vivo-Vercel-1B6B3A?style=for-the-badge&logo=vercel&logoColor=white" alt="Demostración en Vivo" />
  </a>
  <img src="https://img.shields.io/badge/Licencia-MIT-blue.style=for-the-badge" alt="Licencia MIT" />
  <img src="https://img.shields.io/badge/Idiomas-ES%20|%20EN%20|%20FR-6366F1?style=for-the-badge" alt="Multilingüe" />
  <img src="https://img.shields.io/badge/Compatible_ATS-Auditoría_Científica-10B981?style=for-the-badge" alt="Compatible ATS" />
</p>

<p align="center">
  <b>Idiomas disponibles:</b><br/>
  <a href="README.md">🇬🇧 English</a> | <a href="LISEZMOI.md">🇫🇷 Français</a> | <b>🇪🇸 Español (Actual)</b>
</p>

---

> **ResuMe** es una aplicación web de código abierto, moderna y **100% orientada a la privacidad ("Local-First")** diseñada para crear, auditar y adaptar currículums y cartas de presentación optimizados para ATS, basados en estudios científicos de reclutamiento (Estudio Eye-tracking Ladders 2018, directrices SHRM, investigación van Toorenburg 2015, métricas NACE).

---

## ✨ Características Principales

### 🎯 1. Motor de Auditoría Científica ATS y RRHH (Sistema de Sugerencias en Tiempo Real)
- **Regla del Escaneo Inicial de 7,4 Segundos (Ladders 2018)**: Estructura visual diseñada para captar la atención del reclutador en menos de 8 segundos.
- **Detección de Correos Electrónicos Informales (van Toorenburg 2015)**: Alerta automática si la dirección de correo carece de profesionalismo.
- **Verificación de Perfil de LinkedIn (+71% de llamadas)**: Control en tiempo real para asegurar la presencia de un enlace personalizado a LinkedIn.
- **Cuantificación de Logros (NACE +40% de entrevistas)**: Análisis en vivo que garantiza que al menos el 40% de los puntos clave contengan métricas cuantitativas (%, $, cifras).
- **Puntuación ATS Dinámica (0-100)** con consejos diarios de reclutamiento respaldados científicamente.

### 🤖 2. Integración Avanzada con Gemini IA (Adaptación y Negrita Selectiva)
- **AI Job Tailoring**: Analiza descripciones de empleo objetivo y alinea palabras clave del currículum sin saturación artificial.
- **Negrita Selectiva (1 a 3 términos por punto)**: Destaca habilidades clave y métricas evitando la sobrecarga visual.
- **Generador de Puntos con Método STAR**: Crea logros enfocados en resultados que comienzan con verbos de acción potentes.

### 📝 3. Editor WYSIWYG de Cartas de Presentación y Contador SHRM
- **Cumplimiento del Límite Científico SHRM (<300 palabras)**: Contador de palabras en tiempo real con distintivo dinámico (`🟢 Óptimo RRHH (<300)` vs `⚠️ >300 palabras (-83% de lectura)`).
- **Estructura Comprobada de RRHH (Usted / Yo / Nosotros)**: Generación estructurada en 3-4 párrafos impactantes.
- **Editor en Vivo en Formato A4** con vista previa de impresión fiel y exportación PDF instantánea.

### 🎨 4. Navegación Ergonómica y Accesible en Modo Dual
- **Desktop Grid Wrap**: 100% de las secciones del currículum visibles de un vistazo sin desplazamientos horizontales incómodos.
- **Selector Desplegable Móvil**: Selector ultra compacto (`1/7 — Información de Contacto ✓`) que maximiza el espacio en pantallas móviles.
- **Indicador de Secciones Ocultas (`👁️‍🗨️`)**: Visualización clara e inmediata de las secciones ocultas del CV final sin necesidad de hacer clic en ellas.
- **Accesibilidad por Teclado W3C ARIA (Roving Tabindex)**: Navegación fluida con las teclas de dirección (`←`, `→`, `↑`, `↓`, `Inicio`, `Fin`).

### 📄 5. Exportación Multiformato y Privacidad Local
- **Exportación Multiformato**: PDF de alta resolución (vectorial/listo para imprimir), Word (.docx), JSON (copia de seguridad/restauración) y Markdown.
- **Privacidad Local-First**: Todos tus datos permanecen estrictamente guardados en el `localStorage` de tu navegador. Ningún dato se envía a servidores externos.

---

## 🛠️ Tecnologías y Arquitectura

- **Frontend Core**: React 18, Vite, Javascript (ES6+)
- **Sistema de Diseño**: Vanilla CSS con variables CSS dinámicas (Modo Claro / Oscuro), tipografías de Google Fonts (Inter, Roboto, Outfit, Lora, Fraunces)
- **Motor PDF**: PDF.js y renderizador HTML Canvas
- **API Serverless Backend**: Vercel Serverless Functions (`/api/*.js`)
- **Proveedor IA**: Google Gemini 2.5 API (mediante SDK Google Gen AI)
- **Reglas de Auditoría Científica**: Definidas en `src/utils/scientificAuditor.js` y `api/_scientificPromptRules.js` basadas en `Conseils CV Basés sur Études.md`.

---

## 🚀 Guía de Inicio / Configuración Local

### Requisitos Previos
- Node.js (v18+)
- npm o yarn

### Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/fnnktkygl-code/resume.git
   cd resume
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar Variables de Entorno (Opcional para funciones de IA)**:
   Crea un archivo `.env.local` en la raíz del proyecto:
   ```env
   GEMINI_API_KEY=tu_clave_api_gemini
   ```

4. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   Accede a la aplicación en `http://localhost:5173`.

5. **Compilar para producción**:
   ```bash
   npm run build
   ```

---

## 📂 Estructura del Proyecto

```
resume/
├── api/                        # Serverless Functions (Vercel)
│   ├── _scientificPromptRules.js # Centralized HR prompt guidelines
│   ├── generateCoverLetter.js  # Cover letter generator API
│   ├── generateBulletPoints.js # Bullet point generator API
│   ├── boldify.js              # Selective bolding API
│   └── tailor.js               # Job description matching API
├── public/                     # Recursos estáticos y datos de prueba
├── src/
│   ├── components/             # Componentes React de UI
│   │   ├── steps/              # Formularios por sección del CV
│   │   ├── ui/                 # Modales y superposiciones
│   │   ├── Header.jsx          # Barra superior y selector de idioma
│   │   └── ResumePreview.jsx   # Renderizador A4 de vista previa
│   ├── data/                   # Datos de traducción i18n y consejos
│   ├── services/               # Cliente de IA Gemini
│   ├── utils/                  # Auditor científico, puntuación ATS y exportadores
│   ├── App.jsx                 # Controlador principal
│   └── index.css               # Hoja de estilos principal
├── Conseils CV Basés sur Études.md # Documento de investigación científica de RRHH
├── README.md                   # Documentación en Inglés (Predeterminada)
├── LISEZMOI.md                 # Documentación en Francés
└── LEAME.md                    # Documentación en Español
```

---

## 📚 Referencias Científicas

Los algoritmos de auditoría y las sugerencias IA de ResuMe se basan en investigaciones publicadas:
1. **Estudio Eye-Tracking Ladders (2018)**: Referencia de escaneo inicial del currículum de 7,4 segundos.
2. **SHRM (Society for Human Resource Management)**: Longitud ideal de la carta de presentación (<300 palabras para +83% de lectura completa).
3. **van Toorenburg et al. (2015)**: Impacto de direcciones de correo profesionales en la evaluación del candidato.
4. **NACE (National Association of Colleges and Employers)**: Tasa de respuesta para logros cuantificados.

---

## 📄 Licencia

Distribuido bajo la **Licencia MIT**. Consulta el archivo `LICENSE` para obtener más información.
