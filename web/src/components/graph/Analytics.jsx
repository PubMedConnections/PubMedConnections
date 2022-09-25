import React, {useEffect, useState} from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Bar } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';

import {
  ArcElement,
  Chart as ChartJS,
  Legend as ChartjsLegend,
  Tooltip,
  TooltipItem,
  TooltipModel,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Legend,
  BarElement,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  ChartjsLegend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  PointElement,
  LineElement,
  Legend
);


const SnapshotAnalytics = (props) => {

  const betweennessTop5Names = [];
  const betweennessTop5Values = [];
  const degreeTop5Names = [];
  const degreeTop5Values = [];


  for (let i = props.data.betweenness.top_5.length-1; i >= 0; i--) {
    betweennessTop5Names.push(props.data.betweenness.top_5[i].name);
    betweennessTop5Values.push(props.data.betweenness.top_5[i].centrality);
    degreeTop5Names.push(props.data.degree.top_5[i].name);
    degreeTop5Values.push(props.data.degree.top_5[i].centrality);
  }



  const degreeData = {
    labels: degreeTop5Names,
    datasets: [
      {
        label: '# of Votes',
        data: degreeTop5Values,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const degreeOptions = {
    plugins: {
      legend: {
        display: true,
        position: 'left'
      },
      title: {
        display: true,
        text: 'Top 5 Degrees of Centrality',
      },
    },
    maintainAspectRatio: false
  };  




  const betweennessData = {
    labels: betweennessTop5Names,
    datasets: [{
      label: 'Betweenness',
      backgroundColor: 'rgb(255, 99, 132)',
      borderColor: 'rgb(255, 99, 132)',
      data: betweennessTop5Values,
    }]
  };

  const betweennessOptions = {
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Top 5 Betweenness of Nodes',
      },
    },
    maintainAspectRatio: false
  };  




  
  const distributionScore = [];
  const distributionCount = [];

  let count = 0;
  for (let i = 0; i < props.data.degree.distributions[props.data.degree.distributions.length - 1].score + 1; i++) {
    
    if (props.data.degree.distributions[count].score == i){
      distributionScore.push(i);
      distributionCount.push((props.data.degree.distributions[count].count));
      count++;
    }
    else{
      distributionScore.push(i);
      distributionCount.push(0);
    }
  }

  const distributionDegree = {
    labels: distributionScore,
    datasets: [
      {
        label: 'Count',
        data: distributionCount,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      }
    ],
  };


  const distributionOptions = {
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Distribution of Degrees Centrality',
      },
    },
    elements: {
      point:{
          radius: 0
      }
    },
    maintainAspectRatio: false
  };  


  return (

    <div>

      <div style={{position: "fixed", left: "52.5%", top: "52.5%", width: "30%", height:"30%"}}>
        <Doughnut data={degreeData} width={"30%"} options={degreeOptions} />
      </div>

      <div style={{position: "fixed", left: "52.5%", top: "17.5%", width: "30%", height:"30%"}}>
        <Bar data={betweennessData} width={"30%"} options={betweennessOptions} />
      </div>

      <div style={{position: "fixed", left: "17.5%", top: "52.5%", width: "30%", height:"30%"}}>
        <Line data={distributionDegree } width={"30%"} options={distributionOptions}/>
      </div>
      
      

    </div>
  );
}

export default SnapshotAnalytics;