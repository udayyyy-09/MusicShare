"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Music } from "lucide-react"
import Link from "next/link"

export default function CreateRoomPage() {
  const [roomName, setRoomName] = useState("")
  const [userName, setUserName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomName.trim() || !userName.trim()) return

    setIsLoading(true)

    // Generate a random room code
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    // Store room data in localStorage (in a real app, this would be sent to a server)
    const roomData = {
      roomCode,
      roomName: roomName.trim(),
      creator: userName.trim(),
      users: [userName.trim()],
      playlist: [],
      currentSong: null,
      isPlaying: false,
      currentTime: 0,
    }

    localStorage.setItem(`room_${roomCode}`, JSON.stringify(roomData))
    localStorage.setItem("currentUser", userName.trim())
    localStorage.setItem("currentRoom", roomCode)

    // Simulate API call delay
    setTimeout(() => {
      router.push(`/room/${roomCode}`)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-purple-600 hover:text-purple-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
              <Music className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle className="text-2xl">Create Music Room</CardTitle>
            <CardDescription>Set up a new room for sharing music with friends</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomName">Room Name</Label>
                <Input
                  id="roomName"
                  type="text"
                  placeholder="Enter room name"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userName">Your Name</Label>
                <Input
                  id="userName"
                  type="text"
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isLoading || !roomName.trim() || !userName.trim()}
              >
                {isLoading ? "Creating Room..." : "Create Room"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
