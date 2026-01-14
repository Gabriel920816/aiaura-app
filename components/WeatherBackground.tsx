
import React, { useMemo } from 'react';

interface WeatherBackgroundProps {
  condition: string;
}

const WeatherBackground: React.FC<WeatherBackgroundProps> = ({ condition }) => {
  const effects = useMemo(() => {
    const els = [];
    
    // 标准化条件判断，防止大小写导致失效
    const cond = condition?.toLowerCase();

    if (cond === 'rain') {
      for (let i = 0; i < 80; i++) {
        els.push(
          <div 
            key={`rain-${i}`} 
            className="weather-rain-drop" 
            style={{ 
              left: `${Math.random() * 100}vw`, 
              animationDelay: `-${Math.random() * 2}s`,
              opacity: Math.random() * 0.5 + 0.3
            }} 
          />
        );
      }
    } else if (cond === 'snow') {
      for (let i = 0; i < 65; i++) {
        const size = Math.random() * 6 + 2;
        els.push(
          <div 
            key={`snow-${i}`} 
            className="weather-snow-flake" 
            style={{ 
              left: `${Math.random() * 100}vw`, 
              width: `${size}px`, 
              height: `${size}px`, 
              animationDelay: `-${Math.random() * 15}s`,
              animationDuration: `${Math.random() * 8 + 6}s`, // 设置随机下落时长
              opacity: Math.random() * 0.6 + 0.3
            }} 
          />
        );
      }
    } else if (cond === 'cloudy') {
      for (let i = 0; i < 12; i++) {
        els.push(
          <div 
            key={`cloud-${i}`} 
            className="weather-cloud-mist" 
            style={{ 
              top: `${Math.random() * 100}vh`, 
              width: `${Math.random() * 50 + 40}vw`, 
              height: `${Math.random() * 40 + 30}vw`, 
              animationDelay: `-${Math.random() * 60}s`, 
              left: `-${Math.random() * 50}vw` 
            }} 
          />
        );
      }
    } else if (cond === 'clear' || !cond) {
      els.push(<div key="sun-flare" className="sun-flare" />);
      els.push(<div key="tyndall-beams" className="weather-tyndall-beam" />);
      
      for (let i = 0; i < 35; i++) {
        els.push(
          <div 
            key={`dust-${i}`}
            className="sun-dust"
            style={{
              top: `${Math.random() * 100}vh`,
              left: `${Math.random() * 100}vw`,
              width: `${Math.random() * 2.5 + 1}px`,
              height: `${Math.random() * 2.5 + 1}px`,
              animationDelay: `-${Math.random() * 25}s`,
              animationDuration: `${Math.random() * 25 + 15}s`, 
              opacity: Math.random() * 0.6 + 0.2
            }}
          />
        );
      }
    }
    return els;
  }, [condition]);

  return <div className="fixed inset-0 pointer-events-none z-[6] overflow-hidden">{effects}</div>;
};

export default WeatherBackground;
