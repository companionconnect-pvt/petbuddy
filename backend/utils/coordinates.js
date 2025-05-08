const { geocode } = require('opencage-api-client');

async function getCoordinates(address) {
    try {
        const res = await geocode({ q : address });
        if (res.status.code === 200) {
            const geocoded = res.results[0];
            const lat = geocoded.geometry.lat;
            const lng = geocoded.geometry.lng;
            console.log(`${lat}, ${lng}`);
            return { lat, lng };
        }
    } catch (error) {
        console.log(error);
    }
};

module.exports = { getCoordinates };