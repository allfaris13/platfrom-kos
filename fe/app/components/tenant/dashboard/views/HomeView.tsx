import { Homepage } from '../../home/homepage';

interface HomeViewProps {
  navigateToRoomDetail: (roomId: string) => void;
  isLoggedIn: boolean;
  onLogout?: () => void;
  userName: string;
  setActiveView: (view: string) => void;
  userBookedKamarIds?: number[];
}

export function HomeView({
  navigateToRoomDetail,
  isLoggedIn,
  onLogout,
  userName,
  setActiveView,
  userBookedKamarIds = []
}: HomeViewProps) {
  return (
    <Homepage
      onRoomClick={navigateToRoomDetail}
      isLoggedIn={isLoggedIn}
      onLoginPrompt={onLogout}
      userName={userName}
      onViewHistory={() => setActiveView('history')}
      userBookedKamarIds={userBookedKamarIds}
    />
  );
}
