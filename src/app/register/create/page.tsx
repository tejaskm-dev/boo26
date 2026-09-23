import Closed from "@/components/register/Closed";
import CreateTeam from "@/components/register/CreateTeam";
import RegisterHeader from "@/components/register/RegisterHeader";
import { registrationOpen, TEAMS_ARE_TEMPORARY } from "@/lib/register/mode";
import { registerMeta } from "@/lib/register/meta";
import { EVENT } from "@/lib/site";

export const metadata = registerMeta({
  title: `Start a team — ${EVENT.name} ${EVENT.year}`,
  description: `Start your team for ${EVENT.name} ${EVENT.year}, then send your teammate the code.`,
});

export default function CreatePage() {
  if (!registrationOpen()) return <Closed />;
  return (
    <>
      <RegisterHeader back={{ href: "/register", label: "Register" }} />
      <main className="relative overflow-x-clip">
        <CreateTeam preview={TEAMS_ARE_TEMPORARY} />
      </main>
    </>
  );
}
