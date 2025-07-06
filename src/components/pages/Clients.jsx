import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';
import clientService from '@/services/api/clientService';
import sleepEntryService from '@/services/api/sleepEntryService';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import SearchBar from '@/components/molecules/SearchBar';
import ApperIcon from '@/components/ApperIcon';
import { format, parseISO } from 'date-fns';

const Clients = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientStats, setClientStats] = useState({});
  
  useEffect(() => {
    if (user?.role === 'coach') {
      loadClients();
    } else {
      navigate('/');
    }
  }, [user, navigate]);
  
  useEffect(() => {
    filterClients();
  }, [clients, searchQuery, statusFilter]);
  
  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const [clientsData, sleepEntriesData] = await Promise.all([
        clientService.getAll(),
        sleepEntryService.getAll()
      ]);
      
      setClients(clientsData);
      
      // Calculate client stats
      const stats = {};
      clientsData.forEach(client => {
        const clientEntries = sleepEntriesData.filter(entry => entry.userId === client.Id);
        const recentEntries = clientEntries.slice(-7);
        const avgQuality = recentEntries.length > 0 
          ? (recentEntries.reduce((sum, entry) => sum + entry.quality, 0) / recentEntries.length).toFixed(1)
          : 0;
        
        stats[client.Id] = {
          totalEntries: clientEntries.length,
          avgSleepScore: avgQuality,
          lastEntry: clientEntries.length > 0 ? clientEntries[clientEntries.length - 1].date : null,
          currentStreak: Math.min(clientEntries.length, 7) // Simplified streak calculation
        };
      });
      
      setClientStats(stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const filterClients = () => {
    let filtered = clients;
    
    if (searchQuery) {
      filtered = filtered.filter(client => 
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === statusFilter);
    }
    
    setFilteredClients(filtered);
  };
  
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
  
  const getSleepScoreColor = (score) => {
    if (score >= 4) return 'text-success';
    if (score >= 3) return 'text-info';
    if (score >= 2) return 'text-warning';
    return 'text-error';
  };
  
  if (loading) return <Loading type="list" />;
  if (error) return <Error message={error} onRetry={loadClients} />;
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Clients</h1>
          <p className="text-gray-600">
            Monitor and manage your sleep coaching clients
          </p>
        </div>
        
        <Button
          icon="Plus"
          onClick={() => navigate('/clients/new')}
        >
          Add Client
        </Button>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search clients..."
              onSearch={setSearchQuery}
              onClear={() => setSearchQuery('')}
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Completed</option>
            </select>
            
            <Button
              variant="outline"
              icon="Filter"
              size="sm"
            >
              More Filters
            </Button>
          </div>
        </div>
      </div>
      
      {/* Client Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
              <ApperIcon name="Users" className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Clients</p>
              <p className="text-2xl font-bold text-gray-900">
                {clients.filter(c => c.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-success bg-opacity-10 rounded-lg flex items-center justify-center">
              <ApperIcon name="UserCheck" className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Sleep Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {clients.length > 0 
                  ? (Object.values(clientStats).reduce((sum, stat) => sum + parseFloat(stat.avgSleepScore || 0), 0) / clients.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
            <div className="w-12 h-12 bg-accent bg-opacity-10 rounded-lg flex items-center justify-center">
              <ApperIcon name="Moon" className="w-6 h-6 text-accent" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">+3</p>
            </div>
            <div className="w-12 h-12 bg-info bg-opacity-10 rounded-lg flex items-center justify-center">
              <ApperIcon name="TrendingUp" className="w-6 h-6 text-info" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Clients List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Client List ({filteredClients.length})
          </h3>
        </div>
        
        {filteredClients.length === 0 ? (
          <Empty
            title="No clients found"
            description={searchQuery 
              ? "No clients match your search criteria."
              : "You haven't added any clients yet. Start by adding your first client."
            }
            icon="Users"
            action={!searchQuery ? () => navigate('/clients/new') : undefined}
            actionLabel="Add First Client"
            showAction={!searchQuery}
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredClients.map((client) => {
              const stats = clientStats[client.Id] || {};
              
              return (
                <motion.div
                  key={client.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/clients/${client.Id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {client.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h4 className="font-medium text-gray-900">{client.name}</h4>
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
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Sleep Score</div>
                        <div className={`text-lg font-semibold ${getSleepScoreColor(stats.avgSleepScore)}`}>
                          {stats.avgSleepScore || '0.0'}/5
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Entries</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {stats.totalEntries || 0}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Streak</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {stats.currentStreak || 0} days
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Last Entry</div>
                        <div className="text-sm text-gray-900">
                          {stats.lastEntry 
                            ? format(parseISO(stats.lastEntry), 'MMM d')
                            : 'No entries'
                          }
                        </div>
                      </div>
                      
                      <ApperIcon name="ChevronRight" className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Clients;