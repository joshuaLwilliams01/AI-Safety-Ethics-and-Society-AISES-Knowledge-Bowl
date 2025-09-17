
import HeroAnimated from "../components/HeroAnimated";
import HowToPlay from "../components/HowToPlay";
import Link from "next/link";
import { SoundProvider } from "../components/SoundProvider";

export default function HomePage() {
  return (
    <SoundProvider>
      <div className="space-y-6">
        <HeroAnimated />
        <div className="flex flex-wrap gap-3">
          <HowToPlay />
          <Link href="/host" className="px-3 py-2 border rounded">Host a Game</Link>
          <Link href="/join" className="px-3 py-2 border rounded">Join a Game</Link>
        </div>
      </div>
    </SoundProvider>
  );
}
