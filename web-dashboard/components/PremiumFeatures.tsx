'use client'

import { useState, useEffect } from 'react'

interface SubscriptionStatus {
  isPremium: boolean
  plan: string
  expiresAt: string | null
  features: string[]
}

interface UsageStats {
  tasksToday: number
  aiMessagesToday: number
  calendarExportsThisMonth: number
  totalTasks: number
}

interface PricingPlan {
  name: string
  price: number
  period?: string
  features: string[]
  popular?: boolean
}

export default function PremiumFeatures() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [usage, setUsage] = useState<UsageStats | null>(null)
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [showUpgrade, setShowUpgrade] = useState(false)

  useEffect(() => {
    fetchSubscriptionStatus()
    fetchUsageStats()
    fetchPricingPlans()
  }, [])

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/subscription?action=status')
      if (response.ok) {
        const data = await response.json()
        setSubscription(data)
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error)
    }
  }

  const fetchUsageStats = async () => {
    try {
      const response = await fetch('/api/subscription?action=usage')
      if (response.ok) {
        const data = await response.json()
        setUsage(data)
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error)
    }
  }

  const fetchPricingPlans = async () => {
    try {
      const response = await fetch('/api/subscription?action=plans')
      if (response.ok) {
        const data = await response.json()
        setPlans(Object.values(data))
      }
    } catch (error) {
      console.error('Error fetching pricing plans:', error)
    }
  }

  const handleUpgrade = async (planName: string) => {
    try {
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'upgrade', plan: planName }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        fetchSubscriptionStatus()
        setShowUpgrade(false)
      } else {
        alert('Failed to upgrade subscription')
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error)
      alert('Failed to upgrade subscription')
    }
  }

  if (!subscription || !usage) {
    return <div>Loading subscription info...</div>
  }

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-2xl border border-orange-200/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Subscription Status</h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${
            subscription.isPremium 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-gray-100 text-gray-700 border border-gray-200'
          }`}>
            {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
          </div>
        </div>
        
        {subscription.isPremium && subscription.expiresAt && (
          <p className="text-sm text-gray-600 mb-4">
            Expires: {new Date(subscription.expiresAt).toLocaleDateString()}
          </p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{usage.tasksToday}</div>
            <div className="text-sm text-gray-600">Tasks Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{usage.aiMessagesToday}</div>
            <div className="text-sm text-gray-600">AI Messages</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{usage.calendarExportsThisMonth}</div>
            <div className="text-sm text-gray-600">Calendar Exports</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{usage.totalTasks}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-2xl border border-orange-200/50 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {subscription.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Section */}
      {!subscription.isPremium && (
        <div className="bg-gradient-to-r from-orange-100 to-orange-200 backdrop-blur-sm rounded-xl border border-orange-300 p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Unlock Premium Features</h3>
            <p className="text-gray-700 mb-4">
              Get unlimited access to all features and priority support
            </p>
            <button
              onClick={() => setShowUpgrade(true)}
              className="bg-orange-500/80 hover:bg-orange-500 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105"
            >
              View Plans
            </button>
          </div>
        </div>
      )}

      {/* Pricing Plans Modal */}
      {showUpgrade && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-xl rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-orange-200/50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Choose Your Plan</h2>
                <button
                  onClick={() => setShowUpgrade(false)}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan, index) => (
                  <div
                    key={index}
                    className={`relative border rounded-xl p-6 backdrop-blur-sm transition-all duration-200 hover:scale-105 ${
                      plan.popular 
                        ? 'border-orange-500/50 bg-orange-50 shadow-lg' 
                        : 'border-orange-200/50 bg-white/50'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-orange-500/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">{plan.name}</h3>
                      <div className="mt-2">
                        <span className="text-3xl font-bold text-gray-800">${plan.price}</span>
                        {plan.period && (
                          <span className="text-gray-600">/{plan.period}</span>
                        )}
                      </div>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleUpgrade(plan.name.toLowerCase())}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 hover:shadow-lg ${
                        plan.popular
                          ? 'bg-orange-500/80 hover:bg-orange-500 text-white hover:scale-105'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-800 hover:scale-105'
                      }`}
                    >
                      {plan.price === 0 ? 'Current Plan' : `Upgrade to ${plan.name}`}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
