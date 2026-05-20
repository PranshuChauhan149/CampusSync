import React, { useState } from "react"
import { motion } from "framer-motion"
import { UploadCloud, MapPin, CalendarDays, Tag, Image, Loader2 } from "lucide-react"
import axios from "axios"
import { serverUrl } from "../main"
import toast from "react-hot-toast"
import { useTheme } from "../context/ThemeContext"
import { useNavigate } from "react-router-dom"

/* ---------- TOGGLE ---------- */
const ToggleBtn = ({ active, label, color, onClick, isDark }) => {
  const base =
    "flex-1 py-2 px-4 rounded-lg border transition font-medium"

  const colors = {
    red: active
      ? "bg-red-500/20 border-red-500 text-red-400"
      : isDark
      ? "border-blue-500/20 text-blue-200/60"
      : "border-slate-300 text-slate-600",
    green: active
      ? "bg-green-500/20 border-green-500 text-green-400"
      : isDark
      ? "border-blue-500/20 text-blue-200/60"
      : "border-slate-300 text-slate-600",
  }

  return (
    <button type="button" onClick={onClick} className={`${base} ${colors[color]}`}>
      {label}
    </button>
  )
}

/* ---------- INPUT ---------- */
const Input = ({ label, value, onChange, placeholder, icon, required, type = "text", isDark }) => (
  <div>
    <label className={`text-sm ${isDark ? "text-blue-200" : "text-slate-600"}`}>
      {label} {required && "*"}
    </label>

    <div className="relative mt-1">
      {icon && (
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-blue-400" : "text-slate-500"}`}>
          {icon}
        </div>
      )}

      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full ${icon ? "pl-10" : ""} px-4 py-3 rounded-lg border outline-none transition
        ${
          isDark
            ? "bg-slate-900/70 border-blue-500/20 text-white focus:border-blue-400"
            : "bg-white border-slate-300 text-slate-900 focus:border-blue-500"
        }`}
      />
    </div>
  </div>
)

const AddItemForm = ({ loading, setLoading }) => {
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const [localLoading, setLocalLoading] = useState(false)
  const isLoading = loading ?? localLoading
  const setLoadingState = setLoading ?? setLocalLoading

  const [type, setType] = useState("lost")
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [location, setLocation] = useState("")
  const [date, setDate] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)

  const CATEGORIES = [
    { value: "electronics", label: "Electronics" },
    { value: "books", label: "Books" },
    { value: "clothing", label: "Clothing" },
    { value: "accessories", label: "Accessories" },
    { value: "documents", label: "Documents" },
    { value: "keys", label: "Keys" },
    { value: "wallet", label: "Wallet" },
    { value: "bag", label: "Bag" },
    { value: "id_cards", label: "ID Cards" },
    { value: "mobile", label: "Mobile" },
    { value: "laptop", label: "Laptop" },
    { value: "pets", label: "Pets" },
    { value: "jewelry", label: "Jewelry" },
    { value: "vehicles", label: "Vehicles" },
    { value: "other", label: "Other" },
  ]

  /* ---------- IMAGE ---------- */
  const handleImage = (file) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file")
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB")
      return
    }

    setImage(file)

    // Create preview using URL.createObjectURL
    try {
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)

      // Cleanup function to revoke URL when component unmounts or new file is selected
      return () => URL.revokeObjectURL(objectUrl)
    } catch (error) {
      console.error("Error creating preview:", error)
      toast.error("Failed to create image preview")
    }
  }

  /* ---------- RESET ---------- */
  const resetForm = () => {
    setType("lost")
    setTitle("")
    setCategory("")
    setLocation("")
    setDate("")
    setDescription("")
    setImage(null)
    setPreview(null)
  }

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title || !category || !location || !date) {
      toast.error("Please fill required fields")
      return
    }

    try {
      setLoadingState(true)

      const formData = new FormData()
      formData.append("type", type)
      formData.append("title", title)
      formData.append("category", category)
      formData.append("location", location)
      formData.append("date", date)
      formData.append("description", description || "No description provided.")
      if (image) formData.append("image", image)

      await axios.post(`${serverUrl}/api/item/add`, formData, {
        withCredentials: true,
      })

      toast.success("Item posted successfully 🎉")
      resetForm()
      navigate("/lost-found")
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to post item")
    } finally {
      setLoadingState(false)
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className={`max-w-3xl mt-6 sm:mt-10 mb-6 sm:mb-10 mx-4 sm:mx-auto p-4 sm:p-6 md:p-8 rounded-2xl border shadow-2xl space-y-5 sm:space-y-6 relative
      ${
        isDark
          ? "bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 border-blue-500/20 text-white"
          : "bg-white border-slate-200 text-slate-900"
      }`}
    >
      {/* HEADER */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
          Post <span className="text-blue-500">Lost / Found</span> Item
        </h2>
        <p className={isDark ? "text-blue-200/80 text-xs sm:text-sm" : "text-slate-600 text-xs sm:text-sm"}>
          Help students recover belongings across campus
        </p>
      </div>

      {/* TYPE */}
      <div className="flex gap-2 sm:gap-3">
        <ToggleBtn active={type === "lost"} label="Lost Item" color="red" onClick={() => setType("lost")} isDark={isDark} />
        <ToggleBtn active={type === "found"} label="Found Item" color="green" onClick={() => setType("found")} isDark={isDark} />
      </div>

      {/* TITLE */}
      <Input label="Item Title" value={title} onChange={setTitle} placeholder="e.g. Black Backpack" required isDark={isDark} />

      {/* DESCRIPTION */}
      <div>
        <label className={`text-sm ${isDark ? "text-blue-200" : "text-slate-600"}`}>
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Details about the item..."
          className={`w-full mt-1 px-4 py-3 rounded-lg border outline-none transition
          ${
            isDark
              ? "bg-slate-900/70 border-blue-500/20 text-white focus:border-blue-400"
              : "bg-white border-slate-300 text-slate-900 focus:border-blue-500"
          }`}
        />
      </div>

      {/* CATEGORY */}
      <div>
        <label className={`text-sm ${isDark ? "text-blue-200" : "text-slate-600"}`}>
          Category *
        </label>

        <div className="relative mt-1">
          <Tag className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-blue-400" : "text-slate-500"}`} />

          <select
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`w-full pl-10 px-4 py-3 rounded-lg border outline-none
            ${
              isDark
                ? "bg-slate-900/70 border-blue-500/20 text-white"
                : "bg-white border-slate-300 text-slate-900"
            }`}
          >
            <option value="">Select category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* LOCATION */}
      <Input label="Location" value={location} onChange={setLocation} placeholder="Where lost/found?" icon={<MapPin size={16} />} required isDark={isDark} />

      {/* DATE */}
      <Input label="Date" type="date" value={date} onChange={setDate} icon={<CalendarDays size={16} />} required isDark={isDark} />

      {/* IMAGE */}
      <div>
        <label className={`text-sm ${isDark ? "text-blue-200" : "text-slate-600"}`}>
          Upload Image
        </label>

        <label
          className={`relative mt-2 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition
          ${
            isDark
              ? "border-blue-500/30 hover:border-blue-400"
              : "border-slate-300 hover:border-blue-500"
          }`}
        >
          <UploadCloud className={isDark ? "text-blue-400 mb-2" : "text-slate-500 mb-2"} />
          <span className={isDark ? "text-blue-200 text-sm" : "text-slate-600 text-sm"}>
            Click to upload image
          </span>

          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            className="hidden" 
            onChange={(e) => handleImage(e.target.files?.[0])} 
          />
        </label>

        {preview && (
          <div className="mt-3">
            <img src={preview} alt="preview" className="w-full h-48 object-cover rounded-xl border border-blue-500/20" />
          </div>
        )}
      </div>

      {/* SUBMIT */}
      <motion.button
        whileHover={{ scale: isLoading ? 1 : 1.03 }}
        whileTap={{ scale: isLoading ? 1 : 0.97 }}
        disabled={isLoading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm sm:text-base font-semibold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isLoading && <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />}
        {isLoading ? "Posting..." : "Post Item"}
      </motion.button>
    </motion.form>
  )
}

export default AddItemForm