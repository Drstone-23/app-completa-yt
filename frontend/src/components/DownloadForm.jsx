import React, { useState } from 'react';
import { startDownload, getDownloadStatus, getFile } from '../services/api';
import { FaYoutube, FaDownload, FaClock, FaMusic } from 'react-icons/fa';

// ---------- EJEMPLO DE VALIDACIONES BÁSICAS FRONTEND ----------
const ALLOWED_DOMAINS = ['youtube.com', 'youtu.be'];
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    // Verifica que la URL contenga un dominio permitido
    return ALLOWED_DOMAINS.some(domain => parsed.hostname.includes(domain));
  } catch {
    return false;
  }
}

// Formato HH:MM:SS (HH puede tener varios dígitos, MM y SS de 0 a 59)
function isValidTimeFormat(str) {
  return /^[0-9]+:[0-5]\d:[0-5]\d$/.test(str);
}
// ---------------------------------------------------------------

// Estilos
const inputStyle = {
  width: '100%',
  padding: '12px',
  margin: '8px 0',
  border: '1px solid #3f3f3f',
  borderRadius: '4px',
  backgroundColor: '#1f1f1f',
  color: '#ffffff',
  transition: 'border-color 0.3s',
};

const buttonStyle = {
  width: '100%',
  padding: '12px',
  margin: '16px 0',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: '#ff0000',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'background-color 0.3s',
};

const progressBarStyle = {
  width: '100%',
  height: '8px',
  backgroundColor: '#3f3f3f',
  borderRadius: '4px',
  overflow: 'hidden',
  position: 'relative',
  marginTop: '8px',
};

function DownloadForm() {
  const [url, setUrl] = useState('');
  const [start, setStart] = useState('0:00:00');
  const [endOrLength, setEndOrLength] = useState('');
  const [type, setType] = useState('video_start_end');
  const [statusMsg, setStatusMsg] = useState('');
  const [progress, setProgress] = useState(0);

  // Función principal para iniciar la descarga
  const handleDownload = async (e) => {
    e.preventDefault();

    // ---------- VALIDACIONES FRONTEND ----------
    if (!isValidUrl(url)) {
      setStatusMsg('URL inválida o dominio no permitido. (Solo YouTube)');
      return;
    }
    if (start && !isValidTimeFormat(start)) {
      setStatusMsg('Formato de tiempo de inicio inválido. Use HH:MM:SS');
      return;
    }
    if (endOrLength && !isValidTimeFormat(endOrLength)) {
      setStatusMsg('Formato de tiempo de fin/duración inválido. Use HH:MM:SS');
      return;
    }
    // --------------------------------------------

    try {
      setStatusMsg('Iniciando descarga...');
      setProgress(0);

      // Llama al backend para iniciar la descarga
      const { id } = await startDownload({
        url,
        start,
        end_or_length: endOrLength,
        type,
      });

      // Chequea el estado cada 2 segundos
      const intervalId = setInterval(async () => {
        try {
          const statusData = await getDownloadStatus(id);

          if (statusData.status === 'completed') {
            setStatusMsg('Descarga completada, preparando archivo...');
            setProgress(100);
            clearInterval(intervalId);

            // Pide el archivo final
            const fileBlob = await getFile(id);
            const fileUrl = URL.createObjectURL(fileBlob);
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = statusData.filepath.split('/').pop();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

          } else if (statusData.status === 'error') {
            setStatusMsg('Error en la descarga.');
            clearInterval(intervalId);
          } else {
            // Actualiza la barra de progreso
            setStatusMsg(
              `Estado: ${statusData.status} | Progreso: ${statusData.progress}`
            );
            setProgress(parseInt(statusData.progress) || 0);
          }
        } catch (err) {
          setStatusMsg('Error al obtener el estado.');
          clearInterval(intervalId);
        }
      }, 2000);

    } catch (err) {
      setStatusMsg(
        `Error al iniciar descarga: ${err.response?.data?.detail || err.message}`
      );
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Aquí puedes ubicar un primer bloque de publicidad */}
      <div
        style={{ marginBottom: '20px' }}
        dangerouslySetInnerHTML={{
          __html: `
          <!-- Ejemplo Bloque Publicidad: Google Ads -->
          <script async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXX"
            crossorigin="anonymous">
          </script>
          <ins class="adsbygoogle"
               style="display:block"
               data-ad-client="ca-pub-XXXXXXXXXXXXX"
               data-ad-slot="YYYYYYYYYY"
               data-ad-format="auto"
               data-full-width-responsive="true">
          </ins>
          <script>
            (adsbygoogle = window.adsbygoogle || []).push({});
          </script>
          <!-- Fin Bloque Publicidad -->
        `,
        }}
      />

      <form onSubmit={handleDownload} style={{ backgroundColor: '#121212', padding: '20px', borderRadius: '8px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              color: '#ffffff',
              marginBottom: '4px',
            }}
          >
            <FaYoutube style={{ marginRight: '8px' }} /> URL:
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            style={inputStyle}
            placeholder="https://www.youtube.com/watch?v=..."
            onFocus={(e) => (e.target.style.borderColor = '#ff0000')}
            onBlur={(e) => (e.target.style.borderColor = '#3f3f3f')}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              color: '#ffffff',
              marginBottom: '4px',
            }}
          >
            <FaClock style={{ marginRight: '8px' }} /> Tiempo inicio (HH:MM:SS):
          </label>
          <input
            type="text"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = '#ff0000')}
            onBlur={(e) => (e.target.style.borderColor = '#3f3f3f')}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              color: '#ffffff',
              marginBottom: '4px',
            }}
          >
            <FaClock style={{ marginRight: '8px' }} /> Fin o duración (HH:MM:SS):
          </label>
          <input
            type="text"
            value={endOrLength}
            onChange={(e) => setEndOrLength(e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = '#ff0000')}
            onBlur={(e) => (e.target.style.borderColor = '#3f3f3f')}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              color: '#ffffff',
              marginBottom: '4px',
            }}
          >
            <FaMusic style={{ marginRight: '8px' }} /> Tipo:
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = '#ff0000')}
            onBlur={(e) => (e.target.style.borderColor = '#3f3f3f')}
          >
            <option value="video_start_end">Video </option>
            <option value="audio_start_end">Audio </option>

          </select>
        </div>

        <button
          type="submit"
          style={buttonStyle}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#cc0000')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#ff0000')}
        >
          <FaDownload style={{ marginRight: '8px' }} /> Iniciar Descarga
        </button>

        {statusMsg && (
          <div style={{ marginTop: '16px', color: '#ffffff' }}>
            <strong>{statusMsg}</strong>
            <div style={progressBarStyle}>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: `${progress}%`,
                  height: '100%',
                  backgroundColor: '#ff0000',
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </div>
        )}
      </form>

      {/* Segundo bloque de publicidad, por ejemplo PopAds */}
      <div
        style={{ marginTop: '20px' }}
        dangerouslySetInnerHTML={{
          __html: `
          <!-- Ejemplo Bloque Publicidad: PopAds -->
          <script type="text/javascript">
            // PopAds script (puedes agregar tu ID de anunciante)
            // EJEMPLO: Este snippet es hipotético
            // NO real
          </script>
          <!-- Fin Bloque Publicidad -->
        `,
        }}
      />
    </div>
  );
}

export default DownloadForm;
