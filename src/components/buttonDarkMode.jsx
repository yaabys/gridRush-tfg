import { useEffect, useState } from 'react';
import './buttonDarkMode.css'; // estilos opcionales

const DarkModeToggle = () => {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const isDark = savedTheme === 'dark';
    setDarkMode(isDark);
    document.documentElement.classList.toggle('light', !isDark);
  }, []);

  const toggleTheme = () => {
    const newTheme = darkMode ? 'light' : 'dark';
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('light', newTheme === 'light');
    localStorage.setItem('theme', newTheme);
  };

  return (
    <button onClick={toggleTheme} className='theme-toggle-btn'>
      {darkMode ? '☀️ Claro' : '🌙 Oscuro'}
    </button>
  );
};

export default DarkModeToggle;
