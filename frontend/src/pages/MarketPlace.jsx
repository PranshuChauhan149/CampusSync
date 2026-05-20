import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Tag,
  IndianRupee,
  User,
  ShoppingBag,
  Plus,
} from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { fetchMarketplaceItems } from "../servers/api"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"
 
const CATEGORIES = [
  "all",
  "books",
  "electronics",
  "accessories",
  "clothing",
  "stationery",
  "furniture",
  "other",
]
 
const MarketPlace = () => {
  const { isDark } = useTheme()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, loading } = useSelector((state) => state.marketplace)
  const [searchParams] = useSearchParams()
 
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [category, setCategory] = useState(searchParams.get("category") || "all")
 
  useEffect(() => {
    fetchMarketplaceItems(dispatch, { category: "all" })
  }, [dispatch])

  useEffect(() => {
    setSearch(searchParams.get("search") || "")
    setCategory(searchParams.get("category") || "all")
  }, [searchParams])
 
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMarketplaceItems(dispatch, {
        category: category !== "all" ? category : "",
        search,
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [category, search, dispatch])

  const filtered = items.filter((item) => {
    const matchSearch = item.title
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchCategory =
      category === "all" || item.category === category
    return matchSearch && matchCategory
  })

  return (
    <div
      className={`min-h-screen p-6 ${
        isDark
          ? "bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col gap-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <ShoppingBag
              className={isDark ? "w-6 h-6 md:w-7 md:h-7 text-blue-400" : "w-6 h-6 md:w-7 md:h-7 text-blue-500"}
            />
            Campus Marketplace
          </h1>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* SEARCH */}
            <div className="relative flex-1">
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  isDark ? "text-blue-300" : "text-slate-400"
                }`}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items..."
                className={`w-full pl-10 pr-4 py-2 rounded-lg border text-sm ${
                  isDark
                    ? "bg-slate-900 border-blue-500/20 text-white"
                    : "bg-white border-slate-300 text-slate-900"
                }`}
              />
            </div>

            {/* SELL */}
            <motion.button
              onClick={() => navigate("/sell/add")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg text-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              Sell Item
            </motion.button>
          </div>
        </div>

        {/* FILTER */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm border transition ${
                category === cat
                  ? "bg-blue-500/20 border-blue-400 text-blue-500"
                  : isDark
                  ? "border-blue-500/20 text-blue-200 hover:bg-white/5"
                  : "border-slate-300 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* GRID */}
        {loading ? (
          <div className={isDark ? "text-center text-blue-300/60 mt-20" : "text-center text-slate-500 mt-20"}>
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className={isDark ? "text-center text-blue-300/60 mt-20" : "text-center text-slate-500 mt-20"}>
            No items found
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item, i) => (
              <Link key={item._id} to={`/sell/${item._id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -6 }}
                  className={`rounded-2xl border overflow-hidden backdrop-blur-xl shadow cursor-pointer ${
                    isDark
                      ? "border-blue-500/20 bg-white/5"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  {/* IMAGE */}
                  <div className={isDark ? "h-48 bg-slate-800" : "h-48 bg-slate-100"}>
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={isDark ? "w-full h-full flex items-center justify-center text-blue-300/30" : "w-full h-full flex items-center justify-center text-slate-400"}>
                        <ShoppingBag className="w-16 h-16" />
                      </div>
                    )}
                  </div>

                  {/* BODY */}
                  <div className="p-4 space-y-3">
                    <h3 className={isDark ? "font-semibold text-white" : "font-semibold text-slate-900"}>
                      {item.title}
                    </h3>

                    <div className={isDark ? "flex items-center gap-1 text-xs text-blue-300/70" : "flex items-center gap-1 text-xs text-slate-500"}>
                      <Tag className="w-3.5 h-3.5" />
                      {item.category}
                    </div>

                    <div className="flex items-center gap-1 text-lg font-bold text-green-500">
                      <IndianRupee className="w-4 h-4" />
                      {item.price}
                    </div>

                    <div className={isDark ? "flex items-center gap-2 text-xs text-blue-200/70" : "flex items-center gap-2 text-xs text-slate-500"}>
                      <User className="w-3.5 h-3.5" />
                      {item.seller?.name}
                    </div>

                    <div className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium shadow text-center">
                      View Details
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MarketPlace