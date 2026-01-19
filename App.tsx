
import React, { useState, useEffect } from 'react';
import { CalendarEvent, TodoItem, PeriodRecord } from './types';
import Dashboard from './components/Dashboard';
import AssistantBubble from './components/AssistantBubble';
import HeaderWidgets from './components/HeaderWidgets';
import WeatherBackground from './components/WeatherBackground';
import { FocusModalContent } from './components/FocusTimerSystem';

const App: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [periods, setPeriods] = useState<PeriodRecord[]>([]);
  const [showHealth, setShowHealth] = useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('Australia');
  const [bgImage, setBgImage] = useState<string>('https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=2560');
  
  const [timerLeft, setTimerLeft] = useState(25 * 60);
  const [timerMax, setTimerMax] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [isTimerImmersed, setIsTimerImmersed] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [todayKey, setTodayKey] = useState<string>(new Date().toDateString());

  const [weather, setWeather] = useState<{temp: number, code: number, condition: string, location: string, windSpeed: number, windDirection: number}>({ 
    temp: 24, 
    code: 0, 
    condition: 'Clear',
    location: 'Detecting...',
    windSpeed: 0,
    windDirection: 0
  });

  useEffect(() => {
    let t: any;
    if (timerActive && timerLeft > 0) {
      t = setInterval(() => setTimerLeft(prev => prev - 1), 1000);
    } else if (timerLeft === 0) {
      setTimerActive(false);
      try { new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play(); } catch(e){}
    }
    return () => clearInterval(t);
  }, [timerActive, timerLeft]);

  const updateWeather = async (lat: number, lon: number, locationName: string) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      const code = data.current_weather.weathercode;
      const windSpeed = data.current_weather.windspeed;
      const windDir = data.current_weather.winddirection;
      
      let cond = 'Clear';
      if (code >= 95) cond = 'Storm'; 
      else if (code >= 71 && code <= 77) cond = 'Snow';
      else if (code >= 51 && code <= 67) cond = 'Rain';
      else if (code >= 1 && code <= 3) cond = 'Cloudy';
      
      setWeather({ 
        temp: Math.round(data.current_weather.temperature), 
        code, 
        condition: cond, 
        location: locationName,
        windSpeed: windSpeed,
        windDirection: windDir
      });
    } catch (e) { console.error(e); }
  };

  const fetchCurrentWeather = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => updateWeather(pos.coords.latitude, pos.coords.longitude, 'Nearby'),
      () => updateWeather(-33.8688, 151.2093, 'Sydney')
    );
  };

  useEffect(() => {
    const savedEvents = localStorage.getItem('aura_events');
    if (savedEvents) setEvents(JSON.parse(savedEvents));
    const savedTodos = localStorage.getItem('aura_todos');
    if (savedTodos) setTodos(JSON.parse(savedTodos));
    const savedPeriods = localStorage.getItem('aura_periods');
    if (savedPeriods) setPeriods(JSON.parse(savedPeriods));
    const savedHealthPref = localStorage.getItem('aura_show_health');
    if (savedHealthPref !== null) setShowHealth(JSON.parse(savedHealthPref));
    const savedCountry = localStorage.getItem('aura_selected_country');
    if (savedCountry) setSelectedCountry(savedCountry);
    const savedBg = localStorage.getItem('aura_bg');
    if (savedBg) setBgImage(savedBg);

    fetchCurrentWeather();
    const weatherInterval = setInterval(fetchCurrentWeather, 15 * 60 * 1000);
    return () => clearInterval(weatherInterval);
  }, []);

  useEffect(() => { localStorage.setItem('aura_events', JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem('aura_todos', JSON.stringify(todos)); }, [todos]);
  useEffect(() => { localStorage.setItem('aura_periods', JSON.stringify(periods)); }, [periods]);
  useEffect(() => { localStorage.setItem('aura_show_health', JSON.stringify(showHealth)); }, [showHealth]);
  useEffect(() => { localStorage.setItem('aura_selected_country', selectedCountry); }, [selectedCountry]);
  useEffect(() => { localStorage.setItem('aura_bg', bgImage); }, [bgImage]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black" key={todayKey}>
      <div 
        className="fixed inset-0 z-0 transition-transform duration-1000 ease-in-out"
        style={{ 
          backgroundImage: `url('${bgImage}')`, 
          backgroundPosition: 'center', 
          backgroundSize: 'cover' 
        }}
      >
        <div 
          className="absolute inset-0 transition-all duration-1000 ease-in-out backdrop-blur-[1px]" 
          style={{ 
            backgroundColor: weather.condition === 'Clear' ? 'rgba(0, 0, 0, 0.10)' : 
                             weather.condition === 'Storm' ? 'rgba(0, 0, 0, 0.75)' : 
                             'rgba(0, 0, 0, 0.45)' 
          }}
        ></div>
      </div>

      <WeatherBackground 
        condition={weather.condition} 
        windSpeed={weather.windSpeed} 
        windDirection={weather.windDirection} 
      />

      <div className={`dashboard-container relative z-10 border-none bg-transparent transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${isTimerImmersed ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'}`}>
        <HeaderWidgets 
          showHealth={showHealth} setShowHealth={setShowHealth} setBgImage={setBgImage}
          weatherData={weather} onSetLocation={updateWeather}
          onSetWeatherCondition={(cond) => setWeather(prev => ({ ...prev, condition: cond }))}
          timerState={{ timerLeft, timerMax, timerActive, setTimerActive, setTimerLeft, setTimerMax, setIsTimerImmersed }}
        />
        <main className="min-h-0 flex-1">
          <Dashboard 
            events={events} setEvents={setEvents} 
            todos={todos} setTodos={setTodos} 
            periods={periods} setPeriods={setPeriods} 
            showHealth={showHealth}
            selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry}
            selectedDate={selectedDate} setSelectedDate={setSelectedDate}
          />
        </main>
        <AssistantBubble 
          events={events} 
          onAddEvent={(e) => setEvents([...events, e])} 
          onSetCountry={setSelectedCountry} 
        />
      </div>

      {isTimerImmersed && (
        <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center animate-in fade-in duration-1000">
           <button 
             onClick={() => setIsTimerImmersed(false)}
             className="absolute top-10 right-10 text-white/40 hover:text-white transition-all text-sm font-black tracking-[0.4em] flex items-center gap-2 group p-4"
           >
             <i className="fa-solid fa-xmark text-xs"></i>
             EXIT
           </button>

           <div className="scale-110 md:scale-[1.35] transform-gpu">
             <FocusModalContent 
               timerLeft={timerLeft} timerMax={timerMax} timerActive={timerActive}
               setTimerActive={setTimerActive} setTimerLeft={setTimerLeft} setTimerMax={setTimerMax}
               isImmersive={true}
             />
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
