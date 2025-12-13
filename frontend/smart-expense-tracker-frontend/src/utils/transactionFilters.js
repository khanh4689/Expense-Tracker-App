/**
 * Export transactions to CSV format
 */
export const exportToCSV = (transactions, filename = 'transactions') => {
    if (!transactions || transactions.length === 0) {
        alert('No transactions to export');
        return;
    }

    // CSV headers
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Description'];

    // Convert transactions to CSV rows
    const rows = transactions.map(t => [
        t.date,
        t.type,
        t.category || 'N/A',
        t.amount.toFixed(2),
        (t.description || '').replace(/,/g, ';') // Replace commas to avoid CSV issues
    ]);

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and download file
    downloadFile(csvContent, `${filename}.csv`, 'text/csv');
};

/**
 * Export transactions to JSON format
 */
export const exportToJSON = (transactions, filename = 'transactions') => {
    if (!transactions || transactions.length === 0) {
        alert('No transactions to export');
        return;
    }

    const jsonContent = JSON.stringify(transactions, null, 2);
    downloadFile(jsonContent, `${filename}.json`, 'application/json');
};

/**
 * Helper function to download file
 */
const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

/**
 * Get quick filter date ranges
 */
export const getQuickFilterDates = (filter) => {
    const today = new Date();
    const dateFrom = new Date();
    const dateTo = new Date();

    switch (filter) {
        case 'today':
            // Today only
            break;

        case 'yesterday':
            dateFrom.setDate(today.getDate() - 1);
            dateTo.setDate(today.getDate() - 1);
            break;

        case 'thisWeek':
            // Start of week (Monday)
            const dayOfWeek = today.getDay();
            const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            dateFrom.setDate(today.getDate() - diff);
            break;

        case 'thisMonth':
            dateFrom.setDate(1);
            break;

        case 'last30Days':
            dateFrom.setDate(today.getDate() - 30);
            break;

        case 'last90Days':
            dateFrom.setDate(today.getDate() - 90);
            break;

        case 'thisYear':
            dateFrom.setMonth(0, 1);
            break;

        default:
            return null;
    }

    return {
        from: dateFrom.toISOString().split('T')[0],
        to: dateTo.toISOString().split('T')[0]
    };
};

/**
 * Filter transactions based on criteria
 */
export const filterTransactions = (transactions, filters) => {
    return transactions.filter(transaction => {
        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const matchesSearch =
                (transaction.description || '').toLowerCase().includes(searchLower) ||
                (transaction.category || '').toLowerCase().includes(searchLower) ||
                transaction.amount.toString().includes(searchLower);

            if (!matchesSearch) return false;
        }

        // Date range filter
        if (filters.dateFrom) {
            if (transaction.date < filters.dateFrom) return false;
        }
        if (filters.dateTo) {
            if (transaction.date > filters.dateTo) return false;
        }

        // Amount range filter
        if (filters.amountMin !== '' && filters.amountMin !== null) {
            if (transaction.amount < parseFloat(filters.amountMin)) return false;
        }
        if (filters.amountMax !== '' && filters.amountMax !== null) {
            if (transaction.amount > parseFloat(filters.amountMax)) return false;
        }

        // Category filter
        if (filters.categories && filters.categories.length > 0) {
            if (!filters.categories.includes(transaction.category)) return false;
        }

        // Type filter
        if (filters.type && filters.type !== 'all') {
            if (transaction.type !== filters.type.toUpperCase()) return false;
        }

        return true;
    });
};

/**
 * Save filter preset to localStorage
 */
export const saveFilterPreset = (name, filters) => {
    const presets = getFilterPresets();
    presets[name] = filters;
    localStorage.setItem('filterPresets', JSON.stringify(presets));
};

/**
 * Get all filter presets from localStorage
 */
export const getFilterPresets = () => {
    const presets = localStorage.getItem('filterPresets');
    return presets ? JSON.parse(presets) : {};
};

/**
 * Delete filter preset
 */
export const deleteFilterPreset = (name) => {
    const presets = getFilterPresets();
    delete presets[name];
    localStorage.setItem('filterPresets', JSON.stringify(presets));
};
