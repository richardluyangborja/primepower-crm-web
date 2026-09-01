import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Ellipsis, FunnelPlus, MoveUpRight, Search } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link, useNavigate } from "@tanstack/react-router"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import useLeadsQuery from "./-useLeadsQuery"
import { Spinner } from "@/components/ui/spinner"

export type LeadTableRow = {
  id: number
  company: {
    id: number
    name: string
    industry: string
    logoHref?: string
    logoFallback?: string
  }
  source: string
  primary_contact?: {
    name: string
    title: string
  }
  status: "new" | "qualified" | "converted" | "disqualified"
  sales_representative: {
    name: string
    profileHref?: string
    profileFallback?: string
  }
}

export default function LeadTable() {
  const query = useLeadsQuery()
  const navigate = useNavigate()
  const data = query.data

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Search />
          </Button>
          <Input placeholder="Search lead..." className="w-xs" />
          <Button variant="outline" size="icon">
            <FunnelPlus />
          </Button>
        </div>
        <CardAction>
          <Button asChild>
            <Link to="/admin/lead/create">
              <span>Create new lead</span>
              <MoveUpRight />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {query.isPending ? (
          <Spinner />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Primary Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sales Representative</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((lead) => (
                <TableRow
                  key={lead.id}
                  onClick={() =>
                    navigate({
                      to: "/admin/lead/$leadId",
                      params: { leadId: lead.id.toString() },
                    })
                  }
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src={lead.company.logoHref} />
                        <AvatarFallback>
                          {lead.company.logoFallback}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span>{lead.company.name}</span>
                        <span className="text-xs font-normal text-muted-foreground">
                          {lead.company.industry}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{lead.source}</TableCell>
                  <TableCell className="flex flex-col">
                    <span>{lead.primary_contact?.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {lead.primary_contact?.title}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{lead.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage
                          src={lead.sales_representative.profileHref}
                        />
                        <AvatarFallback>
                          {lead.sales_representative.profileFallback}
                        </AvatarFallback>
                      </Avatar>
                      <span>{lead.sales_representative.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Ellipsis />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View</DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem variant="destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
