import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Leaf, Clock, ShieldCheck, Banknote, Users, Building2, CalendarCheck, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8faf8]">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b">
        <div className="flex items-center gap-2 text-green-700">
          <Leaf className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold leading-none">Kishan Seva</h1>
            <p className="text-[10px] text-gray-500 font-medium tracking-wide">Smart Agriculture for a Better Tomorrow</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <a href="#" className="text-green-700 border-b-2 border-green-700 pb-1">Home</a>
          <a href="#" className="hover:text-green-700 transition-colors">About</a>
          <a href="#" className="hover:text-green-700 transition-colors">Services</a>
          <a href="#" className="hover:text-green-700 transition-colors">Procurement Centres</a>
          <a href="#" className="hover:text-green-700 transition-colors">How It Works</a>
          <a href="#" className="hover:text-green-700 transition-colors">Impact</a>
          <a href="#" className="hover:text-green-700 transition-colors">Contact</a>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="hidden sm:flex rounded-full">
            English
          </Button>
          <Link to="/roles">
            <Button className="bg-green-700 hover:bg-green-800 rounded-full px-6">
              Login / Sign Up
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <div className="relative pt-16 pb-20 px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold mb-6">
              <Leaf className="w-4 h-4" />
              Government Supported | Farmer Friendly
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
              Empowering Farmers, <br/>
              <span className="text-green-700">Strengthening Bharat</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-xl leading-relaxed">
              Smart Agricultural Procurement & Queue Management Platform. Know where to go, when to go, your queue position, procurement status and payment status — without unnecessary waiting.
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/roles">
                <Button className="bg-green-700 hover:bg-green-800 text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all">
                  Get Started →
                </Button>
              </Link>
              <Button variant="outline" className="text-lg px-8 py-6 rounded-full border-green-700 text-green-700 hover:bg-green-50">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Watch Video
              </Button>
            </div>
          </div>
          
          {/* Decorative background elements */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 pointer-events-none">
             {/* Using CSS gradient to mock the agricultural illustration */}
             <div className="absolute inset-0 bg-gradient-to-bl from-green-400 to-transparent rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/4"></div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="bg-white border-y py-6 px-6 sm:px-12 lg:px-24">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full text-green-700"><Banknote className="w-5 h-5"/></div>
              <span className="font-medium text-gray-700">Fair Prices</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full text-green-700"><Clock className="w-5 h-5"/></div>
              <span className="font-medium text-gray-700">Less Waiting</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full text-green-700"><ShieldCheck className="w-5 h-5"/></div>
              <span className="font-medium text-gray-700">Transparent Process</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full text-green-700"><Banknote className="w-5 h-5"/></div>
              <span className="font-medium text-gray-700">Direct Payments</span>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-12 px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto w-full">
          <div className="bg-white rounded-2xl shadow-sm border p-8 flex flex-wrap gap-8 justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-xl text-green-700">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">10L+</h3>
                <p className="text-gray-500 text-sm">Farmers</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-xl text-green-700">
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">1,200+</h3>
                <p className="text-gray-500 text-sm">Procurement Centres</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-xl text-green-700">
                <CalendarCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">50+</h3>
                <p className="text-gray-500 text-sm">Crops Supported</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-xl text-green-700">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">100%</h3>
                <p className="text-gray-500 text-sm">Transparent & Digital</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
