import React from 'react';

const ExportSection = ({ exportData }) => {
    return (
        <div>
            <h3 className="text-xl font-bold mb-4">Export Data</h3>
            <p className="text-gray-600 mb-4">
                Download all ratings data as CSV for further analysis in Excel or other tools.
            </p>
            <button
                onClick={exportData}
                className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition"
            >
                Export Ratings to CSV
            </button>
        </div>
    );
};

export default ExportSection;
