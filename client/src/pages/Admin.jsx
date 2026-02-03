import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { adminAPI } from "../services/api";
import Navbar from "../components/Navbar";
import {
  Users,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Zap,
  TrendingUp,
  BookOpen,
  AlertCircle,
} from "lucide-react";

const Admin = () => {
  const { isDark } = useContext(ThemeContext);
  const [stats, setStats] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedClaim, setSelectedClaim] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, claimsRes] = await Promise.all([
        adminAPI.getAdminStats(),
        adminAPI.getAllClaims(),
      ]);

      setStats(statsRes.data.stats);
      setClaims(claimsRes.data.data || []);
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError(err.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={isDark ? "bg-gray-900 text-white" : "bg-gray-50"}>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="flex flex-col items-center gap-4">
            <Zap className="animate-spin text-blue-500" size={40} />
            <p>Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={isDark ? "bg-gray-900 text-white" : "bg-gray-50"}>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="flex items-center gap-3 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-4">
            <AlertCircle className="text-red-500" />
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: "0 20px 25px -5 rgba(0, 0, 0, 0.1)" }}
      className={`
        rounded-lg p-6 flex items-start justify-between
        ${
          isDark
            ? "bg-gray-800 hover:bg-gray-700"
            : "bg-white hover:bg-gray-50"
        }
        border ${isDark ? "border-gray-700" : "border-gray-200"}
        transition-all duration-300 cursor-pointer
      `}
    >
      <div>
        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          {title}
        </p>
        <p className="text-3xl font-bold mt-2">{value}</p>
        {subtext && (
          <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
            {subtext}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </motion.div>
  );

  const ClaimCard = ({ claim, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() =>
        setSelectedClaim(selectedClaim?.id === claim._id ? null : claim)
      }
      className={`
        rounded-lg p-4 cursor-pointer transition-all duration-300
        ${
          isDark
            ? "bg-gray-800 hover:bg-gray-700 border-gray-700"
            : "bg-white hover:bg-gray-50 border-gray-200"
        }
        border
      `}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h4 className="font-semibold text-lg">
              {claim.item?.title || "Unknown Item"}
            </h4>
            <span
              className={`
              text-xs px-2 py-1 rounded-full font-medium
              ${
                claim.status === "pending"
                  ? "bg-yellow-900 bg-opacity-30 text-yellow-400"
                  : claim.status === "approved"
                    ? "bg-green-900 bg-opacity-30 text-green-400"
                    : claim.status === "claimed"
                      ? "bg-blue-900 bg-opacity-30 text-blue-400"
                      : "bg-red-900 bg-opacity-30 text-red-400"
              }
            `}
            >
              {claim.status?.toUpperCase()}
            </span>
          </div>
          <p className={`text-sm mt-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Claimant: <span className="font-medium">{claim.claimant?.name}</span>
          </p>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Item Owner: <span className="font-medium">{claim.item?.reportedBy?.name}</span>
          </p>
          <p className={`text-xs mt-2 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
            Created: {new Date(claim.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {selectedClaim?._id === claim._id && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-700"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-blue-400">ITEM DETAILS</p>
                <p className={`text-sm mt-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <span className="font-medium">Category:</span> {claim.item?.category}
                </p>
                <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <span className="font-medium">Location:</span> {claim.item?.location}
                </p>
                <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(claim.item?.date).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-purple-400">CLAIM DETAILS</p>
                <p className={`text-sm mt-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <span className="font-medium">Email:</span> {claim.claimant?.email}
                </p>
                <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <span className="font-medium">Match Score:</span>{" "}
                  {claim.matchScore || "N/A"}%
                </p>
                <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <span className="font-medium">Contact:</span> {claim.contactInfo}
                </p>
              </div>
            </div>

            {claim.details && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-indigo-400">CLAIM DETAILS</p>
                <p className={`text-sm mt-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  {claim.details}
                </p>
              </div>
            )}

            {claim.images && claim.images.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-pink-400">PROOF IMAGES</p>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {claim.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Proof ${idx + 1}`}
                      className="h-20 w-20 object-cover rounded border border-gray-600"
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className={isDark ? "bg-gray-900 text-white" : "bg-gray-50"}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p
            className={`text-sm ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Complete system overview and management
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-700 overflow-x-auto">
          {["dashboard", "claims"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-3 font-medium transition-all duration-300 whitespace-nowrap
                ${
                  activeTab === tab
                    ? `border-b-2 border-blue-500 ${
                        isDark ? "text-blue-400" : "text-blue-600"
                      }`
                    : isDark
                      ? "text-gray-400"
                      : "text-gray-600"
                }
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <StatCard
                title="Total Users"
                value={stats?.totalUsers || 0}
                icon={Users}
                color="bg-blue-500"
                subtext="All registered users"
              />
              <StatCard
                title="Active Users"
                value={stats?.activeUsers || 0}
                icon={TrendingUp}
                color="bg-green-500"
                subtext="Verified accounts"
              />
              <StatCard
                title="Total Items"
                value={stats?.totalItems || 0}
                icon={Package}
                color="bg-purple-500"
                subtext="Lost & found items"
              />
              <StatCard
                title="Total Books"
                value={stats?.totalBooks || 0}
                icon={BookOpen}
                color="bg-indigo-500"
                subtext="Listed books"
              />
              <StatCard
                title="Total Claims"
                value={stats?.totalClaims || 0}
                icon={AlertCircle}
                color="bg-orange-500"
                subtext="All claim requests"
              />
            </div>

            {/* Claims Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                title="Pending Claims"
                value={stats?.pendingClaims || 0}
                icon={Clock}
                color="bg-yellow-500"
                subtext="Awaiting approval"
              />
              <StatCard
                title="Approved Claims"
                value={stats?.approvedClaims || 0}
                icon={CheckCircle}
                color="bg-green-500"
                subtext="Owner verified"
              />
              <StatCard
                title="Rejected Claims"
                value={stats?.rejectedClaims || 0}
                icon={XCircle}
                color="bg-red-500"
                subtext="Not verified"
              />
              <StatCard
                title="Claimed Items"
                value={stats?.claimedItems || 0}
                icon={Zap}
                color="bg-blue-500"
                subtext="Successfully recovered"
              />
            </div>
          </motion.div>
        )}

        {/* Claims Tab */}
        {activeTab === "claims" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mb-4">
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Total Claims: <span className="font-bold text-lg">{claims.length}</span>
              </p>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {claims.length > 0 ? (
                claims.map((claim, idx) => (
                  <ClaimCard key={claim._id} claim={claim} index={idx} />
                ))
              ) : (
                <div
                  className={`
                  rounded-lg p-8 text-center
                  ${isDark ? "bg-gray-800" : "bg-white"}
                  border ${isDark ? "border-gray-700" : "border-gray-200"}
                `}
                >
                  <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                    No claims found
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Admin;
