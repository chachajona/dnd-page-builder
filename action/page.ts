import { formSchemaType, formSchema } from "@/schemas/page";

export async function CreatePage(data: formSchemaType) {
  const validation = formSchema.safeParse(data);
  if (!validation.success) {
    throw new Error("form not valid");
  }
  console.log("NAME ON SERVER", data.name);
}
