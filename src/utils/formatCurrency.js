export function formatCurrency(value, { currency = 'PHP', fallback = 'Price on request' } = {}) {
    const amount = Number(value);

    if (!amount) {
        return fallback;
    }

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatPriceRange(minPrice, maxPrice) {
    if (!minPrice && !maxPrice) {
        return 'Price on request';
    }

    if (minPrice && maxPrice && minPrice !== maxPrice) {
        return `${formatCurrency(minPrice, { fallback: '' })} – ${formatCurrency(maxPrice, { fallback: '' })}`;
    }

    const value = minPrice || maxPrice;
    return minPrice ? `From ${formatCurrency(value)}` : formatCurrency(value);
}
