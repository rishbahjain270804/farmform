const API_BASE_URL = 'http://localhost:5000/api';

export const farmerService = {
  async registerFarmer(farmerData) {
    try {
      const response = await fetch(`${API_BASE_URL}/farmers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(farmerData),
      });

      if (!response.ok) {
        const text = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch {
          throw new Error('Server error: Invalid response format');
        }
        throw new Error(errorData.message || 'Failed to register farmer');
      }

      return await response.json();
    } catch (error) {
      console.error('Error registering farmer:', error);
      throw error;
    }
  },

  async getFarmers() {
    try {
      const response = await fetch(`${API_BASE_URL}/farmers`);
      
      if (!response.ok) {
        const text = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch {
          throw new Error('Server error: Invalid response format');
        }
        throw new Error(errorData.message || 'Failed to fetch farmers');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching farmers:', error);
      throw error;
    }
  }
};