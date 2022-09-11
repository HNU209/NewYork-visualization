import React, { useEffect, useState } from 'react';
import Trip from './Trip';
import '../css/main.css';
import Slider from '@mui/material/Slider';
import Splash from './Splash';

const axios = require('axios');

const getTripData = idx => {
  const res = axios.get(`https://raw.githubusercontent.com/HNU209/NewYork-visualization/main/src/data/visual_data/newyork_trip_${idx}.json`);
  const data = res.then(r => r.data);
  return data;
};

const getRestData = type => {
  const res = axios.get(`https://raw.githubusercontent.com/HNU209/NewYork-visualization/main/src/data/visualization_data/newyork_${type}.json`);
  const result = res.then(r => r.data);
  return result
}

const filterData = (data, time) => {
  const arr = [];
  for (let i = 0; i < data.length; i++) {
    const value = data[i];
    const timestamp = value.timestamp;
    const start = timestamp[0];
    const end = timestamp[timestamp.length - 1];
    if (end >= time) {
      arr.push(value);
    }
  }
  return arr;
}

export default function Main() {
  const minTime = 0;
  const maxTime = 1400;

  const [load, setLoad] = useState(false);
  const [time, setTime] = useState(minTime);
  const [trip, setTrip] = useState([]);
  const [ps, setPs] = useState([]);
  const [empty, setEmpty] = useState([]);

  const [indexList, setIndexList] = useState([]);
  const timeLine = {
    0: 0,
    450: 1,
    800: 2,
    1000: 3
  }

  useEffect(() => {
    async function getFetchData() {
      const trip = await getTripData(0);
      const empty = await getRestData('empty_taxi');
      const ps = await getRestData('passenger');
      
      if (trip && empty && ps) {
        setTrip(trip);
        setIndexList(prev => [...prev, 0]);
        setPs(ps);
        setEmpty(empty);
        setLoad(true)
      }
    }

    getFetchData();
  }, [])

  useEffect(() => {
    const data = filterData(trip, time);
    setTrip(prev => [...data]);
    for (let i = 0; i < Object.keys(timeLine).length - 1; i++) {
      const c = Object.values(timeLine)[i];
      const s = Object.keys(timeLine)[i];
      const e = Object.keys(timeLine)[i+1];
      
      const getFetchData = async i => {
        const trip = await getTripData(i);
        if (trip) {
          setTrip(prev => [...prev, ...trip]);
          setIndexList(prev => [...prev, i]);
        }
      }

      if ((time >= s) && (time <= e)) {
        if (!(c in indexList)) {
          getFetchData(i);
        } else {
          break;
        }
      } else if (time >= 1000) {
        getFetchData(3);
        break;
      }
    }
  }, [time])

  const SliderChange = value => {
    const time = value.target.value;
    setTime(time);
    setIndexList([]);
  };

  return (
    <div className="container">
      {((trip.length !== 0) && (ps.length !== 0) && (empty.length !== 0)) ?
      <>
        <Trip trip={trip} empty={empty} ps={ps} minTime={minTime} maxTime={maxTime} time={time} setTime={setTime}></Trip>
        {/* <Slider id="slider" value={time} min={minTime} max={maxTime} onChange={SliderChange} track="inverted"/> */}
      </>
      :
      <Splash></Splash>
      }
    </div>
  );
}