import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/hooks/useUser';
import messageService from '@/services/api/messageService';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import Button from '@/components/atoms/Button';
import SearchBar from '@/components/molecules/SearchBar';
import ApperIcon from '@/components/ApperIcon';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';

const Messages = () => {
  const { user } = useUser();
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  useEffect(() => {
    loadMessages();
  }, []);
  
  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await messageService.getAll();
      
      // Group messages by thread
      const threadMap = new Map();
      data.forEach(message => {
        if (!threadMap.has(message.threadId)) {
          threadMap.set(message.threadId, {
            id: message.threadId,
            messages: [],
            lastMessage: null,
            unreadCount: 0
          });
        }
        
        const thread = threadMap.get(message.threadId);
        thread.messages.push(message);
        
        if (!thread.lastMessage || new Date(message.timestamp) > new Date(thread.lastMessage.timestamp)) {
          thread.lastMessage = message;
        }
        
        if (!message.read && message.senderId !== user?.Id) {
          thread.unreadCount++;
        }
      });
      
      const threadList = Array.from(threadMap.values()).sort((a, b) => 
        new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
      );
      
      setThreads(threadList);
      
      if (threadList.length > 0 && !selectedThread) {
        setSelectedThread(threadList[0]);
        setMessages(threadList[0].messages);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleThreadSelect = (thread) => {
    setSelectedThread(thread);
    setMessages(thread.messages);
    
    // Mark messages as read
    thread.messages.forEach(message => {
      if (!message.read && message.senderId !== user?.Id) {
        messageService.update(message.Id, { read: true });
      }
    });
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    try {
      setSending(true);
      const messageData = {
        threadId: selectedThread?.id || `thread-${Date.now()}`,
        senderId: user?.Id,
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        read: false
      };
      
      await messageService.create(messageData);
      setNewMessage('');
      await loadMessages();
      
      // Auto-scroll to bottom
      setTimeout(() => {
        const messagesContainer = document.querySelector('.messages-container');
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 100);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };
  
  const getOtherParticipant = (thread) => {
    // In a real app, this would get the other participant's info
    return user?.role === 'coach' ? 'Client' : 'Dr. Sarah Wilson';
  };
  
  const filteredThreads = threads.filter(thread => 
    !searchQuery || 
    thread.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getOtherParticipant(thread).toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (loading) return <Loading type="dashboard" />;
  if (error) return <Error message={error} onRetry={loadMessages} />;
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">
            {user?.role === 'coach' 
              ? 'Communicate with your clients securely'
              : 'Communicate with your coach'
            }
          </p>
        </div>
        
        <Button
          icon="Plus"
          onClick={() => {
            // In a real app, this would open a new conversation modal
            toast.info('New conversation feature coming soon');
          }}
        >
          New Message
        </Button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-[600px] flex">
        {/* Threads List */}
        <div className="w-1/3 border-r border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <SearchBar
              placeholder="Search conversations..."
              onSearch={setSearchQuery}
              onClear={() => setSearchQuery('')}
            />
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredThreads.length === 0 ? (
              <Empty
                title="No conversations"
                description="Start a conversation to communicate securely."
                icon="MessageCircle"
                showAction={false}
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredThreads.map((thread) => (
                  <motion.div
                    key={thread.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedThread?.id === thread.id ? 'bg-primary bg-opacity-5' : ''
                    }`}
                    onClick={() => handleThreadSelect(thread)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {getOtherParticipant(thread).split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 truncate">
                            {getOtherParticipant(thread)}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {format(parseISO(thread.lastMessage.timestamp), 'MMM d')}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-gray-600 truncate">
                            {thread.lastMessage.content}
                          </p>
                          {thread.unreadCount > 0 && (
                            <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                              {thread.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 flex flex-col">
          {selectedThread ? (
            <>
              {/* Message Header */}
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {getOtherParticipant(selectedThread).split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {getOtherParticipant(selectedThread)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {user?.role === 'coach' ? 'Client' : 'Sleep Coach'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 messages-container">
                {messages.map((message) => (
                  <motion.div
                    key={message.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.senderId === user?.Id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      message.senderId === user?.Id
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId === user?.Id ? 'text-white opacity-75' : 'text-gray-500'
                      }`}>
                        {format(parseISO(message.timestamp), 'h:mm a')}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Message Input */}
              <div className="p-4 border-t border-gray-100">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      disabled={sending}
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    loading={sending}
                    disabled={sending || !newMessage.trim()}
                    icon="Send"
                  >
                    Send
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ApperIcon name="MessageCircle" className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;