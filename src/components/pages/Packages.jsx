import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/hooks/useUser';
import packageService from '@/services/api/packageService';
import purchaseService from '@/services/api/purchaseService';
import paymentService from '@/services/api/paymentService';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import { toast } from 'react-toastify';
const Packages = () => {
  const { user } = useUser();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sessionsFilter, setSessionsFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [formData, setFormData] = useState({
    Name: '',
    description: '',
    price: '',
    includedSessions: '',
    resources: '',
    Tags: ''
  });
  const [purchaseFormData, setPurchaseFormData] = useState({
    paymentMethod: 'credit_card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    paypalEmail: '',
    bankAccount: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await packageService.getAll();
      setPackages(data);
    } catch (err) {
      setError('Failed to load packages. Please try again.');
      console.error('Error loading packages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePackage = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await packageService.create(formData);
      toast.success('Package created successfully');
      setShowCreateModal(false);
      setFormData({
        Name: '',
        description: '',
        price: '',
        includedSessions: '',
        resources: '',
        Tags: ''
      });
      loadPackages();
    } catch (err) {
      toast.error(err.message || 'Failed to create package');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPackage = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await packageService.update(selectedPackage.Id, formData);
      toast.success('Package updated successfully');
      setShowEditModal(false);
      setSelectedPackage(null);
      setFormData({
        Name: '',
        description: '',
        price: '',
        includedSessions: '',
        resources: '',
        Tags: ''
      });
      loadPackages();
    } catch (err) {
      toast.error(err.message || 'Failed to update package');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePackage = async (id) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    
    try {
      await packageService.delete(id);
      toast.success('Package deleted successfully');
      loadPackages();
    } catch (err) {
      toast.error(err.message || 'Failed to delete package');
    }
  };

  const handlePurchasePackage = async (e) => {
    e.preventDefault();
    setPurchasing(true);
    
    try {
      // Create purchase record
      const purchaseData = {
        Name: `Purchase - ${selectedPackage.Name}`,
        packageId: selectedPackage.Id,
        clientId: user.userId || 1, // Use actual user ID
        status: 'pending'
      };
      
      const purchase = await purchaseService.create(purchaseData);
      
      // Process payment
      const paymentResult = await paymentService.processPayment({
        purchaseId: purchase.Id,
        amount: selectedPackage.price,
        paymentMethod: purchaseFormData.paymentMethod
      });
      
      if (paymentResult.success) {
        // Update purchase status to completed
        await purchaseService.updateStatus(purchase.Id, 'completed');
        toast.success('Package purchased successfully!');
        setShowPurchaseModal(false);
        setPurchaseFormData({
          paymentMethod: 'credit_card',
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          paypalEmail: '',
          bankAccount: ''
        });
      } else {
        // Update purchase status to failed
        await purchaseService.updateStatus(purchase.Id, 'refunded');
        toast.error(paymentResult.message || 'Payment failed');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to purchase package');
    } finally {
      setPurchasing(false);
    }
  };

  const openEditModal = (pkg) => {
    setSelectedPackage(pkg);
    setFormData({
      Name: pkg.Name || '',
      description: pkg.description || '',
      price: pkg.price?.toString() || '',
      includedSessions: pkg.includedSessions?.toString() || '',
      resources: pkg.resources || '',
      Tags: pkg.Tags || ''
    });
    setShowEditModal(true);
  };

  const openPurchaseModal = (pkg) => {
    setSelectedPackage(pkg);
    setShowPurchaseModal(true);
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPrice = priceFilter === 'all' || 
                        (priceFilter === 'under100' && pkg.price < 100) ||
                        (priceFilter === '100to500' && pkg.price >= 100 && pkg.price <= 500) ||
                        (priceFilter === 'over500' && pkg.price > 500);
    
    const matchesSessions = sessionsFilter === 'all' ||
                           (sessionsFilter === '1to5' && pkg.includedSessions >= 1 && pkg.includedSessions <= 5) ||
                           (sessionsFilter === '6to10' && pkg.includedSessions >= 6 && pkg.includedSessions <= 10) ||
                           (sessionsFilter === 'over10' && pkg.includedSessions > 10);
    
    return matchesSearch && matchesPrice && matchesSessions;
  });

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadPackages} />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.role === 'coach' ? 'Package Management' : 'Coaching Packages'}
            </h1>
            <p className="text-gray-600 mt-2">
              {user?.role === 'coach' 
                ? 'Create and manage your coaching packages'
                : 'Choose the perfect coaching package for your sleep journey'
              }
            </p>
          </div>
          
          {user?.role === 'coach' && (
            <Button
              onClick={() => setShowCreateModal(true)}
              icon="Plus"
              className="w-full sm:w-auto"
            >
              Create Package
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <Input
            placeholder="Search packages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="Search"
          />
        </div>
        
        <select
          value={priceFilter}
          onChange={(e) => setPriceFilter(e.target.value)}
          className="form-select"
        >
          <option value="all">All Prices</option>
          <option value="under100">Under $100</option>
          <option value="100to500">$100 - $500</option>
          <option value="over500">Over $500</option>
        </select>
        
        <select
          value={sessionsFilter}
          onChange={(e) => setSessionsFilter(e.target.value)}
          className="form-select"
        >
          <option value="all">All Sessions</option>
          <option value="1to5">1-5 Sessions</option>
          <option value="6to10">6-10 Sessions</option>
          <option value="over10">10+ Sessions</option>
        </select>
      </div>

      {/* Packages Grid */}
      {filteredPackages.length === 0 ? (
        <Empty 
          message="No packages found" 
          description="Try adjusting your search or filters"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <motion.div
              key={pkg.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {pkg.Name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-3xl font-bold text-primary">
                      ${pkg.price}
                    </span>
                    <Badge variant="info">
                      {pkg.includedSessions} sessions
                    </Badge>
                  </div>
                </div>
                
                {user?.role === 'coach' && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="Edit"
                      onClick={() => openEditModal(pkg)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="Trash2"
                      onClick={() => handleDeletePackage(pkg.Id)}
                    />
                  </div>
                )}
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {pkg.description}
              </p>
              
              {pkg.resources && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Included Resources:
                  </h4>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {pkg.resources}
                  </p>
                </div>
              )}
              
              {pkg.Tags && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {pkg.Tags.split(',').map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              )}
              
              {user?.role !== 'coach' && (
                <Button
                  fullWidth
                  onClick={() => openPurchaseModal(pkg)}
                  icon="ShoppingCart"
                >
                  Purchase Package
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Package Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Create New Package
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  icon="X"
                  onClick={() => setShowCreateModal(false)}
                />
              </div>
              
              <form onSubmit={handleCreatePackage} className="space-y-4">
                <Input
                  label="Package Name"
                  value={formData.Name}
                  onChange={(e) => setFormData({...formData, Name: e.target.value})}
                  required
                />
                
                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Price ($)"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                  
                  <Input
                    label="Sessions Included"
                    type="number"
                    min="1"
                    value={formData.includedSessions}
                    onChange={(e) => setFormData({...formData, includedSessions: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Resources</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="List of included resources..."
                    value={formData.resources}
                    onChange={(e) => setFormData({...formData, resources: e.target.value})}
                  />
                </div>
                
                <Input
                  label="Tags (comma-separated)"
                  value={formData.Tags}
                  onChange={(e) => setFormData({...formData, Tags: e.target.value})}
                  placeholder="premium, popular, beginner"
                />
                
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    fullWidth
                    loading={submitting}
                  >
                    Create Package
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Package Modal */}
      {showEditModal && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Edit Package
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  icon="X"
                  onClick={() => setShowEditModal(false)}
                />
              </div>
              
              <form onSubmit={handleEditPackage} className="space-y-4">
                <Input
                  label="Package Name"
                  value={formData.Name}
                  onChange={(e) => setFormData({...formData, Name: e.target.value})}
                  required
                />
                
                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Price ($)"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                  
                  <Input
                    label="Sessions Included"
                    type="number"
                    min="1"
                    value={formData.includedSessions}
                    onChange={(e) => setFormData({...formData, includedSessions: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Resources</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="List of included resources..."
                    value={formData.resources}
                    onChange={(e) => setFormData({...formData, resources: e.target.value})}
                  />
                </div>
                
                <Input
                  label="Tags (comma-separated)"
                  value={formData.Tags}
                  onChange={(e) => setFormData({...formData, Tags: e.target.value})}
                  placeholder="premium, popular, beginner"
                />
                
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    fullWidth
                    loading={submitting}
                  >
                    Update Package
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Purchase Package Modal */}
      {showPurchaseModal && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Purchase Package
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  icon="X"
                  onClick={() => setShowPurchaseModal(false)}
                />
              </div>
              
              {/* Package Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {selectedPackage.Name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {selectedPackage.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {selectedPackage.includedSessions} sessions included
                  </span>
                  <span className="text-xl font-bold text-primary">
                    ${selectedPackage.price}
                  </span>
                </div>
              </div>
              
              <form onSubmit={handlePurchasePackage} className="space-y-4">
                <div>
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-select"
                    value={purchaseFormData.paymentMethod}
                    onChange={(e) => setPurchaseFormData({...purchaseFormData, paymentMethod: e.target.value})}
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
                
                {purchaseFormData.paymentMethod === 'credit_card' && (
                  <>
                    <Input
                      label="Card Number"
                      placeholder="1234 5678 9012 3456"
                      value={purchaseFormData.cardNumber}
                      onChange={(e) => setPurchaseFormData({...purchaseFormData, cardNumber: e.target.value})}
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Expiry Date"
                        placeholder="MM/YY"
                        value={purchaseFormData.expiryDate}
                        onChange={(e) => setPurchaseFormData({...purchaseFormData, expiryDate: e.target.value})}
                        required
                      />
                      <Input
                        label="CVV"
                        placeholder="123"
                        value={purchaseFormData.cvv}
                        onChange={(e) => setPurchaseFormData({...purchaseFormData, cvv: e.target.value})}
                        required
                      />
                    </div>
                  </>
                )}
                
                {purchaseFormData.paymentMethod === 'paypal' && (
                  <Input
                    label="PayPal Email"
                    type="email"
                    placeholder="your@email.com"
                    value={purchaseFormData.paypalEmail}
                    onChange={(e) => setPurchaseFormData({...purchaseFormData, paypalEmail: e.target.value})}
                    required
                  />
                )}
                
                {purchaseFormData.paymentMethod === 'bank_transfer' && (
                  <Input
                    label="Bank Account Number"
                    placeholder="Account number"
                    value={purchaseFormData.bankAccount}
                    onChange={(e) => setPurchaseFormData({...purchaseFormData, bankAccount: e.target.value})}
                    required
                  />
                )}
                
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    onClick={() => setShowPurchaseModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    fullWidth
                    loading={purchasing}
                    icon="CreditCard"
                  >
                    Purchase ${selectedPackage.price}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Packages;