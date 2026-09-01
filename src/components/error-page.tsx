import { useRouter } from "@tanstack/react-router"
import { Button } from "./ui/button"
import { MoveUpRight } from "lucide-react"

export default function ErrorPage({
  status,
  message,
}: {
  status: string
  message: string
}) {
  const router = useRouter()

  return (
    <div className="flex h-svh w-full flex-col items-center justify-center">
      <h1 className="font-heading text-lg font-semibold">{status}</h1>
      <p>
        {message}
        <Button size="lg" variant="link" onClick={() => router.history.back()}>
          <span>Return</span>
          <MoveUpRight />
        </Button>
      </p>
    </div>
  )
}
