import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/useUser";
import NotesSection from "@/components/molecules/NotesSection";
import { format, parseISO } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Clients from "@/components/pages/Clients";
import Schedule from "@/components/pages/Schedule";
import SleepQualityRating from "@/components/molecules/SleepQualityRating";
import StatCard from "@/components/molecules/StatCard";
import appointmentService from "@/services/api/appointmentService";
import sleepEntryService from "@/services/api/sleepEntryService";
import clientService from "@/services/api/clientService";

const ClientDetail = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
const [client, setClient] = useState(null);
  const [sleepEntries, setSleepEntries] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  useEffect(() => {
    if (user?.role !== 'coach') {
      navigate('/');
      return;
    }
    loadClientData();
  }, [clientId, user, navigate]);
  
  const loadClientData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [clientData, sleepData, appointmentData] = await Promise.all([
        clientService.getById(parseInt(clientId)),
        sleepEntryService.getAll(),
        appointmentService.getAll()
      ]);
      
      setClient(clientData);
      setSleepEntries(sleepData.filter(entry => entry.userId === clientData.Id));
      setAppointments(appointmentData.filter(apt => apt.clientId === clientData.Id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const calculateStats = () => {
    const recentEntries = sleepEntries.slice(-7);
    const avgQuality = recentEntries.length > 0 
      ? (recentEntries.reduce((sum, entry) => sum + entry.quality, 0) / recentEntries.length).toFixed(1)
      : 0;
    
    const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
    const upcomingAppointments = appointments.filter(apt => 
      apt.status === 'scheduled' && new Date(apt.dateTime) > new Date()
    ).length;
    
    return {
      totalEntries: sleepEntries.length,
      avgSleepScore: avgQuality,
      completedSessions: completedAppointments,
      upcomingSessions: upcomingAppointments,
      currentStreak: Math.min(sleepEntries.length, 7) // Simplified
    };
  };
  
  if (loading) return <Loading type="dashboard" />;
  if (error) return <Error message={error} onRetry={loadClientData} />;
  if (!client) return <Error message="Client not found" onRetry={() => navigate('/clients')} />;
  
  const stats = calculateStats();
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'completed': return 'info';
      default: return 'gray';
    }
  };
  
  const getPhaseColor = (phase) => {
    switch (phase) {
      case 'onboarding': return 'warning';
      case 'active': return 'success';
      case 'review': return 'info';
      case 'completed': return 'gray';
      default: return 'gray';
    }
  };
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'sleep-diary', label: 'Sleep Diary', icon: 'Moon' },
    { id: 'appointments', label: 'Appointments', icon: 'Calendar' },
    { id: 'notes', label: 'Notes', icon: 'FileText' }
  ];
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            icon="ArrowLeft"
            onClick={() => navigate('/clients')}
          >
            Back to Clients
          </Button>
          
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-xl">
              {client.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
              <Badge variant={getStatusColor(client.status)}>
                {client.status}
              </Badge>
              <Badge variant={getPhaseColor(client.currentPhase)}>
                {client.currentPhase}
              </Badge>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <ApperIcon name="Mail" className="w-4 h-4" />
                <span>{client.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <ApperIcon name="Calendar" className="w-4 h-4" />
                <span>Joined {format(parseISO(client.joinedDate), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            icon="MessageCircle"
          >
            Message
          </Button>
          <Button
            icon="Calendar"
          >
            Schedule Session
          </Button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Entries"
          value={stats.totalEntries}
          icon="BookOpen"
          subtitle="Sleep diary logs"
        />
        <StatCard
          title="Sleep Score"
          value={`${stats.avgSleepScore}/5`}
          icon="Moon"
          subtitle="7-day average"
          gradient
        />
        <StatCard
          title="Current Streak"
          value={`${stats.currentStreak} days`}
          icon="Zap"
          subtitle="Consecutive tracking"
        />
        <StatCard
          title="Completed Sessions"
          value={stats.completedSessions}
          icon="CheckCircle"
          subtitle="Total sessions"
        />
        <StatCard
          title="Upcoming Sessions"
          value={stats.upcomingSessions}
          icon="Calendar"
          subtitle="Scheduled"
        />
      </div>
      
      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <ApperIcon name={tab.icon} className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sleep Trends</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <ApperIcon name="BarChart3" className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Sleep trend chart</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Client Goal</h4>
                  <p className="text-sm text-gray-600">{client.sleepGoal}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Journey Progress</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Onboarding</span>
                      <span className="text-success">✓</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Active Tracking</span>
                      <span className="text-primary">In Progress</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Review & Adjust</span>
                      <span className="text-gray-400">Pending</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'sleep-diary' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Sleep Diary Entries</h3>
                <Button
                  variant="outline"
                  icon="Download"
                  size="sm"
                >
                  Export Data
                </Button>
              </div>
              
              {sleepEntries.length === 0 ? (
                <div className="text-center py-8">
                  <ApperIcon name="Moon" className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No sleep entries yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sleepEntries.slice(-10).reverse().map((entry) => (
                    <motion.div
                      key={entry.Id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 p-4 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          {format(parseISO(entry.date), 'EEEE, MMMM d, yyyy')}
                        </h4>
                        <SleepQualityRating value={entry.quality} readonly />
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <ApperIcon name="Moon" className="w-4 h-4" />
                          <span>Bedtime: {entry.bedTime}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ApperIcon name="Sun" className="w-4 h-4" />
                          <span>Wake: {entry.wakeTime}</span>
                        </div>
                      </div>
                      
                      {entry.notes && (
                        <p className="mt-2 text-sm text-gray-700">{entry.notes}</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Appointments</h3>
              
              {appointments.length === 0 ? (
                <div className="text-center py-8">
                  <ApperIcon name="Calendar" className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No appointments scheduled</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.Id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {format(parseISO(appointment.dateTime), 'EEEE, MMMM d, yyyy')}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {format(parseISO(appointment.dateTime), 'h:mm a')} - {appointment.type}
                          </p>
                        </div>
                        <Badge variant={
                          appointment.status === 'completed' ? 'success' :
                          appointment.status === 'scheduled' ? 'info' : 'error'
                        }>
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
{activeTab === 'notes' && (
            <NotesSection 
              clientId={parseInt(clientId)}
              notes={notes}
              onNotesUpdate={setNotes}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDetail;