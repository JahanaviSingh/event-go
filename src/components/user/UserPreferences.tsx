import { trpcClient } from "@/trpc/clients/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { Genre } from "@prisma/client"

export function UserPreferences({ user }: { user: any }) {
  const [preferences, setPreferences] = useState({
    favoriteGenre: user?.preferences?.favoriteGenre || '',
    preferredLocation: user?.preferences?.preferredLocation || '',
    notificationPreferences: user?.preferences?.notificationPreferences || {
      email: true,
      sms: false,
      push: true
    }
  })

  const updatePreferences = trpcClient.user.updatePreferences.useMutation()

  const handleSave = () => {
    updatePreferences.mutate(preferences)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="genre">Favorite Genre</Label>
        <Select
          value={preferences.favoriteGenre}
          onValueChange={(value) => setPreferences(prev => ({ ...prev, favoriteGenre: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select genre" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(Genre).map((genre) => (
              <SelectItem key={genre} value={genre}>
                {genre.replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Preferred Location</Label>
        <Input
          id="location"
          value={preferences.preferredLocation}
          onChange={(e) => setPreferences(prev => ({ ...prev, preferredLocation: e.target.value }))}
          placeholder="Enter your preferred location"
        />
      </div>

      <div className="space-y-2">
        <Label>Notification Preferences</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="email"
              checked={preferences.notificationPreferences.email}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                notificationPreferences: {
                  ...prev.notificationPreferences,
                  email: e.target.checked
                }
              }))}
            />
            <Label htmlFor="email">Email Notifications</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="sms"
              checked={preferences.notificationPreferences.sms}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                notificationPreferences: {
                  ...prev.notificationPreferences,
                  sms: e.target.checked
                }
              }))}
            />
            <Label htmlFor="sms">SMS Notifications</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="push"
              checked={preferences.notificationPreferences.push}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                notificationPreferences: {
                  ...prev.notificationPreferences,
                  push: e.target.checked
                }
              }))}
            />
            <Label htmlFor="push">Push Notifications</Label>
          </div>
        </div>
      </div>

      <Button onClick={handleSave} className="w-full">
        Save Preferences
      </Button>
    </div>
  )
} 