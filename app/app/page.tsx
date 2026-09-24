import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Dashboard } from "@/components/dashboard";
export default async function AppPage(){const session=await getServerSession(authOptions);if(!session)redirect("/");return <Dashboard/>;}