import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus,
  Search,
  Handshake,
  Trophy,
  XCircle,
  Calendar,
  Building2,
  CheckCircle2,
  BanknoteIcon,
  MoreHorizontal,
  ArrowRightLeft,
  Trash2,
  Edit,
  Filter,
} from "lucide-react";
import { useMesaNegocios } from "@/hooks/useMesaNegocios";
import { AddDealDialog } from "@/components/business-desk/AddDealDialog";
import { EditDealDialog } from "@/components/business-desk/EditDealDialog";
import { ScoreBoard } from "@/components/business-desk/ScoreBoard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { SituacaoNegocio, MesaNegocios } from "@/types/social-selling";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLUMNS: { key: SituacaoNegocio; label: string; icon: React.ReactNode; color: string; bgColor: string }[] = [
  {
    key: "NEGOCIANDO",
    label: "Negociando",
    icon: <Handshake className="h-4 w-4" />,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10 border-amber-500/30",
  },
  {
    key: "GANHO",
    label: "Ganho",
    icon: <Trophy className="h-4 w-4" />,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10 border-emerald-500/30",
  },
  {
    key: "PERDIDO",
    label: "Perdido",
    icon: <XCircle className="h-4 w-4" />,
    color: "text-red-500",
    bgColor: "bg-red-500/10 border-red-500/30",
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const BusinessDesk = () => {
  const { deals, isLoading, updateDeal, deleteDeal } = useMesaNegocios();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSituacao, setFilterSituacao] = useState<string>("all");

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const matchesSearch =
        searchQuery === "" ||
        deal.empresa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSituacao = filterSituacao === "all" || deal.situacao === filterSituacao;

      return matchesSearch && matchesSituacao;
    });
  }, [deals, searchQuery, filterSituacao]);

  const handleStatusChange = (dealId: string, newStatus: SituacaoNegocio) => {
    updateDeal.mutate({ id: dealId, situacao: newStatus });
  };

  const handleToggleCompareceu = (dealId: string, current: boolean) => {
    updateDeal.mutate({ id: dealId, compareceu: !current });
  };

  const handleTogglePix = (dealId: string, current: boolean) => {
    updateDeal.mutate({ id: dealId, pix_compromisso: !current });
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteDeal.mutate(deletingId);
      setDeletingId(null);
    }
  };

  const dealsByStatus = useMemo(() => {
    const grouped: Record<SituacaoNegocio, typeof filteredDeals> = {
      NEGOCIANDO: [],
      GANHO: [],
      PERDIDO: [],
    };
    filteredDeals.forEach((deal) => {
      grouped[deal.situacao]?.push(deal);
    });
    return grouped;
  }, [filteredDeals]);

  // KPI metrics
  const totalDeals = deals.length;
  const totalNegociando = deals.filter((d) => d.situacao === "NEGOCIANDO").length;
  const totalGanho = deals.filter((d) => d.situacao === "GANHO").length;
  const totalValorGanho = deals
    .filter((d) => d.situacao === "GANHO")
    .reduce((sum, d) => sum + Number(d.valor_negocio), 0);

  return (
    <AppLayout
      title="Mesa de Negócios"
      description="Acompanhe suas reuniões e negociações em tempo real"
      actions={
        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-gold hover:bg-gold/90 text-primary-foreground gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Reunião
        </Button>
      }
    >
      <div className="space-y-6">


          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border bg-card/50">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground font-medium">Total Negócios</p>
                <p className="text-2xl font-bold text-foreground">{totalDeals}</p>
              </CardContent>
            </Card>
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="p-4">
                <p className="text-xs text-amber-500 font-medium">Negociando</p>
                <p className="text-2xl font-bold text-amber-500">{totalNegociando}</p>
              </CardContent>
            </Card>
            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <CardContent className="p-4">
                <p className="text-xs text-emerald-500 font-medium">Ganhos</p>
                <p className="text-2xl font-bold text-emerald-500">{totalGanho}</p>
              </CardContent>
            </Card>
            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <CardContent className="p-4">
                <p className="text-xs text-emerald-500 font-medium">Receita Fechada</p>
                <p className="text-xl font-bold text-emerald-500 truncate">{formatCurrency(totalValorGanho)}</p>
              </CardContent>
            </Card>
          </div>

          {/* ScoreBoard */}
          <ScoreBoard />

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar empresa ou responsável..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-border"
              />
            </div>
            <Select value={filterSituacao} onValueChange={setFilterSituacao}>
              <SelectTrigger className="w-[160px] border-border">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Situação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="NEGOCIANDO">Negociando</SelectItem>
                <SelectItem value="GANHO">Ganho</SelectItem>
                <SelectItem value="PERDIDO">Perdido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Kanban Board */}
          {isLoading ? (
            <div className="text-center py-16 text-muted-foreground">Carregando negócios...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {COLUMNS.map((column) => (
                <div key={column.key} className="space-y-3">
                  {/* Column Header */}
                  <div className={`flex items-center gap-2 p-3 rounded-lg border ${column.bgColor}`}>
                    <span className={column.color}>{column.icon}</span>
                    <span className={`font-semibold text-sm ${column.color}`}>{column.label}</span>
                    <Badge
                      variant="secondary"
                      className={`ml-auto text-xs ${column.color} bg-transparent border ${column.bgColor}`}
                    >
                      {dealsByStatus[column.key].length}
                    </Badge>
                  </div>

                  {/* Cards */}
                  <div className="space-y-2 min-h-[100px]">
                    {dealsByStatus[column.key].length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
                        Nenhum negócio
                      </div>
                    ) : (
                      dealsByStatus[column.key].map((deal) => (
                        <Card
                          key={deal.id}
                          className="border-border bg-card hover:bg-card/80 transition-all duration-200 hover:shadow-md group"
                        >
                          <CardContent className="p-4 space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-foreground truncate flex items-center gap-1.5">
                                  <Building2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                  {deal.empresa}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {deal.profiles?.name || "Sem responsável"}
                                </p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={() => setEditingDeal(deal)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {/* Status transitions */}
                                  {deal.situacao !== "NEGOCIANDO" && (
                                    <DropdownMenuItem onClick={() => handleStatusChange(deal.id, "NEGOCIANDO")}>
                                      <ArrowRightLeft className="h-4 w-4 mr-2" />
                                      Mover p/ Negociando
                                    </DropdownMenuItem>
                                  )}
                                  {deal.situacao !== "GANHO" && (
                                    <DropdownMenuItem onClick={() => handleStatusChange(deal.id, "GANHO")}>
                                      <Trophy className="h-4 w-4 mr-2 text-emerald-500" />
                                      Marcar como Ganho
                                    </DropdownMenuItem>
                                  )}
                                  {deal.situacao !== "PERDIDO" && (
                                    <DropdownMenuItem onClick={() => handleStatusChange(deal.id, "PERDIDO")}>
                                      <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                      Marcar como Perdido
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => setDeletingId(deal.id)}
                                    className="text-red-500 focus:text-red-500"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {/* Body */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 flex-shrink-0" />
                              <span>
                                {format(new Date(deal.data_reuniao), "dd MMM yyyy, HH:mm", { locale: ptBR })}
                              </span>
                            </div>

                            {deal.valor_negocio > 0 && (
                              <p className="text-sm font-bold text-gold">
                                {formatCurrency(Number(deal.valor_negocio))}
                              </p>
                            )}

                            {/* Tags */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                onClick={() => handleToggleCompareceu(deal.id, deal.compareceu)}
                                className="inline-flex"
                              >
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] cursor-pointer transition-colors ${
                                    deal.compareceu
                                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                                      : "bg-muted/30 text-muted-foreground border-border"
                                  }`}
                                >
                                  <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                                  Compareceu
                                </Badge>
                              </button>
                              <button
                                onClick={() => handleTogglePix(deal.id, deal.pix_compromisso)}
                                className="inline-flex"
                              >
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] cursor-pointer transition-colors ${
                                    deal.pix_compromisso
                                      ? "bg-gold/10 text-gold border-gold/30"
                                      : "bg-muted/30 text-muted-foreground border-border"
                                  }`}
                                >
                                  <BanknoteIcon className="h-2.5 w-2.5 mr-0.5" />
                                  PIX
                                </Badge>
                              </button>
                            </div>

                            {/* Lead reference */}
                            {deal.leads?.name && (
                              <p className="text-[10px] text-muted-foreground truncate">
                                Lead: {deal.leads.name}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      {/* Dialogs */}
      <AddDealDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
      {editingDeal && (
        <EditDealDialog
          deal={editingDeal}
          open={!!editingDeal}
          onOpenChange={(open) => !open && setEditingDeal(null)}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir negócio?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. O negócio será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default BusinessDesk;
