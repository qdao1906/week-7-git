const countrySelect = document.getElementById('countrySelect');
        const spinner = document.getElementById('spinner');

        countrySelect.addEventListener('change', async (e) => {
            const countryName = e.target.value;
            
            if (!countryName) {
                clearTable();
                return;
            }

            await fetchCountryData(countryName);
        });

        function clearTable() {
            document.getElementById('name').textContent = '';
            document.getElementById('officialName').textContent = '';
            document.getElementById('capital').textContent = '';
            document.getElementById('language').textContent = '';
            document.getElementById('mapLink').innerHTML = '';
            document.getElementById('population').textContent = '';
            document.getElementById('flag').innerHTML = '';
            document.getElementById('coordinates').textContent = '';
            document.getElementById('rainfall').textContent = '';
            document.getElementById('temperature').textContent = '';
        }

        function showSpinner() {
            spinner.classList.add('active');
        }

        function hideSpinner() {
            spinner.classList.remove('active');
        }

        async function fetchCountryData(countryName) {
            clearTable();
            showSpinner();

            try {
                // Fetch country data
                const countryResponse = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);
                
                if (!countryResponse.ok) {
                    throw new Error(`Country API error: ${countryResponse.status}`);
                }
                
                const countryData = await countryResponse.json();
                const country = countryData[0];

                // Check if capital exists
                if (!country.capital || country.capital.length === 0) {
                    throw new Error('No capital city found');
                }

                const capitalCity = country.capital[0];
                
                // Check if coordinates exist
                if (!country.capitalInfo || !country.capitalInfo.latlng || country.capitalInfo.latlng.length < 2) {
                    throw new Error('No coordinates found for capital');
                }
                
                const latitude = country.capitalInfo.latlng[0];
                const longitude = country.capitalInfo.latlng[1];

                // Fetch weather data
                const weatherResponse = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,rain&forecast_days=1`
                );
                
                if (!weatherResponse.ok) {
                    throw new Error(`Weather API error: ${weatherResponse.status}`);
                }
                
                const weatherData = await weatherResponse.json();

                // Calculate rainfall and temperature
                const totalRainfall = weatherData.hourly.rain.reduce((sum, val) => sum + (val || 0), 0);
                const avgTemperature = weatherData.hourly.temperature_2m.reduce((sum, val) => sum + val, 0) / weatherData.hourly.temperature_2m.length;

                // Get languages
                const languages = Object.values(country.languages || {}).join(', ');

                // Update table
                document.getElementById('name').textContent = country.name.common;
                document.getElementById('officialName').textContent = country.name.official;
                document.getElementById('capital').textContent = capitalCity;
                document.getElementById('language').textContent = languages;
                document.getElementById('mapLink').innerHTML = `<a href="${country.maps.googleMaps}" target="_blank">View Map</a>`;
                document.getElementById('population').textContent = country.population.toLocaleString();
                document.getElementById('flag').innerHTML = `<img src="${country.flags.png}" alt="Flag" class="flag-img">`;
                document.getElementById('coordinates').textContent = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
                document.getElementById('rainfall').textContent = `${totalRainfall.toFixed(2)} mm`;
                document.getElementById('temperature').textContent = `${avgTemperature.toFixed(2)} °C`;

                hideSpinner();
            } catch (error) {
                console.error('Error fetching data:', error);
                hideSpinner();
                alert(`Error: ${error.message}. Please check the console for details.`);
            }
        }