import React, { Component } from "react";
import ReactApexChart from "react-apexcharts";
export default class ApexChartDraw extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [
        {
          data: props.data
            ? props.data.map((item) => {
                const year = item.x.substring(0, 4);
                const month = item.x.substring(4, 6);
                const day = item.x.substring(6, 8);

                return {
                  x: new Date(year, month - 1, day), // 월은 0부터 시작하므로 1을 빼줍니다.
                  y: item.y.map((value) => Number(value)),
                };
              })
            : [],
        },
      ],
      options: {
        chart: {
          type: "candlestick",
          height: 500,
        },
        title: {
          text: "30주봉  Chart",
          align: "left",
        },
        xaxis: {
          type: "datetime",
        },
        yaxis: {
          tooltip: {
            enabled: true,
          },
        },
      },
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.data !== prevProps.data) {
      this.setState({
        series: [
          {
            data: this.props.data.map((item) => {
              const year = item.x.substring(0, 4);
              const month = item.x.substring(4, 6);
              const day = item.x.substring(6, 8);

              return {
                x: new Date(year, month - 1, day), // 월은 0부터 시작하므로 1을 빼줍니다.
                y: item.y.map((value) => Number(value)),
              };
            }),
          },
        ],
      });
    }
  }

  render() {
    return (
      <div id="chart">
        <ReactApexChart
          options={this.state.options}
          series={this.state.series}
          type="candlestick"
          height={550}
        />
      </div>
    );
  }
}
