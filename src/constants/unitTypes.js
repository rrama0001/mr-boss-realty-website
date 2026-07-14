export const UNIT_TYPE_ORDER = [
    'Studio',
    'Standard Room',
    '1 Bedroom',
    '2 Bedroom',
    '3 Bedroom',
    'Loft',
    'Penthouse',
    'Hotel Room',
    'Deluxe Room',
    'Suite',
    'Executive Suite',
    'Presidential Suite',
    'Retail Space',
    'Office Space',
    'Warehouse',
    'Storage Unit',
    'Showroom',
    'Restaurant Space',
    'Kiosk',
    'Function Room',
    'Conference Room',
    'Meeting Room',
    'Event Hall',
    'Parking Slot',
    'Motorcycle Parking',
    'Storage Locker',
];

export function sortUnitTypes(types = []) {
    const order = new Map(UNIT_TYPE_ORDER.map((name, index) => [name, index]));

    return [...types].sort((a, b) => {
        const aIndex = order.has(a) ? order.get(a) : Number.MAX_SAFE_INTEGER;
        const bIndex = order.has(b) ? order.get(b) : Number.MAX_SAFE_INTEGER;

        if (aIndex !== bIndex) return aIndex - bIndex;
        return a.localeCompare(b);
    });
}
