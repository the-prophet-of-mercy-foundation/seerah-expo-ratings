import React from 'react';

const ModelsSection = ({ models, newModel, setNewModel, isEditing, handleAddModel, startEditModel, handleDeleteModel }) => {
    return (
        <div>
            <h3 className="text-xl font-bold mb-4">{isEditing ? 'Update Model' : 'Add New Model'}</h3>
            <form onSubmit={handleAddModel} className="space-y-4 mb-8">
                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Model Number"
                        maxLength={6}
                        value={newModel.model_number}
                        onChange={(e) => setNewModel({...newModel, model_number: e.target.value})}
                        className="border rounded px-3 py-2"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Location (e.g., Hall A, Stall 1)"
                        value={newModel.location}
                        onChange={(e) => setNewModel({...newModel, location: e.target.value})}
                        className="border rounded px-3 py-2"
                        required
                    />
                </div>
                <input
                    type="text"
                    placeholder="Name (English)"
                    value={newModel.name_en}
                    onChange={(e) => setNewModel({...newModel, name_en: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                    required
                />
                <textarea
                    placeholder="Description (English)"
                    value={newModel.description_en}
                    onChange={(e) => setNewModel({...newModel, description_en: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                    rows="3"
                />
                <input
                    type="text"
                    placeholder="Name (Urdu)"
                    value={newModel.name_ur}
                    onChange={(e) => setNewModel({...newModel, name_ur: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                />
                {newModel.name_ur && newModel.name_ur.trim() !== '' && (
                    <textarea
                        placeholder="Description (Urdu)"
                        value={newModel.description_ur}
                        onChange={(e) => setNewModel({...newModel, description_ur: e.target.value})}
                        className="w-full border rounded px-3 py-2"
                        rows="3"
                    />
                )}
                <input
                    type="text"
                    placeholder="Name (Kannada)"
                    value={newModel.name_kn}
                    onChange={(e) => setNewModel({...newModel, name_kn: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                />
                {newModel.name_kn && newModel.name_kn.trim() !== '' && (
                    <textarea
                        placeholder="Description (Kannada)"
                        value={newModel.description_kn}
                        onChange={(e) => setNewModel({...newModel, description_kn: e.target.value})}
                        className="w-full border rounded px-3 py-2"
                        rows="3"
                    />
                )}

                <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
                >
                    {isEditing ? 'Update Model' : 'Add Model'}
                </button>
            </form>

            <h3 className="text-xl font-bold mb-4">Existing Models ({models.length})</h3>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Model#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Location</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {models.map(model => (
                            <tr key={model.id}>
                                <td className="px-4 py-3 text-sm">{model.model_number}</td>
                                <td className="px-4 py-3 text-sm">{model.location}</td>
                                <td className="px-4 py-3 text-sm">{model.name_en}</td>
                                <td className="px-4 py-3 text-sm">{model.description_en}</td>
                                <td className="px-4 py-3 text-sm">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => startEditModel(model)}
                                            className="text-sm bg-yellow-400 text-yellow-900 px-3 py-1 rounded"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteModel(model.id)}
                                            className="text-sm bg-red-600 text-white px-3 py-1 rounded"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ModelsSection;
