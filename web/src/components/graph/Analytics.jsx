import React, {useEffect, useState} from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  ArcElement,
  Chart as ChartJS,
  Legend as ChartjsLegend,
  Tooltip,
  TooltipItem,
  TooltipModel,
} from 'chart.js';

import {
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  ChartjsLegend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


const SnapshotAnalytics = (props) => {

  
  const data = {
  labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
  datasets: [
    {
      label: '# of Votes',
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
      ],
      borderWidth: 1,
      },
    ],
  };

  const labels = [
    'January',
    'February',
    'March',
    'April',
    'May',
  ];

  const data2 = {
    labels: labels,
    datasets: [{
      label: 'My First dataset',
      backgroundColor: 'rgb(255, 99, 132)',
      borderColor: 'rgb(255, 99, 132)',
      data: [0, 10, 5, 2, 20],
    }]
  };

  const options = {
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Chart.js Bar Chart',
      },
    },
    maintainAspectRatio: false
  };  

  return (
    
    <div>

      <div style={{position: "fixed", left: "52.5%", top: "50%", width: "30%", height:"30%"}}>
      <Doughnut data={data} width={"30%"} options={options} />
      </div>

      <div style={{position: "fixed", left: "52.5%", top: "17.5%", width: "30%", height:"30%"}}>
      <Bar
        data={data2}
        width={"30%"} options={options}
      />
      </div>

    </div>
  );
}

export default SnapshotAnalytics;