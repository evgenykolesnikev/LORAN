export class LORANStorage {
  
  // Initializes LORAN storage with calculator and messages
  constructor(loranCalculator) {
    this.stations = new Map();
    this.calculatedPoint = null;
    this.messages = [];
    this.unprocessedMessages = [];
    this.loranCalculator = loranCalculator;

    setInterval(() => this.processMessages(), 20);
  }

  // Updates the configuration of base stations
  updateConfiguration(config) {
    if (config.emulationZoneSize) {
      this.emulationZoneSize = config.emulationZoneSize;
    }

    if (config.baseStations && Array.isArray(config.baseStations)) {
      this.stations.clear();

      config.baseStations.forEach(station => {
        const { id, x, y } = station;
        this.stations.set(id, { x, y });
      });
    }
  }

  // Adds station info to unprocessed messages
  addStationInfo(message) {
    this.unprocessedMessages.push(message);
  }

  // Processes the oldest unprocessed message
  async processMessages() {
    if (this.unprocessedMessages.length === 0) return;

    const oldestMessage = this.unprocessedMessages.reduce((oldest, current) => {
      return oldest.receivedAt < current.receivedAt ? oldest : current;
    });

    this.unprocessedMessages = this.unprocessedMessages.filter(msg => msg !== oldestMessage);

    let messageGroup = this.messages.find(m => m.id === oldestMessage.id);
    
    if (!messageGroup) {
      if (this.calculatedPoint) {
        this.calculatedPoint.status = 'old';
      }

      this.messages = [];

      messageGroup = {
        id: oldestMessage.id,
        stations: new Map(),
        status: 'pending',
      };
      this.messages.push(messageGroup);
    }

    messageGroup.stations.set(oldestMessage.sourceId, oldestMessage.receivedAt);

    if (messageGroup.stations.size === this.stations.size) {
      const points = Array.from(this.stations.entries()).map(([sourceId, coords]) => {
        const timestamp = messageGroup.stations.get(sourceId);
        return { x: coords.x, y: coords.y, timestamp };
      });

      const emulationZoneSize = this.emulationZoneSize;

      this.calculatedPoint = await this.loranCalculator.calculateLoranData({ points, emulationZoneSize });

      messageGroup.status = 'processed';

      if (this.calculatedPoint) {
        this.calculatedPoint.status = 'new';
      }
    }
  }

  // Retrieves the current data
  getCurrentData() {
    const stationStatus = Array.from(this.stations.entries()).map(([sourceId, coords]) => {
      const latestMessage = this.messages.find(msg => msg.stations.has(sourceId));
      const status = latestMessage ? 'received' : 'not received';
      return { sourceId, coords, status };
    });

    const pointStatus = this.calculatedPoint ? this.calculatedPoint.status : 'absent';

    return {
      stations: stationStatus,
      calculatedPoint: this.calculatedPoint,
      pointStatus,
    };
  }
}
