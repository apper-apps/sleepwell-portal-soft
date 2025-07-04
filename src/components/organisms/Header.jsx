import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Settings from "@/components/pages/Settings";
import { useUser } from "@/hooks/useUser";

const Header = ({ onMenuClick, showMobileMenu = false }) => {
  const { user, switchRole } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const notifications = [
    { id: 1, type: 'message', content: 'New message from Sarah', time: '5 min ago' },
    { id: 2, type: 'appointment', content: 'Upcoming appointment in 30 min', time: '10 min ago' },
    { id: 3, type: 'diary', content: 'Sleep diary entry reminder', time: '1 hour ago' }
  ];
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message': return 'MessageCircle';
      case 'appointment': return 'Calendar';
      case 'diary': return 'Moon';
      default: return 'Bell';
    }
  };
  
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          icon="Menu"
          onClick={onMenuClick}
          className="lg:hidden"
        />
        
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {user?.role === 'coach' ? 'Coach Dashboard' : 'My Sleep Journey'}
          </h1>
          <p className="text-sm text-gray-500">
            Welcome back, {user?.name}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Role Switcher for Demo */}
        <div className="hidden md:flex items-center space-x-2">
          <Button
            variant={user?.role === 'coach' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => switchRole('coach')}
          >
            Coach View
          </Button>
          <Button
            variant={user?.role === 'client' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => switchRole('client')}
          >
            Client View
          </Button>
        </div>
        
        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            icon="Bell"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative"
          >
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-xs rounded-full flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </Button>
          
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
              >
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="X"
                      onClick={() => setShowNotifications(false)}
                    />
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-4 border-b border-gray-50 hover:bg-gray-50">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                          <ApperIcon name={getNotificationIcon(notification.type)} className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{notification.content}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 bg-gray-50">
                  <Button variant="ghost" size="sm" fullWidth>
                    View all notifications
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* User Menu */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user?.name?.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <ApperIcon name="ChevronDown" className="w-4 h-4" />
          </Button>
          
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
              >
                <div className="p-4 border-b border-gray-100">
                  <p className="font-medium text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
                
                <div className="py-2">
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                    <ApperIcon name="User" className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                    <ApperIcon name="Settings" className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                    <ApperIcon name="HelpCircle" className="w-4 h-4" />
                    <span>Help</span>
                  </button>
                </div>
                
<div className="py-2 border-t border-gray-100">
                  <button 
                    onClick={() => {
                      const { logout } = require('@/App').AuthContext._currentValue || {};
                      if (logout) logout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <ApperIcon name="LogOut" className="w-4 h-4" />
<span>Sign out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;