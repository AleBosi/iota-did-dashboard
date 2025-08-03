import React, { useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { Actor } from "../../models/actor";
import ProductList from "../Products/ProductList";
import EventList from "../Events/EventList";
import VCList from "../VC/VCList";
import CreditsDashboard from "../Credits/CreditsDashboard";
import UserCreditsHistory from "../Credits/UserCreditsHistory";
import Sidebar from "../Common/Sidebar";
import Header from "../Common/Header";

export default function OperatorDashboard({ operatore }: { operatore: Actor }) {
  const { logout } = useUser();
  const [products, setProducts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [vcs, setVCs] = useState<any[]>([]);
  const [credits, setCredits] = useState(0);
  const [creditHistory, setCreditHistory] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<"products"|"events"|"vc"|"credits">("products");

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="operatore" onTabSelect={setSelectedTab} selectedTab={selectedTab} />
      <div className="flex-1 flex flex-col">
        <Header user={{ username: operatore.name, role: "operatore" }} onLogout={logout} />
        <div className="p-6">
          {selectedTab === "products" && <ProductList products={products} />}
          {selectedTab === "events" && <EventList events={events} />}
          {selectedTab === "vc" && <VCList vcs={vcs} />}
          {selectedTab === "credits" && (
            <div>
              <CreditsDashboard credits={credits} onBuyCredits={() => {}} />
              <UserCreditsHistory history={creditHistory} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
