'use client'

import React from 'react'

interface UserSettingsContainerProps {
  children: React.ReactNode
}

const UserSettingsContainer = ({ children }: UserSettingsContainerProps) => {
  return (
    <div className="w-full">
      {children}
    </div>
  )
}

export default UserSettingsContainer
