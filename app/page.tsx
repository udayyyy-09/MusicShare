import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, Users, Radio } from "lucide-react"
import CardUI from './card';
export default function HomePage() {
  return (
    <div className="mt-5 min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Music className="h-12 w-12 text-purple-600 mr-2" />
            <h1 className="text-4xl font-bold text-gray-900 ">MusicShare</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create or join music rooms and enjoy synchronized listening with friends. Share your favorite tracks and
            listen together in real-time.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
                <Radio className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl">Create Room</CardTitle>
              <CardDescription>Start a new music room and invite friends to join</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/create-room" className="w-full">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">Create New Room</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Join Room</CardTitle>
              <CardDescription>Enter a room code to join an existing music session</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/join-room" className="w-full">
                <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                  Join Existing Room
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                <Radio className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Create or Join</h3>
              <p className="text-gray-600 text-sm">Start a new room or join with a room code</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-fit">
                <Music className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Upload Music</h3>
              <p className="text-gray-600 text-sm">Share your favorite songs with the room</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 p-3 bg-pink-100 rounded-full w-fit">
                <Users className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="font-semibold mb-2">Listen Together</h3>
              <p className="text-gray-600 text-sm">Enjoy synchronized playback with everyone</p>
            </div>
          </div>
        </div>
        <div className = "mt-12 mb-9 items-center">
            {/* <CardUI/> */}
        </div>
      </div>
      
    </div>
    
  )
}
