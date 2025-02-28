document.addEventListener('DOMContentLoaded', () => {
    const stateSelect = document.getElementById('state');
    const citySelect = document.getElementById('city');
  
    // 1. Fetch Indian States on page load
    fetchStates();
  
    // 2. When the user selects a State, fetch the corresponding Cities
    stateSelect.addEventListener('change', () => {
      // Reset the City dropdown to default
      citySelect.innerHTML = '<option value="" disabled selected>Select City</option>';
  
      const selectedStateCode = stateSelect.value;
      if (selectedStateCode) {
        fetchCities(selectedStateCode);
      }
    });
  
    // -------------------------
    // Helper Functions
    // -------------------------
  
    async function fetchStates() {
      try {
        const response = await fetch(
          'https://api.countrystatecity.in/v1/countries/IN/states',
          {
            headers: {
              'X-CSCAPI-KEY': 'RjJuc1ljT1RVYzYxUXUwT2p6dWFidmE0NTh4UFZlQjBEZUllbFc1bw=='
            }
          }
        );
        const states = await response.json();
  
        // Clear the state dropdown and add default option
        stateSelect.innerHTML = '<option value="" disabled selected>Select State</option>';
  
        states.forEach(state => {
          // Example: { "id": 11, "name": "Delhi", "iso2": "DL", ... }
          const option = document.createElement('option');
          // Use state.iso2 as the value (like "MH" for Maharashtra)
          option.value = state.iso2;
          option.textContent = state.name;
          stateSelect.appendChild(option);
        });
      } catch (error) {
        console.error('Error fetching states:', error);
      }
    }
  
    async function fetchCities(stateCode) {
      try {
        const response = await fetch(
          `https://api.countrystatecity.in/v1/countries/IN/states/${stateCode}/cities`,
          {
            headers: {
              'X-CSCAPI-KEY': 'RjJuc1ljT1RVYzYxUXUwT2p6dWFidmE0NTh4UFZlQjBEZUllbFc1bw=='
            }
          }
        );
        const cities = await response.json();
  
        // Clear the city dropdown and add default option
        citySelect.innerHTML = '<option value="" disabled selected>Select City</option>';
  
        cities.forEach(city => {
          // Example: { "id": 101482, "name": "Mumbai", "state_id": 1482, ... }
          const option = document.createElement('option');
          // You can use city.id or city.name as the value
          option.value = city.name; // or city.id
          option.textContent = city.name;
          citySelect.appendChild(option);
        });
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    }
  });
  