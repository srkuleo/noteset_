import { useExerciseForm } from "@/util/hooks";
import { Drawer } from "vaul";
import {
  NameInput,
  RepsInputs,
  SetsInput,
  WeightInputs,
} from "./ExerciseInputs";
import { SubmitFormButton } from "./SubmitFormButton";

import { AddExerciseSchema, type ExerciseType } from "@/util/types";

export const EditExerciseForm = ({
  isOpen,
  exercise,
  setIsOpen,
  editExercises,
}: {
  isOpen: boolean;
  exercise: ExerciseType;
  setIsOpen: (isOpen: boolean) => void;
  editExercises: (editedExercise: ExerciseType) => void;
}) => {
  return (
    <Drawer.Root open={isOpen} onOpenChange={setIsOpen} direction="top">
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs dark:bg-slate-950/85" />

        <Drawer.Content className="fixed inset-x-0 top-0 px-4 focus:outline-none">
          <div className="rounded-b-xl bg-white pb-2 pt-safe-top dark:bg-slate-800 dark:ring-1 dark:ring-slate-700/80">
            <ExerciseForm
              exercise={exercise}
              editExercises={editExercises}
              closeModal={() => setIsOpen(false)}
            />
            <Drawer.Handle
              preventCycle
              className="bg-slate-300 dark:bg-slate-600"
            />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

const ExerciseForm = ({
  exercise,
  editExercises,
  closeModal,
}: {
  exercise: ExerciseType;
  editExercises: (editedExercise: ExerciseType) => void;
  closeModal: () => void;
}) => {
  const initExercise = { ...exercise };
  const {
    tempExercise,
    exerciseFormErrors,
    setExerciseFormErrors,
    handleNameInput,
    handleSetsInput,
    handleRepsInput,
    handleWeightInput,
  } = useExerciseForm(initExercise);

  function editExercise() {
    const isValidExercise = AddExerciseSchema.safeParse({ ...tempExercise });

    if (!isValidExercise.success) {
      setExerciseFormErrors({
        errors: isValidExercise.error.flatten().fieldErrors,
      });
      return;
    }

    const validExercise = isValidExercise.data;

    editExercises(validExercise);
    closeModal();
  }

  return (
    <form action={editExercise} className="space-y-6 px-8 py-4">
      <div className="space-y-3">
        <NameInput
          name={tempExercise.name}
          nameError={exerciseFormErrors.errors?.name}
          handleNameInput={handleNameInput}
        />
        <SetsInput
          sets={tempExercise.sets}
          handleSetsInput={handleSetsInput}
          setsError={exerciseFormErrors.errors?.sets}
        />
      </div>

      <div className="space-y-3">
        <RepsInputs
          form="edit"
          reps={tempExercise.reps}
          repsError={exerciseFormErrors.errors?.reps}
          handleRepsInput={handleRepsInput}
        />
        <WeightInputs
          weights={tempExercise.weights}
          weightsError={exerciseFormErrors.errors?.weights}
          handleWeightInput={handleWeightInput}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
            closeModal();
          }}
          className="rounded-xl bg-slate-50 px-4 text-sm font-semibold shadow-sm ring-1 ring-inset ring-slate-200 active:bg-slate-200 dark:bg-white dark:text-slate-600 active:dark:bg-slate-300"
        >
          Cancel
        </button>
        <SubmitFormButton
          label="Add"
          loading="Adding..."
          className="w-full rounded-xl font-nunito"
        />
      </div>
    </form>
  );
};
