import UserSettingsMenu from '../components/UserSettingsMenu'
import UserSettingsContainer from '../components/UserSettingsContainer'

const layout = ({children}: {children: React.ReactNode}) => {
  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen"
      style={{
        backgroundColor: "var(--main-background)"
      }}
    >
      {/* Sidebar Menu - Fixed and non-scrollable */}
      <div className="w-full lg:w-72 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        <UserSettingsMenu />
      </div>
      
      {/* Main Content Area - Scrollable */}
      <div className="flex-1 w-full p-8 lg:p-12 lg:overflow-y-auto lg:h-screen">
        <UserSettingsContainer>
          {children}
        </UserSettingsContainer>
      </div>
    </div>
  )
}

export default layout