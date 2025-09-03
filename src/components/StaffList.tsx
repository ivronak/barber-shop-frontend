import { useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { getAllStaff, Staff } from '../api';

/**
 * Component for displaying a list of staff members
 */
const StaffList = () => {
  // Use the custom hook to handle API call
  const {
    data: response,
    loading,
    error,
    execute: fetchStaff
  } = useApi(getAllStaff);

  // Fetch data on component mount
  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Extract staff data from response
  const staff = response?.success ? response.staff : [];

  if (loading) {
    return <div>Loading staff...</div>;
  }

  if (error) {
    return <div className="error">Error loading staff: {error.message}</div>;
  }

  return (
    <div className="staff-list">
      <h2>Staff Members</h2>
      
      {staff.length === 0 ? (
        <p>No staff members found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((member: Staff) => (
            <div key={member.id} className="staff-card">
              <div className="staff-image">
                {member.image ? (
                  <img src={member.image} alt={member.name} />
                ) : (
                  <div className="placeholder-image">
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="staff-details">
                <h3>{member.name}</h3>
                <p className="position">{member.position}</p>
                {member.bio && <p className="bio">{member.bio}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffList; 