import Link from 'next/link'
import { ArrowRightIcon, SparklesIcon, AcademicCapIcon, ChatBubbleLeftRightIcon, PlayIcon, StarIcon, CodeBracketIcon, RocketLaunchIcon } from '@heroicons/react/24/outline'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="text-3xl group-hover:animate-bounce transition-all duration-300">🍱</div>
              <span className="text-xl font-bold text-gradient group-hover:text-lunchbox-primary transition-colors duration-300">Lunchbox AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 hover:bg-gray-100 rounded-lg">
                Sign In
              </Link>
              <Link href="/dashboard" className="px-6 py-2 bg-lunchbox-primary text-white font-medium rounded-lg hover:bg-green-600 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/25 hover:-translate-y-0.5">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-lunchbox-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-lunchbox-secondary/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-lunchbox-primary/10 text-lunchbox-primary text-sm font-medium mb-8 hover:bg-lunchbox-primary/20 transition-colors duration-200">
            <StarIcon className="w-4 h-4 mr-2" />
            Join 10,000+ students already using Lunchbox AI
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            Make productivity as fun as{' '}
            <span className="text-gradient bg-gradient-to-r from-lunchbox-primary to-lunchbox-secondary bg-clip-text text-transparent hover:from-green-600 hover:to-blue-600 transition-all duration-500">
              packing your lunchbox
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Lunchbox AI is your friendly productivity assistant that helps teens and young creators 
            manage tasks, study effectively, and stay motivated - all while keeping it fun and stress-free!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link href="/dashboard" className="group px-8 py-4 bg-lunchbox-primary text-white text-lg font-semibold rounded-xl hover:bg-green-600 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/25 hover:-translate-y-1 inline-flex items-center">
              Start Packing Your Lunchbox
              <ArrowRightIcon className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <Link href="/features" className="group px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-xl border-2 border-gray-200 hover:border-lunchbox-primary hover:text-lunchbox-primary transition-all duration-300 hover:shadow-lg hover:-translate-y-1 inline-flex items-center">
              <PlayIcon className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              Watch Demo
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center group">
              <div className="text-3xl font-bold text-lunchbox-primary group-hover:text-green-600 transition-colors duration-200">10K+</div>
              <div className="text-gray-600 font-medium">Active Users</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl font-bold text-lunchbox-secondary group-hover:text-blue-600 transition-colors duration-200">85%</div>
              <div className="text-gray-600 font-medium">Task Completion Rate</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl font-bold text-lunchbox-accent group-hover:text-pink-600 transition-colors duration-200">4.9★</div>
              <div className="text-gray-600 font-medium">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-lunchbox-primary/10 text-lunchbox-primary text-sm font-medium mb-6">
              <CodeBracketIcon className="w-4 h-4 mr-2" />
              Built for the next generation
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything you need to stay productive
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From task management to study help, Lunchbox AI has got you covered across all your favorite platforms.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Task Management */}
            <div className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-2 hover:border-lunchbox-primary/20">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-lunchbox-primary transition-colors duration-200">Smart Task Management</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Organize your tasks like a lunchbox - Sweet (fun), Veggies (learning), 
                Savory (important), and Sides (quick tasks).
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-lunchbox-sweet text-pink-800 rounded-full text-sm hover:bg-pink-200 transition-colors duration-200 cursor-default">🍰 Sweet</span>
                <span className="px-3 py-1 bg-lunchbox-veggies text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors duration-200 cursor-default">🥕 Veggies</span>
                <span className="px-3 py-1 bg-lunchbox-savory text-orange-800 rounded-full text-sm hover:bg-orange-200 transition-colors duration-200 cursor-default">🍖 Savory</span>
                <span className="px-3 py-1 bg-lunchbox-sides text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors duration-200 cursor-default">🍟 Sides</span>
              </div>
            </div>

            {/* AI Study Buddy */}
            <div className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-2 hover:border-lunchbox-secondary/20">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">🤖</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-lunchbox-secondary transition-colors duration-200">AI Study Buddy</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Get personalized study plans, practice questions, and learning paths 
                tailored to your needs and learning style.
              </p>
              <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg italic">
                "Help me with quadratic equations" → Structured learning path
              </div>
            </div>

            {/* Multi-Platform */}
            <div className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-2 hover:border-lunchbox-accent/20">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">🌐</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-lunchbox-accent transition-colors duration-200">Multi-Platform</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Access your lunchbox anywhere - Web dashboard, Discord bot, 
                and mobile app. Everything stays in sync!
              </p>
              <div className="flex justify-center space-x-6 text-3xl">
                <span className="hover:scale-125 transition-transform duration-200 cursor-default">💻</span>
                <span className="hover:scale-125 transition-transform duration-200 cursor-default">💬</span>
                <span className="hover:scale-125 transition-transform duration-200 cursor-default">📱</span>
              </div>
            </div>

            {/* Gamification */}
            <div className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-2 hover:border-lunchbox-primary/20">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">🎮</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-lunchbox-primary transition-colors duration-200">Gamified Experience</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Earn XP, unlock achievements, and maintain streaks. 
                Turn productivity into a fun, rewarding experience!
              </p>
              <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                Level up by completing tasks and studying
              </div>
            </div>

            {/* Discord Integration */}
            <div className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-2 hover:border-lunchbox-secondary/20">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-lunchbox-secondary transition-colors duration-200">Discord Integration</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Chat with your AI assistant in DMs, get reminders, 
                and manage tasks without leaving Discord.
              </p>
              <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg italic">
                "Remind me to study in 1 hour" → Done!
              </div>
            </div>

            {/* Customization */}
            <div className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-2 hover:border-lunchbox-accent/20">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">🎨</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-lunchbox-accent transition-colors duration-200">Fully Customizable</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Choose your lunchbox style, themes, fonts, and colors. 
                Make it uniquely yours!
              </p>
              <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                Bento, plate, or tray - you choose!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-lunchbox-primary via-green-600 to-lunchbox-secondary relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-8">
            <RocketLaunchIcon className="w-4 h-4 mr-2" />
            Join the productivity revolution
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
            Ready to pack your productivity lunchbox?
          </h2>
          
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of students and creators who are already using Lunchbox AI 
            to stay organized, motivated, and productive.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link href="/dashboard" className="group bg-white text-lunchbox-primary text-lg font-semibold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all duration-300 hover:shadow-xl hover:shadow-white/25 hover:-translate-y-1 inline-flex items-center justify-center">
              Start Free Today
              <ArrowRightIcon className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <Link href="/discord" className="group border-2 border-white text-white text-lg font-semibold px-8 py-4 rounded-xl hover:bg-white hover:text-lunchbox-primary transition-all duration-300 hover:shadow-lg hover:-translate-y-1 inline-flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              Join Discord Server
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center group">
              <div className="text-2xl font-bold text-white group-hover:text-yellow-300 transition-colors duration-200">100% Free</div>
              <div className="text-white/80 text-sm">No credit card required</div>
            </div>
            <div className="text-center group">
              <div className="text-2xl font-bold text-white group-hover:text-yellow-300 transition-colors duration-200">5 Min Setup</div>
              <div className="text-white/80 text-sm">Get started instantly</div>
            </div>
            <div className="text-center group">
              <div className="text-2xl font-bold text-white group-hover:text-yellow-300 transition-colors duration-200">24/7 Support</div>
              <div className="text-white/80 text-sm">We're here to help</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="text-3xl hover:animate-bounce transition-all duration-300 cursor-default">🍱</div>
                <span className="text-2xl font-bold text-gradient">Lunchbox AI</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
                Making productivity as fun as packing your favorite lunchbox. 
                Built for teens and young creators who want to stay organized without the stress.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 hover:scale-110 transform">
                  <span className="text-2xl">🐦</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 hover:scale-110 transform">
                  <span className="text-2xl">📘</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 hover:scale-110 transform">
                  <span className="text-2xl">📷</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 hover:scale-110 transform">
                  <span className="text-2xl">💬</span>
                </a>
              </div>
            </div>
            
            {/* Product */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Discord Bot</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Mobile App</a></li>
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Community</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-center md:text-left mb-4 md:mb-0">
                <p>&copy; 2024 Lunchbox AI. Making productivity fun!</p>
                <p className="text-sm mt-1">Built with ❤️ for students and creators</p>
              </div>
              <div className="flex space-x-6 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors duration-200">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors duration-200">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
