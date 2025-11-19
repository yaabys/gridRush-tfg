# 🏁 GridRush - Sistema de Gestión de Karting

<div align="center">

![GridRush Logo](https://img.shields.io/badge/GridRush-Karting%20Management-red?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJ3aGl0ZSIgZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJ6Ii8+PC9zdmc+)

**Plataforma completa para la gestión de torneos de karting con sistema de ranking ELO**

[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-5.1.0-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite)](https://sqlite.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.6.0-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)

</div>

---

## 🚀 **Características Principales**

<table>
<tr>
<td width="50%">

### 🏆 **Gestión de Torneos**
- Creación y gestión de torneos oficiales
- Sistema de inscripciones automático
- Calendarios de carreras integrados
- Múltiples kartings por torneo

### 🏎️ **Carreras Libres**
- Organización de carreras independientes
- Inscripciones flexibles
- Verificación por fotografía

</td>
<td width="50%">

### 📊 **Sistema de Ranking**
- **Rating ELO** para clasificación de pilotos
- Estadísticas detalladas por usuario
- Sistema de temporadas
- Rankings globales y por torneos

### 🎯 **Sistema de Recompensas**
- Medallas y trofeos digitales
- Logros por rendimiento
- Recompensas por temporada

</td>
</tr>
</table>

---

## 🏗️ **Arquitectura del Proyecto**

```
gridRush-tfg/
├── 🎨 app/                     # Frontend React + Vite
│   ├── src/
│   │   ├── components/         # Componentes reutilizables
│   │   ├── pages/              # Páginas de la aplicación
│   │   └── assets/             # Recursos (fonts F1, imágenes)
│   └── public/                 # Archivos estáticos
├── ⚡ service/                 # Backend API Express
│   ├── routes/                 # Endpoints organizados
│   ├── controllers/            # Lógica de negocio
│   ├── sql/                    # Base de datos SQLite
│   └── firebase/               # Integración Firebase
└── 📖 README.md               # Este archivo
```

---

## 🛠️ **Stack Tecnológico**

<div align="center">

| Frontend | Backend | Base de Datos | Servicios |
|----------|---------|---------------|-----------|
| ![React](https://img.shields.io/badge/-React-61DAFB?style=flat-square&logo=react&logoColor=white) | ![Express](https://img.shields.io/badge/-Express-000000?style=flat-square&logo=express&logoColor=white) | ![SQLite](https://img.shields.io/badge/-SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white) | ![Firebase](https://img.shields.io/badge/-Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black) |
| ![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat-square&logo=vite&logoColor=white) | ![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=node.js&logoColor=white) | ![LibSQL](https://img.shields.io/badge/-LibSQL-000000?style=flat-square) | ![Nodemailer](https://img.shields.io/badge/-Nodemailer-339933?style=flat-square) |
| React Router DOM | bcrypt | | Google APIs |

</div>

---

## ⚡ **Inicio Rápido**

### **Prerrequisitos**
```bash
node --version  # v18+ recomendado
npm --version   # v8+ recomendado
```

### **1️⃣ Clonar Repositorio**
```bash
git clone https://github.com/Laanga/GridRush.git
cd gridRush-tfg
```

### **2️⃣ Configurar Backend**
```bash
cd service
npm install
# Configurar archivo .env con variables de entorno
node --env-file=.env api.mjs
```

### **3️⃣ Configurar Frontend**
```bash
cd ../app
npm install
npm run dev
```

<div align="center">

**🎉 ¡Listo! La aplicación estará disponible en:**
**Frontend:** `http://localhost:5173`  
**API:** `http://localhost:3000`

</div>

---

## 🎯 **Funcionalidades Detalladas**

<details>
<summary><strong>🏁 Gestión de Carreras</strong></summary>

- **Carreras Libres**: Organización de eventos independientes
- **Torneos Oficiales**: Competiciones estructuradas con multiple carreras
- **Sistema de Inscripciones**: Gestión automática con límites de participantes
- **Niveles de Competición**: Filtrado por nivel ELO (min/max)

</details>

<details>
<summary><strong>👤 Gestión de Usuarios</strong></summary>

- **Registro y Autenticación**: Sistema seguro con bcrypt
- **Perfiles Personalizados**: Avatares, estadísticas, provincias
- **Sistema ELO**: Rating dinámico basado en rendimiento
- **Estadísticas**: Carreras ganadas, torneos, participaciones

</details>

<details>
<summary><strong>🏆 Sistema de Temporadas</strong></summary>

- **Temporadas Anuales**: Períodos de competición definidos
- **Rankings Globales**: Clasificaciones por puntos acumulados  
- **Recompensas**: Sistema de medallas y logros
- **Historial**: Seguimiento de rendimiento temporal

</details>

<details>
<summary><strong>🏎️ Kartings y Ubicaciones</strong></summary>

- **Base de Datos de Kartings**: Información de circuitos
- **Integración con Maps**: Enlaces directos a ubicaciones
- **Gestión Multi-ubicación**: Torneos en múltiples kartings

</details>

---

## 📊 **Base de Datos**

El sistema utiliza **SQLite** con un diseño relacional optimizado:

```sql
👤 Usuarios          🏆 Torneos         🏁 Carreras
📈 Sistema ELO       🎯 Recompensas     📅 Temporadas
🏎️ Kartings         📊 Resultados      🔄 Inscripciones
```

**Tablas Principales:**
- `Usuarios` - Perfiles y estadísticas
- `Torneos` / `Carreras` - Eventos y competiciones  
- `ResultadosCarreras` - Tiempos y posiciones
- `TemporadaUsuarios` - Rankings por temporada

---

## 🔥 **Características Avanzadas**

### **🎨 UI/UX Premium**
- **Tema Formula 1**: Fuentes oficiales F1
- **Modo Oscuro**: Interfaz adaptable
- **Animaciones**: Semáforo de inicio de carrera
- **Responsive Design**: Compatible móvil/desktop

### **📱 Funciones Modernas**
- **Drag & Drop**: Reordenamiento de elementos (@dnd-kit)
- **Upload de Imágenes**: Verificación por foto (Multer)
- **Notificaciones Email**: Sistema automático (Nodemailer)
- **Sesiones Seguras**: Express-session con timeouts

### **⚡ Rendimiento**
- **Vite**: Build ultrarrápido
- **Code Splitting**: Carga optimizada
- **API RESTful**: Endpoints organizados por funcionalidad

---

## 🚀 **Scripts Disponibles**

### **Frontend (app/)**
```bash
npm run dev      # 🔥 Servidor de desarrollo
npm run build    # 📦 Build para producción  
npm run preview  # 👀 Preview del build
npm run lint     # 🔍 Linter ESLint
```

### **Backend (service/)**
```bash
node api.mjs                    # 🚀 Servidor producción
node --env-file=.env api.mjs   # 🔧 Con variables de entorno
```
</div>
