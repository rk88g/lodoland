import { HomeExperience } from "../components/home-experience";
import { getHomePageViewModel } from "../lib/data/home";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getHomePageViewModel();

  return <HomeExperience data={data} />;
}
