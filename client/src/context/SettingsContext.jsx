import React, { createContext, useContext, useEffect, useState } from 'react'
import { getPublicSettings } from '../services/api'

const SettingsContext = createContext({ settings: { siteName: 'Baby Toys Store', logoUrl: '', brandColor: '#ef4444', bannerEnabled: false, bannerText: '' } })
export const useSettings = () => useContext(SettingsContext)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({ siteName: 'Baby Toys Store', logoUrl: '', brandColor: '#ef4444', bannerEnabled: false, bannerText: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPublicSettings().then(setSettings).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, setSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  )
}