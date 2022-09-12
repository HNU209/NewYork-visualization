import React, { useEffect, useState } from 'react';
import Trip from './Trip';
import '../css/main.css';
import Slider from '@mui/material/Slider';
import Splash from './Splash';

const axios = require('axios');

const getTripData = time => {
  const res = axios.get(`https://raw.githubusercontent.com/HNU209/NewYork-visualization/main/src/data/trip_data/newyork_trip_${time}.json`);
  const data = res.then(r => r.data);
  return data;
};

const getRestData = type => {
  const res = axios.get(`https://raw.githubusercontent.com/HNU209/NewYork-visualization/main/src/data/rest_data/newyork_${type}.json`);
  const result = res.then(r => r.data);
  return result
}

export default function Main() {
  const minTime = 0;
  const maxTime = 1400;

  const initLoadNum = 5;

  const [load, setLoad] = useState(false);
  const [time, setTime] = useState(minTime);
  const [trip, setTrip] = useState([]);
  const [ps, setPs] = useState([]);
  const [empty, setEmpty] = useState([]);

  const [timeLine, setTimeLine] = useState([]);

  const getTripTime = async time => {
    const trip = await getTripData(time);
    if (trip) {
      setTrip(prev => [...prev, ...trip]);
    };
  };

  useEffect(() => {
    async function getFetchData() {
      const resTrip = await Promise.all(
        [...Array(initLoadNum).keys()].map(idx => {
          setTimeLine(prev => [...prev, idx]);
          const res = getTripData(idx);
          return res;
        }
      ));
      const trip = resTrip.flat();
      const empty = await getRestData('empty_taxi');
      const ps = await getRestData('passenger');
      
      if (trip && empty && ps) {
        setTrip(prev => [...trip]);
        setPs(prev => [...ps]);
        setEmpty(prev => [...empty]);
        setLoad(true)
      }
    }
    
    getFetchData();
  }, [])

  useEffect(() => {
    const t = Math.floor(time+3);
    if (!(timeLine.includes(t))) {
      setTimeLine(prev => [...prev, t]);
      getTripTime(t);
    }
  }, [time])
  
  const SliderChange = value => {
    const time = value.target.value;
    setTrip([]);
    setTimeLine([]);
    setTime(time);
  };

  return (
    <div className="container">
      {
        load ? 
        <>
          <Trip trip={trip} empty={empty} ps={ps} minTime={minTime} maxTime={maxTime} time={time} setTime={setTime}></Trip>
          <Slider id="slider" value={time} min={minTime} max={maxTime} onChange={SliderChange} track="inverted"/>
        </>
        :
        <Splash></Splash>
      }
    </div>
  );
}