import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Leaf, Building2, Settings, ArrowRight } from 'lucide-react';

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8faf8] flex flex-col items-center justify-center p-6">
      <div className="mb-12 text-center">
        <div className="flex justify-center items-center gap-2 text-green-700 mb-6">
          <Leaf className="w-10 h-10" />
          <div>
            <h1 className="text-3xl font-bold leading-none">Kishan Seva</h1>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-green-200 text-green-700 text-sm font-medium mb-4 shadow-sm">
          Access Your Dashboard
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Choose <span className="text-green-700">Your Role</span> to Continue
        </h2>
        <p className="text-gray-500">Different access. A common goal — A stronger farming community.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full">
        {/* Farmer Card */}
        <Card className="p-8 border-2 border-green-100 hover:border-green-600 transition-colors cursor-pointer bg-gradient-to-br from-green-50 to-white shadow-sm hover:shadow-md group" onClick={() => navigate('/farmer/login')}>
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-green-100 text-green-700">
                <Leaf className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">I am a Farmer</h3>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-gray-600 mb-6">Book slots, track queue, monitor procurement and payments for your produce.</p>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 rounded-full bg-green-700 flex items-center justify-center text-white text-[10px]">✓</div>
              Register with mobile & Aadhaar
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 rounded-full bg-green-700 flex items-center justify-center text-white text-[10px]">✓</div>
              Manage crop details
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 rounded-full bg-green-700 flex items-center justify-center text-white text-[10px]">✓</div>
              Book procurement slots
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 rounded-full bg-green-700 flex items-center justify-center text-white text-[10px]">✓</div>
              Track live queue & payments
            </li>
          </ul>
        </Card>

        {/* Operator Card */}
        <Card className="p-8 border-2 border-blue-100 hover:border-blue-600 transition-colors cursor-pointer bg-gradient-to-br from-blue-50 to-white shadow-sm hover:shadow-md group" onClick={() => navigate('/operator/dashboard')}>
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-blue-100 text-blue-700">
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">I am a Procurement Operator</h3>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-gray-600 mb-6">Manage queue, process procurement, quality & weighing at your centre.</p>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 rounded-full bg-blue-700 flex items-center justify-center text-white text-[10px]">✓</div>
              Login with employee ID
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 rounded-full bg-blue-700 flex items-center justify-center text-white text-[10px]">✓</div>
              Manage live queue
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 rounded-full bg-blue-700 flex items-center justify-center text-white text-[10px]">✓</div>
              Record procurement & quality
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 rounded-full bg-blue-700 flex items-center justify-center text-white text-[10px]">✓</div>
              Update stock and generate reports
            </li>
          </ul>
        </Card>

        {/* Admin Card */}
        <Card className="p-8 border-2 border-purple-100 hover:border-purple-600 transition-colors cursor-pointer bg-gradient-to-br from-purple-50 to-white shadow-sm hover:shadow-md group" onClick={() => navigate('/admin/dashboard')}>
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-purple-100 text-purple-700">
                <Settings className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">I am an Admin</h3>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-700 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-gray-600 mb-6">Manage centres, slots, users and view analytics across all regions.</p>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 rounded-full bg-purple-700 flex items-center justify-center text-white text-[10px]">✓</div>
              Manage procurement centres
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 rounded-full bg-purple-700 flex items-center justify-center text-white text-[10px]">✓</div>
              Configure slots & policies
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 rounded-full bg-purple-700 flex items-center justify-center text-white text-[10px]">✓</div>
              Monitor users & operators
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 rounded-full bg-purple-700 flex items-center justify-center text-white text-[10px]">✓</div>
              View reports & analytics
            </li>
          </ul>
        </Card>
      </div>
      
      <div className="mt-12">
        <Link to="/" className="text-gray-500 hover:text-gray-800 text-sm flex items-center gap-2">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
