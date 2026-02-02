import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FunnelChart } from "./FunnelChart";

export const EventFunnelChart = () => {
  const { data: events } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*");
      if (error) throw error;
      return data;
    },
  });

  const totals = events?.reduce(
    (acc, event) => ({
      leads: acc.leads + (event.leads_count || 0),
      confirmed: acc.confirmed + (event.confirmed_count || 0),
      attended: acc.attended + (event.attended_count || 0),
      negotiation: acc.negotiation + (event.negotiation_count || 0),
      purchased: acc.purchased + (event.purchased_count || 0),
    }),
    { leads: 0, confirmed: 0, attended: 0, negotiation: 0, purchased: 0 }
  ) || { leads: 0, confirmed: 0, attended: 0, negotiation: 0, purchased: 0 };

  const rates = {
    confirmationRate: totals.leads > 0 ? (totals.confirmed / totals.leads) * 100 : 0,
    attendanceRate: totals.confirmed > 0 ? (totals.attended / totals.confirmed) * 100 : 0,
    negotiationRate: totals.attended > 0 ? (totals.negotiation / totals.attended) * 100 : 0,
    closingRate: totals.negotiation > 0 ? (totals.purchased / totals.negotiation) * 100 : 0,
  };

  return <FunnelChart data={totals} rates={rates} />;
};
