'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { api } from '@/trpc/react'
import { toast } from 'sonner'

const GENRES = [
  'Action',
  'Comedy',
  'Drama',
  'Horror',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'Documentary',
  'Animation',
  'Family',
] as const

const LOCATIONS = [
  'Downtown',
  'North Side',
  'South Side',
  'East Side',
  'West Side',
  'City Center',
  'Suburbs',
] as const

export function PreferencesForm() {
  const [isEditing, setIsEditing] = useState(false)
  const utils = api.useUtils()

  const { data: profile } = api.user.getProfile.useQuery()
  const updatePreferences = api.user.updatePreferences.useMutation({
    onSuccess: () => {
      toast.success('Preferences updated successfully')
      setIsEditing(false)
      void utils.user.getProfile.invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const [preferences, setPreferences] = useState({
    favoriteGenre: profile?.preferences?.favoriteGenre ?? '',
    preferredLocation: profile?.preferences?.preferredLocation ?? '',
    notificationSettings: {
      email: profile?.preferences?.notificationSettings?.email ?? false,
      push: profile?.preferences?.notificationSettings?.push ?? false,
    },
  })

  const handleSave = () => {
    updatePreferences.mutate(preferences)
  }

  if (!profile) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Favorite Genre</Label>
          {isEditing ? (
            <Select
              value={preferences.favoriteGenre}
              onValueChange={(value) =>
                setPreferences((prev) => ({ ...prev, favoriteGenre: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Not set</SelectItem>
                {GENRES.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {preferences.favoriteGenre || 'Not set'}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Preferred Location</Label>
          {isEditing ? (
            <Select
              value={preferences.preferredLocation}
              onValueChange={(value) =>
                setPreferences((prev) => ({
                  ...prev,
                  preferredLocation: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Not set</SelectItem>
                {LOCATIONS.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {preferences.preferredLocation || 'Not set'}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Notification Settings</Label>
          {isEditing ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications" className="text-sm">
                  Email Notifications
                </Label>
                <Switch
                  id="email-notifications"
                  checked={preferences.notificationSettings.email}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({
                      ...prev,
                      notificationSettings: {
                        ...prev.notificationSettings,
                        email: checked,
                      },
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications" className="text-sm">
                  Push Notifications
                </Label>
                <Switch
                  id="push-notifications"
                  checked={preferences.notificationSettings.push}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({
                      ...prev,
                      notificationSettings: {
                        ...prev.notificationSettings,
                        push: checked,
                      },
                    }))
                  }
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {preferences.notificationSettings.email ||
                preferences.notificationSettings.push
                  ? 'Enabled'
                  : 'Disabled'}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            </div>
          )}
        </div>

        {isEditing && (
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false)
                setPreferences({
                  favoriteGenre: profile.preferences?.favoriteGenre ?? '',
                  preferredLocation:
                    profile.preferences?.preferredLocation ?? '',
                  notificationSettings: {
                    email:
                      profile.preferences?.notificationSettings?.email ?? false,
                    push:
                      profile.preferences?.notificationSettings?.push ?? false,
                  },
                })
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
