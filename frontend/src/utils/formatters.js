export const formatDuration = (seconds) => {
  if (!seconds) return '0h 0m';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  return `${hours}h ${minutes}m`;
};

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};