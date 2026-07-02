import { User } from '../types'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

interface NavbarProps {
  user: User | null
}

export default function Navbar({ user }: NavbarProps) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold text-blue-600">Stellar Orders</h1>
          <div className="flex gap-6">
            <a href="/dashboard" className="text-gray-700 hover:text-blue-600 transition">Dashboard</a>
            <a href="/create-order" className="text-gray-700 hover:text-blue-600 transition">New Order</a>
            <a href="/history" className="text-gray-700 hover:text-blue-600 transition">History</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-700">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="btn btn-primary"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
