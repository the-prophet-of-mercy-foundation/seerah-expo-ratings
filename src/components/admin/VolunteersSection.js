import React from 'react';

const VolunteersSection = ({ volunteers }) => {
    return (
        <div>
            <h3 className="text-xl font-bold mb-4">Volunteers ({volunteers.length})</h3>
            <div className="space-y-2">
                {volunteers.map(v => (
                    <div key={v.id} className="border rounded p-3">
                        <span className="font-semibold">{v.name}</span> - {v.volunteer_code}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VolunteersSection;
