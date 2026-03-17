import { Outlet } from "react-router-dom"
import Navbar from "../navbar/Navbar"


function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      
      <main className="flex-1 p-4 bg-gray-50">
        <Outlet />
      </main>
    </div>
  )
}
export default DashboardPage