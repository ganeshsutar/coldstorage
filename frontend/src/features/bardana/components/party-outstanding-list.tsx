import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { usePartyOutstandingList } from "../hooks"

export function PartyOutstandingList() {
  const { data: parties = [], isLoading } = usePartyOutstandingList()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Party Outstanding</h2>
        <p className="text-muted-foreground">Bardana outstanding by party</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : parties.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No outstanding bardana found.
        </div>
      ) : (
        <div className="space-y-3">
          {parties.map((party) => (
            <Collapsible key={party.party_id}>
              <Card>
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="flex flex-row items-center justify-between py-3">
                    <div className="flex items-center gap-4">
                      <CardTitle className="text-base">{party.party_name}</CardTitle>
                      <span className="text-sm text-muted-foreground">
                        Outstanding: {party.total_outstanding} bags
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-right">
                        <span className="text-muted-foreground">Issued: </span>
                        <span className="font-medium">{party.total_issued}</span>
                        <span className="text-muted-foreground ml-3">Returned: </span>
                        <span className="font-medium">{party.total_returned}</span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Issued</TableHead>
                          <TableHead className="text-right">Returned</TableHead>
                          <TableHead className="text-right">Outstanding</TableHead>
                          <TableHead className="text-right">Rate</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {party.types.map((type) => (
                          <TableRow key={type.bardana_type_id}>
                            <TableCell>
                              <span className="font-medium">{type.bardana_type_name}</span>
                              <span className="text-sm text-muted-foreground ml-2">
                                ({type.bardana_type_code})
                              </span>
                            </TableCell>
                            <TableCell className="text-right">{type.issued}</TableCell>
                            <TableCell className="text-right">{type.returned}</TableCell>
                            <TableCell className="text-right font-medium text-orange-600">
                              {type.outstanding}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {Number(type.rate).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-mono font-medium">
                              {Number(type.amount).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  )
}
