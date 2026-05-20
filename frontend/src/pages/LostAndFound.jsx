import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { MapPin, CalendarDays, User, CheckCircle } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useSearchParams } from "react-router-dom"
import { fetchItems } from "../servers/api"
import { useTheme } from "../context/ThemeContext"
 
const LostAndFound = () => {
  const { isDark } = useTheme()
  const { userData } = useSelector((state) => state.user)
  const { itemData } = useSelector((state) => state.item)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
 
  const [filterType, setFilterType] = useState(searchParams.get("type") || "all")
  const [filterCategory, setFilterCategory] = useState(searchParams.get("category") || "all")
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
 
  useEffect(() => {
    fetchItems(dispatch)
  }, [dispatch])

  useEffect(() => {
    setFilterType(searchParams.get("type") || "all")
    setFilterCategory(searchParams.get("category") || "all")
    setSearchQuery(searchParams.get("search") || "")
  }, [searchParams])

  const filteredItems = itemData.filter((item) => {
    if (filterType !== "all" && item.type !== filterType) return false
    if (filterCategory !== "all" && item.category !== filterCategory) return false

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase()
      if (
        !item.title?.toLowerCase().includes(q) &&
        !item.description?.toLowerCase().includes(q) &&
        !item.postedBy?.name?.toLowerCase().includes(q)
      ) return false
    }
    return true
  })

  const handleClaim = (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(`/claim-item/${id}`)
  }

  return (
    <div
      className={`min-h-screen p-6 ${
        isDark
          ? "bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Campus <span className="text-blue-500">Lost & Found</span>
            </h1>
            <p className={isDark ? "text-blue-200/80 text-sm" : "text-slate-600 text-sm"}>
              Browse lost and found items across campus
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="search"
              placeholder="Search items, descriptions or users"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                isDark
                  ? "bg-slate-900 border-blue-500/20 text-blue-200"
                  : "bg-white border-slate-300 text-slate-700"
              }`}
            />

            <button
              onClick={() => navigate("/lost-found/add")}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow text-sm whitespace-nowrap"
            >
              + Add Item
            </button>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="max-w-7xl mx-auto flex flex-wrap gap-2 sm:gap-3 mb-8">
        {["all", "lost", "found"].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 sm:px-4 py-1.5 rounded-lg border text-xs sm:text-sm transition ${
              filterType === t
                ? "bg-blue-500/20 border-blue-400 text-blue-500"
                : isDark
                ? "border-blue-500/20 text-blue-200 hover:bg-white/5"
                : "border-slate-300 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {t === "all" ? "All" : t.toUpperCase()}
          </button>
        ))}

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={`px-3 py-1.5 rounded-lg border text-xs sm:text-sm ${
            isDark
              ? "bg-slate-900 border-blue-500/20 text-blue-200"
              : "bg-white border-slate-300 text-slate-700"
          }`}
        >
          <option value="all">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="books">Books</option>
          <option value="clothing">Clothing</option>
          <option value="documents">Documents</option>
          <option value="keys">Keys</option>
          <option value="wallet">Wallet</option>
          <option value="bag">Bag</option>
          <option value="mobile">Mobile</option>
          <option value="laptop">Laptop</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* ITEMS GRID */}
      <div className="max-w-7xl mx-auto grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item, i) => {
          const isOwner = item.postedBy?._id === userData?._id

          return (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/item/${item._id}`)}
              className={`relative rounded-2xl overflow-hidden border backdrop-blur-xl shadow cursor-pointer ${
                isDark
                  ? "border-blue-500/20 bg-gradient-to-br from-white/5 to-white/0"
                  : "border-slate-200 bg-white"
              }`}
            >
              {/* IMAGE */}
              <div className={isDark ? "h-48 bg-slate-900" : "h-48 bg-slate-100"}>
                {item.images?.[0] ? (
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    No Image
                  </div>
                )}
              </div>

              {/* TYPE */}
              <div
                className={`absolute top-3 right-3 px-3 py-1 text-xs font-semibold rounded-full shadow ${
                  item.type === "lost"
                    ? "bg-red-500 text-white"
                    : "bg-green-500 text-white"
                }`}
              >
                {item.type.toUpperCase()}
              </div>

              {/* CONTENT */}
              <div className="p-4 space-y-2">
                <h3 className={isDark ? "text-blue-100 font-semibold" : "text-slate-900 font-semibold"}>
                  {item.title}
                </h3>

                <p className={isDark ? "text-blue-200/80 text-sm" : "text-slate-600 text-sm"}>
                  {item.description}
                </p>

                <div className={isDark ? "flex items-center gap-2 text-xs text-blue-300/70" : "flex items-center gap-2 text-xs text-slate-500"}>
                  <MapPin className="w-3.5 h-3.5" />
                  {item.location}
                </div>

                <div className={isDark ? "flex items-center gap-2 text-xs text-blue-300/70" : "flex items-center gap-2 text-xs text-slate-500"}>
                  <CalendarDays className="w-3.5 h-3.5" />
                  {new Date(item.date).toLocaleDateString()}
                </div>

                <div className={isDark ? "flex items-center gap-2 text-xs text-blue-300/70" : "flex items-center gap-2 text-xs text-slate-500"}>
                  <User className="w-3.5 h-3.5" />
                  {item.postedBy?.name || "User"}
                </div>

                {!isOwner && item.status === "active" && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => handleClaim(e, item._id)}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium shadow"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Claim Item
                  </motion.button>
                )}

                {isOwner && (
                  <p className="text-xs text-blue-500 mt-2">
                    Your post
                  </p>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className={isDark ? "text-center text-blue-300/60 mt-16" : "text-center text-slate-500 mt-16"}>
          No items found
        </div>
      )}
    </div>
  )
}

export default LostAndFound