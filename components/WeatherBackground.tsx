
import React from 'react';

interface WeatherBackgroundProps {
  condition: string;
}

const WeatherBackground: React.FC<WeatherBackgroundProps> = () => {
  // 彻底关闭全景特效渲染，直接返回 null
  return null;
};

export default WeatherBackground;
