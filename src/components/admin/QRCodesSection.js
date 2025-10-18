import React from 'react';

const QRCodesSection = ({ generateQRCodes }) => {
    return (
        <div>
            <h3 className="text-xl font-bold mb-4">Generate QR Codes</h3>
            <p className="text-gray-600 mb-4">
                Generate QR codes for all models. Each QR code will link to the rating form for that specific model.
            </p>
            <button
                onClick={generateQRCodes}
                className="bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700 transition"
            >
                Console Models URL for QR Codes
            </button>
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> This will output URLs to the console. Use an online QR code generator
                    (like qr-code-generator.com) or install the qrcode library to generate actual images.
                </p>
            </div>
        </div>
    );
};

export default QRCodesSection;
