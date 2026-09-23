import Closed from "@/components/register/Closed";
import JoinDoor from "@/components/register/JoinDoor";
import RegisterHeader from "@/components/register/RegisterHeader";
import { registrationMode } from "@/lib/register/mode";
import { registerMeta } from "@/lib/register/meta";
import { EVENT } from "@/lib/site";

export const metadata = registerMeta({
  title: `Join a team — ${EVENT.name} ${EVENT.year}`,
  description: `Got a team code from your teammate? Join their team for ${EVENT.name} ${EVENT.year}.`,
});

export default function JoinPage() {
  if (registrationMode() === "soon") return <Closed />;
  return (
    <>
      <RegisterHeader back={{ href: "/register", label: "Register" }} />
      <main className="relative overflow-x-clip">
        <JoinDoor title={"Got a\ncode?"} note={"Your teammate\nhas one."} />
      </main>
    </>
  );
}
