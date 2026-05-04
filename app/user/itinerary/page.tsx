"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, MapPin, Calendar, Compass, RefreshCw } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import { GenerateAiItinerary } from "@/lib/api"
import { useAuth } from "@/store/authContext"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export default function AIItineraryPage() {
  const { auth } = useAuth();
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!auth?.id) {
      toast.error("Please log in to use the AI assistant.");
      return;
    }

    setIsLoading(true);
    setAiResponse(null);
    
    try {
      const result = await GenerateAiItinerary(auth.id);
      setAiResponse(result);
      toast.success("Itinerary generated successfully!");
    } catch (error) {
      toast.error("Failed to generate AI itinerary.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-[#023e8a] to-[#00b4d8] rounded-2xl shadow-xl mb-6">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Smart AI Itinerary Assistant
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the future of travel planning. Our RAG-powered AI analyzes your live bookings 
            to create a personalized, spiritual journey just for you.
          </p>
        </motion.div>

        {/* Action Card */}
        <Card className="bg-white border-0 shadow-2xl rounded-[2rem] overflow-hidden mb-12">
          <CardContent className="p-8 sm:p-12">
            <div className="flex flex-col items-center justify-center space-y-8">
              {!aiResponse && !isLoading && (
                <div className="text-center space-y-6">
                  <div className="flex justify-center gap-6">
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-4 bg-blue-50 rounded-full text-blue-600">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold text-gray-500">Live Locations</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-4 bg-emerald-50 rounded-full text-emerald-600">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold text-gray-500">Booking Dates</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-4 bg-purple-50 rounded-full text-purple-600">
                        <Compass className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold text-gray-500">Personalized</span>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Ready to plan your journey?</h2>
                  <p className="text-gray-500">We'll scan your hotel and Umrah bookings to build your dream schedule.</p>
                </div>
              )}

              {isLoading ? (
                <div className="flex flex-col items-center py-12 gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-[#023e8a]/20 border-t-[#023e8a] rounded-full animate-spin"></div>
                    <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-[#023e8a] animate-bounce" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900">Connecting to the database...</h3>
                    <p className="text-gray-500">Analyzing your bookings and retrieving spiritual insights.</p>
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  {aiResponse ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-8"
                    >
                      <div className="flex items-center justify-between border-b pb-6">
                        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                          <Sparkles className="w-6 h-6 text-[#023e8a]" />
                          Your Custom Itinerary
                        </h3>
                        <Button 
                          onClick={handleGenerate}
                          variant="outline"
                          className="rounded-full border-[#023e8a] text-[#023e8a] hover:bg-[#023e8a]/5 font-bold"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerate
                        </Button>
                      </div>
                      <div className="prose prose-blue max-w-none prose-headings:text-[#023e8a] prose-strong:text-gray-900 text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                        <ReactMarkdown>
                          {aiResponse}
                        </ReactMarkdown>
                      </div>
                    </motion.div>
                  ) : (
                    <Button 
                      onClick={handleGenerate}
                      className="w-full max-w-md mx-auto py-8 text-xl font-bold bg-gradient-to-r from-[#023e8a] to-[#00b4d8] hover:from-[#012a5e] hover:to-[#0096b8] shadow-[0_10px_40px_rgba(2,62,138,0.3)] rounded-2xl transition-all hover:scale-105 active:scale-95"
                    >
                      <Sparkles className="w-6 h-6 mr-3" />
                      Generate Smart Itinerary
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bottom Tip */}
        <p className="text-center text-sm text-gray-400">
          Powered by Aeronaa's Advanced RAG Engine
        </p>
      </div>
      <ToastContainer position="top-right" />
    </div>
  )
}
