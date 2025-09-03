import { useState, useEffect } from 'react';
import { 
  getAllStaff, 
  getAllServices, 
  getBusinessSettings, 
  Staff, 
  Service,
  BusinessSettings
} from '../api';

/**
 * Example component demonstrating API integration
 */
const APIIntegrationExample = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch data from multiple endpoints in parallel
        const [staffResponse, servicesResponse, settingsResponse] = await Promise.all([
          getAllStaff(),
          getAllServices(),
          getBusinessSettings()
        ]);
        
        // Extract data from responses
        if (staffResponse.success) {
          setStaff(staffResponse.staff);
        }
        
        if (servicesResponse.success) {
          setServices(servicesResponse.services);
        }
        
        if (settingsResponse.success) {
          setSettings(settingsResponse.settings);
        }
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error('API Integration error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return <div>Loading data from API...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  return (
    <div className="api-integration-example">
      <h2>API Integration Example</h2>
      
      {settings && (
        <div className="business-info">
          <h3>Business Information</h3>
          <p><strong>Name:</strong> {settings.name}</p>
          <p><strong>Address:</strong> {settings.address}</p>
          <p><strong>Phone:</strong> {settings.phone}</p>
          <p><strong>Email:</strong> {settings.email}</p>
        </div>
      )}
      
      <div className="services-list">
        <h3>Services ({services.length})</h3>
        <ul>
          {services.map(service => (
            <li key={service.id}>
              <strong>{service.name}</strong> - ${service.price.toFixed(2)}
              <p>{service.description}</p>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="staff-list">
        <h3>Staff ({staff.length})</h3>
        <ul>
          {staff.map(member => (
            <li key={member.id}>
              <strong>{member.name}</strong> - {member.position}
              {member.bio && <p>{member.bio}</p>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default APIIntegrationExample; 