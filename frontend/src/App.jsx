import { useEffect, useState } from 'react'

function App() {
  const [weather, setWeather] = useState([])

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/weatherforecast`)  // Backend port
      .then(response => response.json())
      .then(data => setWeather(data))
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Backend Data in React:</h1>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {weather.map((item, index) => (
          <li key={index}>{item.date}: {item.summary} ({item.temperatureC}°C)</li>
        ))}
      </ul>
    </div>
  )
}

export default App
