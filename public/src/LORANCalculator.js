export class LORANCalculator {
    constructor(apiUrl) {
      this.apiUrl = apiUrl;
    }
  
    async calculateLoranData(points) {
      try {
        const response = await fetch(this.apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(points),
        });
  
        if (!response.ok) {
          throw new Error(`Server error: ${response.statusText}`);
        }
  
        const result = await response.json();
        return result;
      } catch (error) {
        console.error("Error:", error);
        throw error;
      }
    }
  }
  