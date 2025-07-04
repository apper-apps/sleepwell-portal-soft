import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate user loading - in real app, this would check authentication
    const timer = setTimeout(() => {
      setUser({
        Id: 1,
        email: 'coach@sleepwell.com',
        name: 'Dr. Sarah Wilson',
        role: 'coach',
        profile: {
          avatar: null,
          title: 'Sleep Specialist',
          certification: 'CBSM-Certified',
          experience: '8 years',
          specialties: ['Insomnia', 'Sleep Apnea', 'Circadian Rhythm Disorders']
        }
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const switchRole = (newRole) => {
    setUser(prev => ({
      ...prev,
      role: newRole,
      ...(newRole === 'client' && {
        Id: 2,
        email: 'client@sleepwell.com',
        name: 'Michael Chen',
        coachId: 1,
        profile: {
          avatar: null,
          dateOfBirth: '1985-03-15',
          sleepGoal: 'Improve sleep quality and reduce insomnia',
          currentPhase: 'active',
          joinedDate: '2024-01-15'
        }
      })
    }));
  };

  return (
    <UserContext.Provider value={{ user, loading, switchRole }}>
      {children}
    </UserContext.Provider>
  );
};