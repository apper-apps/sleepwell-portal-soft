import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import { useUser } from '@/hooks/useUser';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useUser();
  
  const getMenuItems = () => {
    const commonItems = [
      { icon: 'LayoutDashboard', label: 'Dashboard', path: '/' },
      { icon: 'Moon', label: 'Sleep Diary', path: '/sleep-diary' },
      { icon: 'Calendar', label: 'Schedule', path: '/schedule' },
      { icon: 'BookOpen', label: 'Resources', path: '/resources' },
      { icon: 'MessageCircle', label: 'Messages', path: '/messages' },
      { icon: 'Settings', label: 'Settings', path: '/settings' }
    ];
    
    if (user?.role === 'coach') {
      return [
        ...commonItems.slice(0, 3),
        { icon: 'Users', label: 'My Clients', path: '/clients' },
        ...commonItems.slice(3)
      ];
    }
    
    return commonItems;
  };
  
  const menuItems = getMenuItems();
  
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        />
      )}
      
      {/* Mobile Sidebar */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <ApperIcon name="Moon" className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">SleepWell</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ApperIcon name="X" className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) => 
                    `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-primary text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <ApperIcon name={item.icon} className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </motion.div>
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-white border-r border-gray-200 h-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <ApperIcon name="Moon" className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">SleepWell</h2>
              <p className="text-sm text-gray-600">Sleep Coaching Portal</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-primary text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <ApperIcon name={item.icon} className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user?.name?.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;