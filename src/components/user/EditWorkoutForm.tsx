"use client";

import { twMerge } from "tailwind-merge";
import { useWorkouts } from "@/util/hooks";
import { editWorkout } from "@/util/actions/workout";
import { showToast } from "../Toasts";
import { WorkoutFormHeader } from "./WorkoutFormHeader";
import { FormToolTip } from "./FormTooltip";
import { InputFieldError } from "./InputFieldError";
import { ExercisesList } from "./ExercisesList";

import type { FetchedWorkout } from "@/db/schema";

export const EditWorkoutForm = ({
  fetchedWorkout,
}: {
  fetchedWorkout: FetchedWorkout;
}) => {
  const {
    workout,
    setWorkout,
    actionRes,
    setActionRes,
    handleTitleInput,
    handleDescriptionInput,
    updateExercises,
    editExercises,
    removeExercise,
  } = useWorkouts(fetchedWorkout);

  async function clientAction() {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const { title: originalTitle, id: workoutId } = fetchedWorkout;

    const res = await editWorkout(workout, workoutId, originalTitle);

    setActionRes({ ...res });

    if (res.status === "success-redirect") {
      showToast(res.message, res.status, "/workouts", "View workouts");
    } else if (res.status === "success" || res.status === "error") {
      showToast(res.message, res.status);
    }
  }

  return (
    <>
      <fieldset disabled={actionRes.status === "pending"} className="group">
        <WorkoutFormHeader
          heading="Edit workout"
          formId="edit"
          updateExercises={updateExercises}
        />
      </fieldset>

      <main className="relative overflow-y-auto overscroll-contain scroll-smooth px-8 py-4">
        <form
          id="edit"
          action={clientAction}
          onSubmit={() => setActionRes({ ...actionRes, status: "pending" })}
        >
          <fieldset
            disabled={actionRes.status === "pending"}
            className="group space-y-4"
          >
            <FormToolTip />

            <div className="flex flex-col gap-2 px-4 group-disabled:opacity-50">
              <label
                htmlFor="title"
                className="pl-1 text-sm font-semibold uppercase text-slate-600 dark:text-slate-200"
              >
                Title
              </label>
              <input
                required={!workout.title}
                id="title"
                name="workoutTitle"
                type="text"
                placeholder={workout.title ? workout.title : "e.g. Upper 1"}
                onChange={(e) => handleTitleInput(e)}
                className={twMerge(
                  "input-field",
                  actionRes.errors?.title && "ring-red-500 dark:ring-red-500",
                )}
              />
              <InputFieldError
                errorArr={actionRes.errors?.title}
                className="pl-1 group-disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col gap-2 px-4 group-disabled:opacity-50">
              <label
                htmlFor="description"
                className="flex gap-1 pl-1 text-sm font-semibold uppercase text-slate-600 dark:text-slate-200"
              >
                Description
                <span className="text-xs lowercase italic text-slate-400/80 dark:text-slate-500">
                  (optional)
                </span>
              </label>
              <input
                id="description"
                name="workoutDescription"
                type="text"
                placeholder={
                  workout.description
                    ? workout.description
                    : "e.g. Workout for the upper body"
                }
                onChange={(e) => handleDescriptionInput(e)}
                className="input-field"
              />
            </div>

            <ExercisesList
              editForm
              isErroring={!!actionRes.errors?.exercises}
              workout={workout}
              setWorkout={setWorkout}
              editExercises={editExercises}
              removeExercise={removeExercise}
            />
            <InputFieldError
              errorArr={actionRes.errors?.exercises}
              className="justify-center py-4 group-disabled:opacity-50"
            />
          </fieldset>
        </form>
      </main>
    </>
  );
};
