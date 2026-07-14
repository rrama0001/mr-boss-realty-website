import { mapUnitToPropertyCard } from '@/utils/mapUnitToProperty';
import { mapWholeBuildingToPropertyCard } from '@/utils/mapWholeBuildingToProperty';

export function getWholeBuildingListings(property = {}) {
    return (property.buildings || []).filter((building) => building.is_whole_property_listing);
}

export function mapPropertyDetailListingCards(property = {}) {
    const wholeBuildingCards = getWholeBuildingListings(property)
        .map((building) => mapWholeBuildingToPropertyCard(building, property));

    const unitCards = (property.units || [])
        .map((unit) => mapUnitToPropertyCard(unit, property));

    return [...wholeBuildingCards, ...unitCards];
}
