import React, { useState } from "react"
import { motion } from "framer-motion"
import {
  UploadCloud,
  Tag,
  IndianRupee,
  Info,
  Package,
  MapPin,
} from "lucide-react"
import axios from "axios"
import { serverUrl } from "../main"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { useTheme } from "../context/ThemeContext"

const CATEGORIES = [
  "books",
  "electronics",
  "accessories",
  "clothing",
  "stationery",
  "furniture",
  "other",
]

const CONDITIONS = ["new", "like_new", "good", "fair"]

const AddSellItem = () => {
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [condition, setCondition] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)

  /* ---------- COLORS ---------- */
  const pageBg = isDark
    ? "bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white"
    : "bg-gradient-to-br from-white via-blue-50 to-white text-slate-900"

  const cardBg = isDark
    ? "bg-white/5 border-blue-500/20"
    : "bg-white border-slate-200"

  const labelColor = isDark ? "text-slate-300" : "text-slate-600"
  const inputBg = isDark
    ? "bg-slate-900/70 border-blue-500/20 text-white placeholder:text-slate-400"
    : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"

  /* ---------- IMAGE ---------- */
  const handleImages = (files) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)

    // Validate all files
    const validFiles = fileArray.filter((file) => {
      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not a valid image file`)
        return false
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`)
        return false
      }

      return true
    })

    if (validFiles.length === 0) return

    setImages(validFiles)

    // Create previews with error handling
    try {
      const previewUrls = validFiles.map((f) => {
        const url = URL.createObjectURL(f)
        return url
      })
      setPreviews(previewUrls)
    } catch (error) {
      console.error("Error creating image previews:", error)
      toast.error("Failed to create image previews")
    }
  }

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title || !price || !category) return

    try {
      setLoading(true)
      const formData = new FormData()

      formData.append("title", title)
      formData.append("price", price)
      formData.append("category", category)
      formData.append("condition", condition || "good")
      formData.append("description", description || "No description provided.")
      formData.append("location", location || "Campus")

      images.forEach((img) => formData.append("images", img))

      await axios.post(`${serverUrl}/api/marketplace/create`, formData, {
        withCredentials: true,
      })

      toast.success("Item posted successfully!")

      setTitle("")
      setPrice("")
      setCategory("")
      setCondition("")
      setDescription("")
      setLocation("")
      setImages([])
      setPreviews([])

      setTimeout(() => navigate("/sell"), 1200)
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post item")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen p-6 ${pageBg}`}>
      <div className="max-w-3xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="w-7 h-7 text-blue-500" />
            Sell an Item
          </h1>
          <p className={labelColor}>
            Post items for sale in campus marketplace
          </p>
        </div>

        {/* FORM */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className={`space-y-6 p-6 rounded-2xl border backdrop-blur-xl shadow-xl ${cardBg}`}
        >
          <Input
            label="Item Title"
            icon={<Tag size={16} />}
            value={title}
            onChange={setTitle}
            placeholder="e.g. Engineering Drawing Kit"
            required
            isDark={isDark}
          />

          <Input
            label="Price"
            icon={<IndianRupee size={16} />}
            value={price}
            onChange={setPrice}
            type="number"
            placeholder="Enter price"
            required
            isDark={isDark}
          />

          <Select
            label="Category"
            value={category}
            onChange={setCategory}
            options={CATEGORIES}
            icon={<Tag size={16} />}
            required
            isDark={isDark}
          />

          <Select
            label="Condition"
            value={condition}
            onChange={setCondition}
            options={CONDITIONS}
            icon={<Info size={16} />}
            isDark={isDark}
          />

          {/* DESCRIPTION */}
          <div>
            <label className={`text-sm ${labelColor}`}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Item details..."
              className={`w-full mt-1 px-4 py-3 rounded-lg border ${inputBg}`}
            />
          </div>

          <Input
            label="Location"
            icon={<MapPin size={16} />}
            value={location}
            onChange={setLocation}
            placeholder="e.g. Hostel Block A"
            isDark={isDark}
          />

          {/* IMAGES */}
          <div>
            <label className={`text-sm ${labelColor}`}>Images</label>

            <label
              className={`mt-2 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition ${
                isDark
                  ? "border-blue-500/30 hover:border-blue-400"
                  : "border-slate-300 hover:border-blue-400"
              }`}
            >
              <UploadCloud className="text-blue-500 mb-2" />
              <span className={`text-sm ${labelColor}`}>
                Upload item images
              </span>

              <input
                type="file"
                multiple
                accept="image/*"                capture="environment"                className="hidden"
                onChange={(e) => handleImages(e.target.files)}
              />
            </label>

            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {previews.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className={`h-24 w-full object-cover rounded-lg border ${
                      isDark ? "border-blue-500/20" : "border-slate-200"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* SUBMIT */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-lg"
          >
            {loading ? "Posting..." : "Post Item"}
          </motion.button>
        </motion.form>
      </div>
    </div>
  )
}

export default AddSellItem

/* ---------- INPUT ---------- */
const Input = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  required,
  isDark,
}) => {
  const labelColor = isDark ? "text-slate-300" : "text-slate-600"
  const inputBg = isDark
    ? "bg-slate-900/70 border-blue-500/20 text-white"
    : "bg-white border-slate-300 text-slate-900"

  return (
    <div>
      <label className={`text-sm ${labelColor}`}>
        {label} {required && "*"}
      </label>
      <div className="relative mt-1">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500">
            {icon}
          </div>
        )}
        <input
          required={required}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-lg border ${inputBg} ${
            icon ? "pl-10" : ""
          }`}
        />
      </div>
    </div>
  )
}

/* ---------- SELECT ---------- */
const Select = ({
  label,
  value,
  onChange,
  options,
  icon,
  required,
  isDark,
}) => {
  const labelColor = isDark ? "text-slate-300" : "text-slate-600"
  const inputBg = isDark
    ? "bg-slate-900/70 border-blue-500/20 text-white"
    : "bg-white border-slate-300 text-slate-900"

  return (
    <div>
      <label className={`text-sm ${labelColor}`}>
        {label} {required && "*"}
      </label>
      <div className="relative mt-1">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500">
            {icon}
          </div>
        )}
        <select
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full pl-10 px-4 py-3 rounded-lg border ${inputBg}`}
        >
          <option value="">Select</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o.replace("_", " ").toUpperCase()}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}