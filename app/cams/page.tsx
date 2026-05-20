import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default function CamsIndexPage() {
  const host = headers().get("host") || "";
  redirect(host.toLowerCase().startsWith("cams.") ? "/admin" : "/cams/admin");
}
