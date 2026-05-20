// components/FloatingActions.jsx
import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Package, ShoppingBag } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"

const FloatingActions = () => {
  const { isDark } = useTheme()
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
      
      {/* ACTION BUTTONS */}
      <AnimatePresence>
        {open && (
          <>
            <ActionBtn
              to="/sell/add"
              label="Sell Item"
              icon={ShoppingBag}
              delay={0.05}
              isDark={isDark}
            />
            <ActionBtn
              to="/lost-found/add"
              label="Post Lost Item"
              icon={Package}
              delay={0.1}
              isDark={isDark}
            />
          </>
        )}
      </AnimatePresence>
 
      {/* MAIN FAB */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/40 flex items-center justify-center"
      >
        <motion.div animate={{ rotate: open ? 45 : 0 }}>
          <Plus size={26} />
        </motion.div>
      </motion.button>
    </div>
  )
}
 
export default FloatingActions
 
 
// ✅ Fully Clickable Action Button
const ActionBtn = ({ to, label, icon: Icon, delay, isDark }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.8 }}
      transition={{ delay }}
    >
      {/* WHOLE ROW CLICKABLE */}
      <Link
        to={to}
        className="flex items-center gap-3 group"
      >
        {/* Icon Square */}
        <div
          className={`
            w-11 h-11 rounded-xl shadow-lg flex items-center justify-center
            transition
            ${isDark
              ? "bg-gray-800 text-white group-hover:bg-gray-700"
              : "bg-white text-gray-700 group-hover:bg-gray-100"}
          `}
        >
          <Icon size={20} />
        </div>

        {/* Label */}
        <div
          className={`
            px-3 py-1.5 text-sm rounded-lg shadow-md whitespace-nowrap
            transition
            ${isDark 
              ? "bg-gray-800 text-white group-hover:bg-gray-700" 
              : "bg-white text-gray-700 group-hover:bg-gray-100"}
          `}
        >
          {label}
        </div>
      </Link>
    </motion.div>
  )
}