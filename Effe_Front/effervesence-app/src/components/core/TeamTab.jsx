import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const TeamTab = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    axiosInstance.get('/user/department/members')
      .then(res => setTeam(res.data.users))
      .catch(() => setError('Failed to load team members.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading team...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Team Management</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow-lg">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Department</th>
            </tr>
          </thead>
          <tbody>
            {team.map(member => (
              <tr key={member._id} className="hover:bg-indigo-50 transition">
                <td className="px-6 py-4 flex items-center gap-3">
                  <img src={member.photo || '/api/placeholder/32/32'} alt={member.name} className="w-8 h-8 rounded-full border" />
                  <span className="font-medium">{member.name}</span>
                </td>
                <td className="px-6 py-4">{member.role}</td>
                <td className="px-6 py-4">{member.email}</td>
                <td className="px-6 py-4">{member.department}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamTab;