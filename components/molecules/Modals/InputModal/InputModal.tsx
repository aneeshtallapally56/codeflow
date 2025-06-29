"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { useForm } from "react-hook-form";
import { useCreateProject } from "@/hooks/api/mutations/useCreateProject";
import { toast } from "sonner";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface FormValues {
  title: string;
  type: string;
}

interface InputModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InputModal = ({ open, onOpenChange }: InputModalProps) => {
  const form = useForm<FormValues>({
    defaultValues: {
      title: "",
     type: "",
    },
     mode: "onChange",
  });
  useEffect(() => {
  if (open) {
    form.reset({
      title: "",
      type: "",
    });
  }
}, [open, form]);
  form.register("type", { required: true });
  const { createProjectMutation , isPending } = useCreateProject();

  const onSubmit = async (data: FormValues) => {
    try {
      await createProjectMutation({ title: data.title , type: data.type });
 toast("  Project created successfully!",{
  className:"toast",
  unstyled: true,
  icon: <CheckCircle className="text-green-500 w-5 h-5" />,
});

  // ✅ fixed
  onOpenChange(false);
    } catch (err) {
      toast("  Project cant be created!",{
  className:"toast",
  unstyled: true,
  icon: <XCircle className="text-green-500 w-5 h-5" />,
});
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="fixed left-1/2 top-1/2 z-50 grid w-[280px] md:w-[425px] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border border-zinc-800 bg-gradient-to-br from-[#101010] to-[#151515] p-6 shadow-lg duration-200 sm:rounded-lg"
      >
        
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <DialogTitle className="text-lg font-semibold tracking-tight">Create New Project</DialogTitle>
          {/* <h2 ></h2> */}
          <p className="mt-2 text-sm text-left text-zinc-500 font-medium capitalize">
            Start coding with your friends by creating a new project and start debugging with AI.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4 pt-2">
            {/* Title */}
            <FormItem className="grid grid-cols-4 items-center gap-4">
              <FormLabel className="text-sm font-medium">Title</FormLabel>
              <FormControl>
                <Input
                  {...form.register("title", {
                    required: true,
                    minLength:5,
                  })}
                  placeholder="at least 3 characters"
                  className="col-span-3 h-9 w-[160px] md:w-[260px] rounded-md border border-zinc-600 bg-transparent px-3 py-1 text-base shadow-sm  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </FormControl>
              <FormMessage className="col-span-4">{form.formState.errors.title?.message}</FormMessage>
            </FormItem>

            {/* Language */}
            <FormItem className="grid grid-cols-4 items-center gap-4">
              <FormLabel className="text-sm font-medium">Type</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) =>
                    form.setValue("type", value, { shouldValidate: true , shouldDirty: true })
                  }

                >
                  <SelectTrigger className="col-span-3 h-9 w-[160px] md:w-[260px] items-center justify-between rounded-md border border-zinc-600 bg-transparent px-3 py-2 text-sm shadow-sm
             focus:outline-none focus:ring-0 focus:border-white
             focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
             disabled:cursor-not-allowed disabled:opacity-50">
                    <SelectValue placeholder="Framework"className=""/>
                  </SelectTrigger>
                  <SelectContent className="bg-gradient-to-br from-[#101010] to-[#151515] border border-zinc-600 text-white text-sm  ">
                    <SelectItem value="React">React</SelectItem>
                    <SelectItem value="Nextjs">Nextjs</SelectItem>
                    <SelectItem value="Angular">Angular</SelectItem>
                    <SelectItem value="Vue">Vue</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage className="col-span-4">{form.formState.errors.type?.message}</FormMessage>
            </FormItem>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-2">
              
              <Button
                type="submit"
                 disabled={!form.formState.isValid || isPending}
                className="bg-gradient-to-b from-blue-500 to-blue-600 text-white font-semibold opacity-90 hover:opacity-100 disabled:grayscale"
              >
               {isPending ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};