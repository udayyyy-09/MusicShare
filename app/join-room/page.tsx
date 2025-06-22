"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Users } from "lucide-react"
import Link from "next/link"

export default function JoinRoomPage() {
  const [roomCode, setRoomCode] = useState("")
  const [userName, setUserName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomCode.trim() || !userName.trim()) return

    setIsLoading(true)
    setError("")

    // Check if room exists in localStorage
    const roomData = localStorage.getItem(`room_${roomCode.toUpperCase()}`)

    if (!roomData) {
      setError("Room not found. Please check the room code.")
      setIsLoading(false)
      return
    }

    try {
      const room = JSON.parse(roomData)

      // Add user to room if not already present
      if (!room.users.includes(userName.trim())) {
        room.users.push(userName.trim())
        localStorage.setItem(`room_${roomCode.toUpperCase()}`, JSON.stringify(room))
      }

      localStorage.setItem("currentUser", userName.trim())
      localStorage.setItem("currentRoom", roomCode.toUpperCase())

      // Simulate API call delay
      setTimeout(() => {
        router.push(`/room/${roomCode.toUpperCase()}`)
      }, 1000)
    } catch (err) {
      setError("Error joining room. Please try again.")
      setIsLoading(false)
    }
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
            <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Join Music Room</CardTitle>
            <CardDescription>Enter the room code to join an existing music session</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomCode">Room Code</Label>
                <Input
                  id="roomCode"
                  type="text"
                  placeholder="Enter room code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
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

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full border-blue-600 bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || !roomCode.trim() || !userName.trim()}
              >
                {isLoading ? "Joining Room..." : "Join Room"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
