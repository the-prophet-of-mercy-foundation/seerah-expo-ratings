import React, { useState, useEffect } from 'react';
import { getModels, addModel, updateModel, deleteModel } from '../lib/modelsApi';
import { getVolunteers } from '../lib/volunteersApi';
import { makeBulkQrUrls } from '../lib/qrUtils';
import { convertToCSV, triggerDownload } from '../lib/exportUtils';
import ModelsSection from './admin/ModelsSection';
import VolunteersSection from './admin/VolunteersSection';
import QRCodesSection from './admin/QRCodesSection';
import ExportSection from './admin/ExportSection';

const AdminPanel = () => {
    const [activeSection, setActiveSection] = useState('models');
    const [models, setModels] = useState([]);
    const [volunteers, setVolunteers] = useState([]);
    const [newModel, setNewModel] = useState({
        model_number: '',
        name_en: '',
        name_ur: '',
        name_kn: '',
        description_en: '',
        description_ur: '',
        description_kn: '',
        location: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editingModelId, setEditingModelId] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const modelsData = await getModels();
        setModels(modelsData || []);
        const vols = await getVolunteers();
        setVolunteers(vols || []);
    };

    const handleAddModel = async (e) => {
        e.preventDefault();

        if (isEditing && editingModelId) {
            await updateModel(editingModelId, newModel);
            setIsEditing(false);
            setEditingModelId(null);
        } else {
            await addModel(newModel);
        }

        setNewModel({
            model_number: '',
            name_en: '',
            name_ur: '',
            name_kn: '',
            description_en: '',
            description_ur: '',
            description_kn: '',
            location: ''
        });

        loadData();
    };

    const startEditModel = (model) => {
        setNewModel({
            model_number: model.model_number || '',
            name_en: model.name_en || '',
            name_ur: model.name_ur || '',
            name_kn: model.name_kn || '',
            description_en: model.description_en || '',
            description_ur: model.description_ur || '',
            description_kn: model.description_kn || '',
            location: model.location || ''
        });
        setIsEditing(true);
        setEditingModelId(model.id);
        try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {}
    };

    const handleDeleteModel = async (id) => {
        if (!window.confirm('Are you sure you want to delete this model? This cannot be undone.')) return;
        await deleteModel(id);
        if (editingModelId === id) {
            setIsEditing(false);
            setEditingModelId(null);
            setNewModel({
                model_number: '',
                name_en: '',
                name_ur: '',
                name_kn: '',
                description_en: '',
                description_ur: '',
                description_kn: '',
                location: ''
            });
        }
        loadData();
    };

    const generateQRCodes = () => {
        const urls = makeBulkQrUrls(models || []);
        console.table(urls);
        alert('QR URL list generated; check console (table) for model -> QR URL mapping.');
    };

    const exportData = async () => {
        // We'll fetch ratings via supabase client directly (not worth creating a wrapper for single use here)
        const { data: ratingsData } = await (await import('../lib/supabaseClient')).supabase.from('ratings').select();
        const csv = convertToCSV(ratingsData || []);
        triggerDownload('ratings_export.csv', csv);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
                    <p className="text-indigo-100">Manage Exhibition Data</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="bg-white rounded-lg shadow">
                    <div className="border-b border-gray-200">
                        <div className="flex space-x-8 px-6">
                            {['models', 'volunteers', 'qr-codes', 'export'].map(section => (
                                <button
                                    key={section}
                                    onClick={() => setActiveSection(section)}
                                    className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                                        activeSection === section
                                            ? 'border-indigo-600 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {section.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6">
                        {activeSection === 'models' && (
                            <ModelsSection
                                models={models}
                                newModel={newModel}
                                setNewModel={setNewModel}
                                isEditing={isEditing}
                                handleAddModel={handleAddModel}
                                startEditModel={startEditModel}
                                handleDeleteModel={handleDeleteModel}
                            />
                        )}

                        {activeSection === 'volunteers' && (
                            <VolunteersSection volunteers={volunteers} />
                        )}

                        {activeSection === 'qr-codes' && (
                            <QRCodesSection generateQRCodes={generateQRCodes} />
                        )}

                        {activeSection === 'export' && (
                            <ExportSection exportData={exportData} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
