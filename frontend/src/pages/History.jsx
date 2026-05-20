import React, { useEffect, useState } from "react"
import axios from "axios"
import { serverUrl } from "../main"
import { motion, AnimatePresence } from "framer-motion"
import {
  Menu,
  X,
  Calendar,
  FileText,
  ChevronRight,
  GitBranch,
  BarChart3,
  Zap,
} from "lucide-react"
import FinalResult from "../components/FinalResult"
import { useTheme } from "../context/ThemeContext"

const History = () => {
  const { isDark } = useTheme()

  const [notes, setNotes] = useState([])
  const [activeNote, setActiveNote] = useState(null)
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
  const [loadingNote, setLoadingNote] = useState(false)

  /* ---------- FETCH ---------- */
  const myNotes = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/notes/getnotes?t=${Date.now()}`, {
        withCredentials: true,
      })
      setNotes(res.data.notes || [])
    } catch (e) {
      console.error(e)
    }
  }

  const fetchSingleNote = async (id) => {
    try {
      setLoadingNote(true)
      const res = await axios.get(`${serverUrl}/api/notes/${id}`, {
        withCredentials: true,
      })
      setActiveNote({ ...res.data, _id: id })
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingNote(false)
    }
  }

  useEffect(() => {
    myNotes()
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener("resize", handleResize)
    
    // Listen for custom voice action event to force open a note
    const handleOpenNote = (e) => {
      if (e.detail) {
        setActiveNote(e.detail)
        closeMenuIfMobile()
      }
    }
    window.addEventListener("cs-open-note", handleOpenNote)
    
    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("cs-open-note", handleOpenNote)
    }
  }, [])

  const closeMenuIfMobile = () => {
    if (isMobile) setOpen(false)
  }

  /* ---------- COLORS ---------- */

  const pageBg = isDark
    ? "bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950"
    : "bg-gradient-to-br from-white via-blue-50 to-white"

  const sidebarBg = isDark
    ? "bg-slate-950 border-blue-500/20"
    : "bg-white border-slate-200"

  const itemIdle = isDark
    ? "bg-slate-900/60 border-blue-500/20 hover:bg-blue-500/10"
    : "bg-white border-slate-200 hover:bg-blue-50"

  const itemActive = isDark
    ? "bg-blue-600/20 border-blue-400"
    : "bg-blue-100 border-blue-400"

  const titleColor = isDark ? "text-slate-100" : "text-slate-900"
  const dateColor = isDark ? "text-slate-400" : "text-slate-500"
  const headerColor = isDark ? "text-blue-300" : "text-blue-600"
  const emptyColor = isDark ? "text-slate-400" : "text-slate-500"

  return (
    <div className={`min-h-screen flex ${pageBg}`}>
      {/* MOBILE BUTTON */}
      {isMobile && (
        <button
          onClick={() => setOpen(true)}
          className={`fixed top-20 left-4 z-50 p-2 rounded-lg border ${
            isDark ? "bg-slate-900 border-blue-500/20" : "bg-white border-slate-300"
          }`}
        >
          <Menu className="w-5 h-5 text-blue-500" />
        </button>
      )}

      {/* OVERLAY */}
      <AnimatePresence>
        {open && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/40 z-30"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <AnimatePresence>
        {(open || !isMobile) && (
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            className={`fixed lg:static z-40 w-72 h-screen p-5 flex flex-col border-r ${sidebarBg}`}
          >
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold flex items-center gap-2 ${headerColor}`}>
                <FileText className="w-5 h-5" />
                My Notes
              </h3>
              {isMobile && (
                <button onClick={() => setOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              )}
            </div>

            {/* LIST */}
            <div className="space-y-2 overflow-y-auto flex-1 pr-1">
              {notes.map((note) => (
                <button
                  key={note._id}
                  onClick={() => {
                    fetchSingleNote(note._id)
                    closeMenuIfMobile()
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition ${
                    activeNote?._id === note._id ? itemActive : itemIdle
                  }`}
                >
                  {/* TITLE */}
                  <div className="flex items-center justify-between">
                    <p className={`font-medium truncate ${titleColor}`}>
                      {note.topic}
                    </p>
                    {activeNote?._id === note._id && (
                      <ChevronRight className="w-4 h-4 text-blue-500" />
                    )}
                  </div>

                  {/* DATE */}
                  <div className={`flex items-center gap-1 text-xs mt-1 ${dateColor}`}>
                    <Calendar className="w-3 h-3" />
                    {new Date(note.createdAt).toLocaleDateString()}
                  </div>

                  {/* FLAGS */}
                  <div className="flex gap-2 mt-2 text-blue-500">
                    {note.includeDiagram && (
                      <span className="flex items-center gap-1 text-xs">
                        <GitBranch className="w-3 h-3" /> Diagram
                      </span>
                    )}
                    {note.includeChart && (
                      <span className="flex items-center gap-1 text-xs">
                        <BarChart3 className="w-3 h-3" /> Chart
                      </span>
                    )}
                    {note.revisionMode && (
                      <span className="flex items-center gap-1 text-xs">
                        <Zap className="w-3 h-3" /> Revision
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* MAIN */}
      <div className="flex-1 overflow-auto">
        <div className={`${isMobile ? "pt-24 p-4" : "p-8"}`}>
          {!activeNote && (
            <div className="h-[70vh] flex items-center justify-center text-center">
              <div>
                <FileText className="w-14 h-14 mx-auto text-blue-400/40 mb-4" />
                <p className={emptyColor}>
                  Select a note from the sidebar
                </p>
              </div>
            </div>
          )}

          {loadingNote && (
            <div className="text-center py-20 text-blue-500">
              Loading note...
            </div>
          )}

          {activeNote && !loadingNote && (
            <FinalResult result={activeNote.content} />
          )}
        </div>
      </div>
    </div>
  )
}

export default History