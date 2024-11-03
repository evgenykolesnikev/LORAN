export class LORANGraph {

  constructor(plotId) {
    this.started = false;
    this.trace_set = new Set();
    this.plotId = plotId;

    this.layout = {
      title: "LORAN",
      xaxis: {
        title: "X Axis",
        showgrid: true,
        zeroline: true,
        gridcolor: "#444444",
        zerolinecolor: "#888888",
        tickmode: "linear",
        tick0: 0,
        dtick: 20,
        range: [0, 100],
      },
      yaxis: {
        title: "Y Axis",
        showgrid: true,
        zeroline: true,
        gridcolor: "#444444",
        zerolinecolor: "#888888",
        tickmode: "linear",
        tick0: 0,
        dtick: 20,
        range: [0, 100],
      },
      width: 800,
      height: 600,
      font: {
        size: 10,
      },
      margin: {
        r: 360,
      },
    };
  }

  updateConfiguration(config) {
    let width = config.LORANService.emulationZoneSize.width;
    this.layout.xaxis.range = [0, width];
    this.layout.xaxis.dtick = width / 10;

    let height = config.LORANService.emulationZoneSize.height;
    this.layout.yaxis.range = [0, height];
    this.layout.yaxis.dtick = height / 10;
  }

  init(LORANStorage_) {
    this.storage = LORANStorage_;

    setInterval(() => {
      this.render();
      let traces = [...this.trace_set];
      Plotly.newPlot(this.plotId, traces, this.layout);
    }, 20);

    this.started = true;
  }

  render() {
    this.trace_set = new Set();

    const positionData = this.storage.getCurrentData();
    
    if (positionData.calculatedPoint) {
      const { x, y } = positionData.calculatedPoint;

      let pointColor = "red";
      if (positionData.pointStatus === "new") {
        pointColor = "green";
      }

      const currentTime = new Date().toLocaleTimeString(); 

      const objectTrace = {
          x: [x],
          y: [y],
          mode: "markers",
          type: "scatter",
          marker: { size: 10, color: pointColor, symbol: "cross" },
          opacity: 1,
          name: `Object (${positionData.pointStatus}) (${x.toFixed(3)}, ${y.toFixed(3)}) at ${currentTime}`,
      };


      this.trace_set.add(objectTrace);
    }

    positionData.stations.forEach((station, index) => {
      let stationColor = "red";
      let stationSymbol = "square";

      if (station.status === "received") {
        stationColor = "purple";
        stationSymbol = "circle";
      }

      const satTrace = {
        x: [station.coords.x],
        y: [station.coords.y],
        mode: "markers",
        type: "scatter",
        marker: { size: 8, color: stationColor, symbol: stationSymbol },
        opacity: 1,
        name: `Station ${index + 1} (${station.status === "received" ? "synchronized" : "not synchronized"}) (x: ${station.coords.x.toFixed(3)}, y: ${station.coords.y.toFixed(3)})`,
      };

      this.trace_set.add(satTrace);
    });
  }

  getDataForOutput() {
    const positionData = this.storage.getCurrentData();
    const dataOutput = [];

    if (positionData.calculatedPoint) {
      const { x, y } = positionData.calculatedPoint;
      const currentTime = new Date().toLocaleTimeString();
      dataOutput.push(`Об'єкт (${positionData.pointStatus}) (${x.toFixed(3)}, ${y.toFixed(3)}) at ${currentTime}`);
    }

    positionData.stations.forEach((station, index) => {
      dataOutput.push(`Станція ${index + 1} (${station.status === "received" ? "синхронізовано" : "не синхронізовано"}) (x: ${station.coords.x.toFixed(3)}, y: ${station.coords.y.toFixed(3)})`);
    });

    return dataOutput.join("\n");
  }

}
