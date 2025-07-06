import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/hooks/useUser';
import StatCard from '@/components/molecules/StatCard';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import sleepEntryService from '@/services/api/sleepEntryService';
import appointmentService from '@/services/api/appointmentService';
import clientService from '@/services/api/clientService';
import Button from '@/components/atoms/Button';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    loadDashboardData();
  }, [user?.role]);
  
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (user?.role === 'coach') {
        const [clients, appointments, sleepEntries] = await Promise.all([
          clientService.getAll(),
          appointmentService.getAll(),
          sleepEntryService.getAll()
        ]);
        
        setStats({
          totalClients: clients.length,
          activeClients: clients.filter(c => c.status === 'active').length,
          todayAppointments: appointments.filter(a => 
            new Date(a.dateTime).toDateString() === new Date().toDateString()
          ).length,
          avgSleepScore: sleepEntries.length > 0 
            ? (sleepEntries.reduce((sum, entry) => sum + entry.quality, 0) / sleepEntries.length).toFixed(1)
            : 0
        });
        
        setRecentActivity([
          { type: 'appointment', message: 'Appointment with Sarah completed', time: '2 hours ago' },
          { type: 'message', message: 'New message from Michael', time: '4 hours ago' },
          { type: 'diary', message: 'Sleep diary entry from Emma', time: '6 hours ago' }
        ]);
      } else {
        const sleepEntries = await sleepEntryService.getAll();
        const appointments = await appointmentService.getAll();
        
        const recentEntries = sleepEntries.slice(-7);
        const avgQuality = recentEntries.length > 0 
          ? (recentEntries.reduce((sum, entry) => sum + entry.quality, 0) / recentEntries.length).toFixed(1)
          : 0;
        
        setStats({
          currentStreak: 7,
          avgSleepScore: avgQuality,
          totalEntries: sleepEntries.length,
          nextAppointment: appointments.find(a => new Date(a.dateTime) > new Date())
        });
        
        setRecentActivity([
          { type: 'diary', message: 'Sleep diary entry added', time: '1 hour ago' },
          { type: 'appointment', message: 'Appointment scheduled', time: '2 days ago' },
          { type: 'resource', message: 'New resource available', time: '3 days ago' }
        ]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <Loading type="dashboard" />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;
  
  const getActivityIcon = (type) => {
    switch (type) {
      case 'appointment': return 'Calendar';
      case 'message': return 'MessageCircle';
      case 'diary': return 'Moon';
      case 'resource': return 'BookOpen';
      default: return 'Activity';
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'coach' ? 'Coach Dashboard' : 'My Sleep Journey'}
          </h1>
          <p className="text-gray-600">
            {user?.role === 'coach' 
              ? 'Monitor your clients and track their progress'
              : 'Track your sleep patterns and progress towards better rest'
            }
          </p>
        </div>
        
        <Button
          icon="Plus"
          onClick={() => navigate('/sleep-diary')}
        >
          {user?.role === 'coach' ? 'Add Client' : 'Log Sleep'}
        </Button>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {user?.role === 'coach' ? (
          <>
            <StatCard
              title="Total Clients"
              value={stats.totalClients}
              icon="Users"
              subtitle="Active clients"
              trend="+2 this month"
              trendDirection="up"
            />
            <StatCard
              title="Active Clients"
              value={stats.activeClients}
              icon="UserCheck"
              subtitle="Currently enrolled"
              trend="+5% vs last month"
              trendDirection="up"
            />
            <StatCard
              title="Today's Appointments"
              value={stats.todayAppointments}
              icon="Calendar"
              subtitle="Scheduled sessions"
              trend="3 completed"
              trendDirection="neutral"
            />
            <StatCard
              title="Avg Sleep Score"
              value={`${stats.avgSleepScore}/5`}
              icon="Moon"
              subtitle="Client average"
              trend="+0.3 this week"
              trendDirection="up"
              gradient
            />
          </>
        ) : (
          <>
            <StatCard
              title="Current Streak"
              value={`${stats.currentStreak} days`}
              icon="Zap"
              subtitle="Consecutive tracking"
              trend="Personal best!"
              trendDirection="up"
            />
            <StatCard
              title="Sleep Score"
              value={`${stats.avgSleepScore}/5`}
              icon="Moon"
              subtitle="7-day average"
              trend="+0.5 this week"
              trendDirection="up"
              gradient
            />
            <StatCard
              title="Total Entries"
              value={stats.totalEntries}
              icon="BookOpen"
              subtitle="Sleep diary logs"
              trend="Great progress!"
              trendDirection="up"
            />
            <StatCard
              title="Next Session"
              value={stats.nextAppointment ? "Tomorrow" : "None"}
              icon="Calendar"
              subtitle="Upcoming appointment"
              trend="With Dr. Wilson"
              trendDirection="neutral"
            />
          </>
        )}
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sleep Trends Chart */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {user?.role === 'coach' ? 'Client Sleep Trends' : 'Your Sleep Trends'}
              </h3>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 text-sm bg-primary text-white rounded-lg">7D</button>
                <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">30D</button>
                <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">3M</button>
              </div>
            </div>
            
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <ApperIcon name="BarChart3" className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Sleep trend chart will appear here</p>
                <p className="text-sm text-gray-500">Integrated with ApexCharts</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            
            {recentActivity.length === 0 ? (
              <Empty
                title="No recent activity"
                description="Activity will appear here as you use the platform"
                icon="Activity"
                showAction={false}
              />
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                      <ApperIcon name={getActivityIcon(activity.type)} className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <Button
                variant="outline"
                fullWidth
                icon="Moon"
                onClick={() => navigate('/sleep-diary')}
              >
                {user?.role === 'coach' ? 'View Sleep Diaries' : 'Log Sleep Entry'}
              </Button>
              
              <Button
                variant="outline"
                fullWidth
                icon="Calendar"
                onClick={() => navigate('/schedule')}
              >
                {user?.role === 'coach' ? 'Manage Schedule' : 'Book Appointment'}
              </Button>
              
              <Button
                variant="outline"
                fullWidth
                icon="MessageCircle"
                onClick={() => navigate('/messages')}
              >
                View Messages
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;