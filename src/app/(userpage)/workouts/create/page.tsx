import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { type Breadcrumb } from "@/util/types";
import { Breadcrumbs } from "@/components/user/Breadcrumbs";
import { CreateForm } from "@/components/user/CreateForm";

export default async function CreateWorkoutPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const userId = user?.id as string;

  const breadcrumbs: Breadcrumb[] = [
    {
      label: "workouts",
      href: "/workouts",
    },
    {
      label: "create",
      href: "/workouts/create",
      active: true,
    },
  ];

  return (
    <>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <div className="rounded-lg bg-white px-4 py-8 shadow-md ring-1 ring-slate-400/30 dark:bg-slate-800">
        <h2 className="text-center text-lg font-semibold">
          Create a new workout
        </h2>
        <CreateForm userId={userId} />
      </div>
    </>
  );
}
