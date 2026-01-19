import useIsMobile from "../hooks/useIsMobile";
import HomeDesktop from "../components/HomeDesktop";
import HomeMobile from "../components/HomeMobile";

export default function Home() {
  const isMobile = useIsMobile();
  return isMobile ? <HomeMobile /> : <HomeDesktop />;
}
