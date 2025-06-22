"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Play, Pause, SkipForward, SkipBack, Upload, Users, Music, Copy, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Song {
  id: string
  name: string
  file: File
  url: string
  duration: number
  uploadedBy: string
}

interface RoomData {
  roomCode: string
  roomName: string
  creator: string
  users: string[]
  playlist: Song[]
  currentSong: Song | null
  isPlaying: boolean
  currentTime: number
  lastUpdated: number
  lastUpdatedBy: string
}

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const roomCode = params.roomCode as string
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const roomDataRef = useRef<RoomData | null>(null) // Add this ref

  const [roomData, setRoomData] = useState<RoomData | null>(null)
  const [currentUser, setCurrentUser] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isAudioLoading, setIsAudioLoading] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Update ref whenever roomData changes
  useEffect(() => {
    roomDataRef.current = roomData
  }, [roomData])

  // Real-time sync function - FIXED VERSION
  const syncRoomData = useCallback(() => {
    const storedRoom = localStorage.getItem(`room_${roomCode}`)
    if (storedRoom) {
      const parsedRoom: RoomData = JSON.parse(storedRoom)
      const currentRoomData = roomDataRef.current // Use ref instead of state

      // Only update if the data is newer and not from current user
      if (currentRoomData && parsedRoom.lastUpdated > currentRoomData.lastUpdated && parsedRoom.lastUpdatedBy !== currentUser) {
        setRoomData(parsedRoom)

        // Sync audio playback
        if (audioRef.current) {
          // If song changed, load new song
          if (parsedRoom.currentSong?.id !== currentRoomData.currentSong?.id && parsedRoom.currentSong) {
            audioRef.current.src = parsedRoom.currentSong.url
            audioRef.current.load()
          }

          // Sync play/pause state
          if (parsedRoom.isPlaying && !currentRoomData.isPlaying) {
            audioRef.current.currentTime = parsedRoom.currentTime
            audioRef.current.play().catch(console.error)
          } else if (!parsedRoom.isPlaying && currentRoomData.isPlaying) {
            audioRef.current.pause()
          }

          // Sync time position (with small tolerance to avoid constant seeking)
          if (Math.abs(audioRef.current.currentTime - parsedRoom.currentTime) > 2) {
            audioRef.current.currentTime = parsedRoom.currentTime
          }
        }
      }
    }
  }, [currentUser, roomCode]) // Remove roomData from dependencies

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    const room = localStorage.getItem(`room_${roomCode}`)

    if (!user || !room) {
      router.push("/")
      return
    }

    setCurrentUser(user)
    const initialRoomData = JSON.parse(room)
    setRoomData(initialRoomData)

    // Set up real-time sync
    syncIntervalRef.current = setInterval(syncRoomData, 1000)

    // Listen for storage changes (for real-time sync across tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `room_${roomCode}`) {
        syncRoomData()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [roomCode, router, syncRoomData])

  const updateRoomData = useCallback((newData: Partial<RoomData>) => {
    if (!roomDataRef.current) return

    const updatedData: RoomData = {
      ...roomDataRef.current,
      ...newData,
      lastUpdated: Date.now(),
      lastUpdatedBy: currentUser,
    }

    setRoomData(updatedData)
    localStorage.setItem(`room_${roomCode}`, JSON.stringify(updatedData))

    // Trigger storage event for other tabs/users
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: `room_${roomCode}`,
        newValue: JSON.stringify(updatedData),
      }),
    )
  }, [currentUser, roomCode])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !roomData) return

    if (!file.type.startsWith("audio/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const url = URL.createObjectURL(file)
      const audio = new Audio(url)

      audio.addEventListener("loadedmetadata", () => {
        const newSong: Song = {
          id: Date.now().toString(),
          name: file.name.replace(/\.[^/.]+$/, ""),
          file,
          url,
          duration: audio.duration,
          uploadedBy: currentUser,
        }

        updateRoomData({
          playlist: [...roomData.playlist, newSong],
        })

        toast({
          title: "Song uploaded",
          description: `${newSong.name} has been added to the playlist`,
        })

        setIsUploading(false)
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload the song",
        variant: "destructive",
      })
      setIsUploading(false)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const playSong = async (song: Song) => {
    if (!roomData) return

    updateRoomData({
      currentSong: song,
      isPlaying: true,
      currentTime: 0,
    })

    if (audioRef.current) {
      try {
        audioRef.current.src = song.url
        audioRef.current.load()
        await audioRef.current.play()
      } catch (error) {
        console.error("Error playing audio:", error)
        updateRoomData({ isPlaying: false })

        toast({
          title: "Playback Error",
          description: "Failed to play the audio file",
          variant: "destructive",
        })
      }
    }
  }

  const togglePlayPause = async () => {
    if (!roomData || !audioRef.current) return

    try {
      if (roomData.isPlaying) {
        audioRef.current.pause()
        updateRoomData({
          isPlaying: false,
          currentTime: audioRef.current.currentTime,
        })
      } else {
        await audioRef.current.play()
        updateRoomData({
          isPlaying: true,
          currentTime: audioRef.current.currentTime,
        })
      }
    } catch (error) {
      console.error("Error toggling playback:", error)
      updateRoomData({ isPlaying: false })

      toast({
        title: "Playback Error",
        description: "Failed to control audio playback",
        variant: "destructive",
      })
    }
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    toast({
      title: "Room code copied",
      description: "Share this code with friends to invite them",
    })
  }

  const leaveRoom = () => {
    localStorage.removeItem("currentUser")
    localStorage.removeItem("currentRoom")
    router.push("/")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!roomData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent mx-auto mb-4" />
          <p>Loading room...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">{roomData.roomName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs cursor-pointer" onClick={copyRoomCode}>
                {roomCode} <Copy className="h-3 w-3 ml-1" />
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                {roomData.users.length}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>Room Members</SheetTitle>
                  <SheetDescription>{roomData.users.length} members in this room</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  {roomData.users.map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <span className="font-medium">{user}</span>
                      <div className="flex gap-1">
                        {user === roomData.creator && (
                          <Badge variant="secondary" className="text-xs">
                            Host
                          </Badge>
                        )}
                        {user === currentUser && (
                          <Badge variant="outline" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
            <Button variant="outline" size="sm" onClick={leaveRoom}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{roomData.roomName}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="cursor-pointer" onClick={copyRoomCode}>
                Room Code: {roomCode} <Copy className="h-3 w-3 ml-1" />
              </Badge>
              <Badge variant="outline">
                <Users className="h-3 w-3 mr-1" />
                {roomData.users.length} users
              </Badge>
            </div>
          </div>
          <Button variant="outline" onClick={leaveRoom}>
            <LogOut className="h-4 w-4 mr-2" />
            Leave Room
          </Button>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Music Player */}
            <div className="lg:col-span-2 space-y-4 lg:space-y-6">
              {/* Now Playing Card */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg lg:text-xl">
                    <Music className="h-5 w-5 mr-2" />
                    Now Playing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {roomData.currentSong ? (
                    <div className="space-y-4 lg:space-y-6">
                      <div className="text-center">
                        <h3 className="text-lg lg:text-xl font-semibold truncate">{roomData.currentSong.name}</h3>
                        <p className="text-sm lg:text-base text-gray-600">
                          Uploaded by {roomData.currentSong.uploadedBy}
                        </p>
                      </div>

                      {/* Mobile-optimized controls */}
                      <div className="flex items-center justify-center gap-3 lg:gap-4">
                        <Button variant="outline" size="sm" className="h-10 w-10 lg:h-12 lg:w-12">
                          <SkipBack className="h-4 w-4 lg:h-5 lg:w-5" />
                        </Button>
                        <Button
                          onClick={togglePlayPause}
                          size="lg"
                          disabled={isAudioLoading}
                          className="h-14 w-14 lg:h-16 lg:w-16 rounded-full"
                        >
                          {isAudioLoading ? (
                            <div className="h-6 w-6 lg:h-8 lg:w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : roomData.isPlaying ? (
                            <Pause className="h-6 w-6 lg:h-8 lg:w-8" />
                          ) : (
                            <Play className="h-6 w-6 lg:h-8 lg:w-8" />
                          )}
                        </Button>
                        <Button variant="outline" size="sm" className="h-10 w-10 lg:h-12 lg:w-12">
                          <SkipForward className="h-4 w-4 lg:h-5 lg:w-5" />
                        </Button>
                      </div>

                      <audio
                        ref={audioRef}
                        onLoadStart={() => setIsAudioLoading(true)}
                        onCanPlay={() => setIsAudioLoading(false)}
                        onEnded={() => updateRoomData({ isPlaying: false })}
                        onTimeUpdate={() => {
                          if (audioRef.current && roomData.isPlaying) {
                            updateRoomData({ currentTime: audioRef.current.currentTime })
                          }
                        }}
                        onError={(e) => {
                          console.error("Audio error:", e)
                          setIsAudioLoading(false)
                          updateRoomData({ isPlaying: false })
                          toast({
                            title: "Audio Error",
                            description: "Failed to load the audio file",
                            variant: "destructive",
                          })
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-8 lg:py-12 text-gray-500">
                      <Music className="h-12 w-12 lg:h-16 lg:w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-sm lg:text-base">
                        No song selected. Choose a song from the playlist to start listening.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Playlist Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg lg:text-xl">Playlist ({roomData.playlist.length})</CardTitle>
                  <div>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      size="sm"
                      className="text-xs lg:text-sm"
                    >
                      <Upload className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                      {isUploading ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea key="playlist-scroll" className="h-64 lg:h-96">
                    {roomData.playlist.length === 0 ? (
                      <div className="text-center py-8 lg:py-12 text-gray-500">
                        <Upload className="h-12 w-12 lg:h-16 lg:w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-sm lg:text-base">
                          No songs in playlist yet. Upload some music to get started!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {roomData.playlist.map((song) => (
                          <div
                            key={song.id}
                            className={`flex items-center justify-between p-3 lg:p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${
                              roomData.currentSong?.id === song.id ? "bg-purple-50 border-purple-200" : ""
                            }`}
                            onClick={() => playSong(song)}
                          >
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm lg:text-base truncate">{song.name}</h4>
                              <p className="text-xs lg:text-sm text-gray-600 truncate">
                                Uploaded by {song.uploadedBy} • {formatTime(song.duration)}
                              </p>
                            </div>
                            {roomData.currentSong?.id === song.id && roomData.isPlaying && (
                              <div className="flex items-center text-purple-600 ml-2">
                                <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse mr-2" />
                                <span className="text-xs lg:text-sm font-medium">Playing</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Desktop Users Panel */}
            <div className="hidden lg:block">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Room Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea key="members-scroll" className="h-64">
                    <div className="space-y-2">
                      {roomData.users.map((user, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                          <span className="font-medium">{user}</span>
                          <div className="flex gap-1">
                            {user === roomData.creator && (
                              <Badge variant="secondary" className="text-xs">
                                Host
                              </Badge>
                            )}
                            {user === currentUser && (
                              <Badge variant="outline" className="text-xs">
                                You
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}