# 🚀 Video & Audio Downloader

Bienvenido a **Video & Audio Downloader**, una aplicación web súper sencilla pero poderosa para descargar videos o solo audio en la **máxima calidad**. 🎥🎶

💻 **Construida con:**
- **React** para el frontend ⚛️
- **FastAPI** en el backend ⚡
- **Node.js** como proxy 🚀
- **Docker** para el despliegue fácil 🐳

---

## 🌟 Características
✅ Descarga **video + audio** o **solo audio** 🎵
✅ Siempre en **la mejor calidad disponible** 🔥
✅ Interfaz sencilla e intuitiva 🖥️
✅ Desplegable con **Docker** sin complicaciones 🐳

---

## 📦 Instalación y Ejecución

### 🔧 Requisitos previos
Antes de empezar, asegúrate de tener **Docker** instalado:

🔗 [Descargar Docker](https://www.docker.com/get-started)

### 📥 Clonar el repositorio

```bash
git clone https://github.com/Drstone-23/app-completa-yt.git
cd app-completa-yt
```

### 🚀 Construcción y ejecución con Docker

1️⃣ **Construir y levantar los contenedores:**
```bash
docker-compose up --build
```

Esto iniciará los siguientes servicios:
- 🖥 **FastAPI Backend** en `http://localhost:8000`
- 🔄 **Node.js Proxy** en `http://localhost:3000`
- 🎨 **React Frontend** en `http://localhost:3001`

2️⃣ **Acceder a la aplicación:**
   - Abre 👉 `http://localhost:3001`

---

## 🛠 Configuración adicional del backend

Antes de iniciar, instala las dependencias necesarias:
```bash
cd backend
pip install -r requirements.txt
```

---

## 🎯 Uso de la Aplicación

1️⃣ **Introduce la URL del video** 🎥
2️⃣ **Elige la opción de descarga:**
   - **🎵 Solo Audio**
   - **🎬 Video + Audio**
3️⃣ **Haz clic en Descargar** y espera un momento ⏳

---

## 🤝 Contribuciones

¡Nos encanta recibir mejoras y nuevas ideas! Si quieres contribuir:

1️⃣ **Haz un fork** del repo 🚀
2️⃣ Crea una rama nueva: `git checkout -b nueva-feature`
3️⃣ Realiza tus cambios y súbelos: `git push origin nueva-feature`
4️⃣ Abre un **Pull Request** 💡

---

## 📜 Licencia

📄 Este proyecto está bajo la licencia **MIT**, lo que significa que puedes usarlo, modificarlo y distribuirlo libremente.

¡Felices descargas! 🚀🎶

