const express = require('express');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3000;

const API_KEY = '7f0362fe516f79e1534bb3046b9a0486'; // Replace with your Rebrickable API key
const BASE_URL = 'https://rebrickable.com/api/v3/lego/';
const DATA_FILE = path.join(__dirname, 'lego_sets_data.json');

async function fetchAllLegoSets() {
    let allSets = [];
    let nextUrl = `${BASE_URL}sets/?page_size=800`; // Start with 100 sets per page

    while (nextUrl) {
        try {
            const response = await axios.get(nextUrl, {
                headers: { 'Authorization': `key ${API_KEY}` }
            });
            allSets = allSets.concat(response.data.results);
            nextUrl = response.data.next;
            console.log(`Fetched ${allSets.length} sets so far...`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Respect rate limits
        } catch (error) {
            console.error('Error fetching LEGO sets:', error.message);
            break;
        }
    }

    return allSets;
}

async function fetchSetDetails(setNum) {
    const url = `${BASE_URL}sets/${setNum}/`;
    try {
        const response = await axios.get(url, {
            headers: { 'Authorization': `key ${API_KEY}` }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching details for set ${setNum}:`, error.message);
        return null;
    }
}

async function fetchAndStoreLegoData() {
    try {
        console.log('Starting to fetch all LEGO sets...');
        const sets = await fetchAllLegoSets();
        console.log(`Fetched a total of ${sets.length} sets. Now fetching details...`);

        const detailedSets = [];
        for (const set of sets) {
            const details = await fetchSetDetails(set.set_num);
            if (details) {
                detailedSets.push({
                    product_name: details.name,
                    set_num: details.set_num,
                    year: 2024,
                    theme: details.theme_id,
                    num_parts: details.num_parts,
                    set_img_url: details.set_img_url,
                    set_url: details.set_url,
                    last_modified_dt: details.last_modified_dt
                });
            }
            await new Promise(resolve => setTimeout(resolve, 1000)); // Respect rate limits
            if (detailedSets.length % 100 === 0) {
                console.log(`Processed ${detailedSets.length} sets...`);
            }
        }

        // Store data in JSON file
        await fs.writeFile(DATA_FILE, JSON.stringify(detailedSets, null, 2));
        console.log(`Data stored in ${DATA_FILE}`);

        return detailedSets;
    } catch (error) {
        console.error('Error processing and storing LEGO set data:', error.message);
        throw error;
    }
}

app.get('/lego-sets', async (req, res) => {
    try {
        let data;
        try {
            // Try to read from the file first
            data = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
            console.log('Data loaded from file');
        } catch (error) {
            // If file doesn't exist or is invalid, fetch new data
            console.log('Fetching new data from API...');
            data = await fetchAndStoreLegoData();
        }
        res.json(data);
    } catch (error) {
        console.error('Error processing request:', error.message);
        res.status(500).json({ error: 'An error occurred while fetching LEGO set data' });
    }
});

app.get('/refresh-data', async (req, res) => {
    try {
        console.log('Refreshing LEGO set data...');
        await fetchAndStoreLegoData();
        res.json({ message: 'Data refreshed successfully' });
    } catch (error) {
        console.error('Error refreshing data:', error.message);
        res.status(500).json({ error: 'An error occurred while refreshing LEGO set data' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Navigate to http://localhost:3000/lego-sets to fetch LEGO set data');
    console.log('Use http://localhost:3000/refresh-data to force a refresh of the data');
});