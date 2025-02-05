import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, Crown, Clock, Zap, X, Wallet } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface Plan {
  name: string;
  price: number;
  features: string[];
  icon: React.ReactNode;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedPlan] = useState<string>('pro');
  const [showPlans, setShowPlans] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const handleConnectWallet = () => {
    // This would be replaced with actual wallet connection logic
    setIsWalletConnected(!isWalletConnected);
  };

  const plans: Plan[] = [
    {
      name: 'Basic',
      price: 10,
      features: ['100 messages/month', 'Basic LLM access', 'Email support'],
      icon: <Sparkles className="w-6 h-6" />,
    },
    {
      name: 'Pro',
      price: 29,
      features: ['Unlimited messages', 'Advanced LLM models', 'Priority support', 'Custom instructions'],
      icon: <Crown className="w-6 h-6" />,
    },
    {
      name: 'Enterprise',
      price: 99,
      features: ['Custom solutions', 'Dedicated support', 'API access', 'Advanced analytics'],
      icon: <Zap className="w-6 h-6" />,
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm a simulated AI response. In the actual implementation, this would be connected to your LLM API.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
      <header className="glass-effect">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Left side - Logo and Name */}
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-8 h-8 text-indigo-500 animate-float" />
              <h1 className="text-xl font-bold text-white">Nostril</h1>
            </div>

            {/* Right side - Wallet Button */}
            <button
              onClick={handleConnectWallet}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transform transition-all duration-300 hover:scale-105 active:scale-95 ${
                isWalletConnected
                  ? 'bg-green-600 text-white hover:bg-green-500'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>{isWalletConnected ? 'Connected' : 'Connect Wallet'}</span>
            </button>
          </div>

          {/* Bottom row - Credits and Upgrade */}
          <div className="flex justify-end items-center space-x-4 mt-4">
            <div className="text-sm text-gray-300 bg-gray-800 px-3 py-1 rounded-full transition-all duration-300 hover:scale-105">
              <Clock className="w-4 h-4 inline mr-1" />
              Credits: 850/1000
            </div>
            <button 
              onClick={() => setShowPlans(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-full font-medium transform transition-all duration-300 hover:scale-105 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/50 active:scale-95"
            >
              Upgrade Plan
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="glass-effect rounded-xl shadow-2xl h-[600px] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-slide-in`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 transform transition-all duration-300 hover:scale-[1.02] ${
                    message.isUser
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white'
                      : 'bg-gradient-to-r from-gray-800 to-gray-900 text-gray-100'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-75 mt-1 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="h-full flex items-center justify-center text-gray-400">
                <p className="animate-pulse">Start a conversation with the AI</p>
              </div>
            )}
            {isTyping && (
              <div className="flex justify-start animate-slide-in">
                <div className="bg-gray-800 rounded-2xl p-4 flex space-x-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
            <div className="flex space-x-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-full bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-300 pl-6"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-500 transform transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-lg hover:shadow-indigo-500/50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Subscription Plans Modal */}
      {showPlans && (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div 
            className="glass-effect rounded-xl max-w-2xl w-full p-6 relative transform transition-all duration-500 animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowPlans(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transform transition-all duration-300 hover:scale-110 hover:rotate-90"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Choose Your Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`p-6 rounded-xl transform transition-all duration-300 hover:scale-105 ${
                    selectedPlan === plan.name.toLowerCase()
                      ? 'border-2 border-indigo-500 bg-gray-900 animate-glow'
                      : 'border border-gray-800 bg-gray-900 hover:border-indigo-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="text-indigo-500 animate-float">
                        {plan.icon}
                      </div>
                      <h3 className="font-semibold text-white">{plan.name}</h3>
                    </div>
                    <span className="text-lg font-bold text-white">${plan.price}</span>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="text-sm text-gray-400 hover:text-gray-300 transition-colors duration-200">
                        • {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;