import { cityToSlug } from '@/utils/propertyPublicUrl';
import { getListingCity } from '@/utils/propertyCity';
import { getWholeBuildingListings } from '@/utils/mapPropertyListingsToCards';

export function countPropertyListingsForProject(property = {}) {
    return getWholeBuildingListings(property).length + (property.units?.length || 0);
}

export function buildCityListingCounts({ privateProperties = [], units = [] } = {}) {
    const counts = {};

    privateProperties.forEach((property) => {
        const city = getListingCity(property);
        if (!city) return;
        counts[city] = (counts[city] || 0) + countPropertyListingsForProject(property);
    });

    units.forEach((unit) => {
        const city = getListingCity({ city: unit.project_city });
        if (!city) return;
        counts[city] = (counts[city] || 0) + 1;
    });

    return counts;
}

export function getCityListingCount(counts = {}, city = '') {
    const normalizedCity = String(city || '').trim();
    if (!normalizedCity) return 0;

    if (counts[normalizedCity] != null) {
        return counts[normalizedCity];
    }

    const slug = cityToSlug(normalizedCity);
    const matchKey = Object.keys(counts).find((key) => cityToSlug(key) === slug);
    return matchKey ? counts[matchKey] : 0;
}

export function getPlaceListingCount(counts = {}, place = {}) {
    const cities = Array.isArray(place.cities) && place.cities.length
        ? place.cities
        : [place.city || place.name];

    return cities.reduce((sum, city) => sum + getCityListingCount(counts, city), 0);
}
