import axios from 'axios';

// URL del backend
const API_URL = 'http://localhost:8000';

// Inicia la descarga
export const startDownload = async (payload) => {
  try {
    const res = await axios.post(`${API_URL}/download`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error en startDownload:', error.response?.data || error.message);
    throw error;
  }
};

// Obtiene el estado de la descarga
export const getDownloadStatus = async (downloadId) => {
  try {
    const res = await axios.get(`${API_URL}/download/${downloadId}`, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error en getDownloadStatus:', error.response?.data || error.message);
    throw error;
  }
};

// Descarga el archivo
export const getFile = async (downloadId) => {
  try {
    const res = await axios.get(`${API_URL}/download/${downloadId}/file`, {
      responseType: 'blob',
      headers: {
        'Cache-Control': 'no-store',
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error en getFile:', error.response?.data || error.message);
    throw error;
  }
};
