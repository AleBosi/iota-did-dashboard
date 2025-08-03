import React, { useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { Actor } from "../../models/actor";
import OperatoreForm from "../Actors/Operatori/OperatoreForm";
import OperatoreList from "../Actors/Operatori/OperatoreList";
import MacchinarioForm from "../Actors/Macchinari/MacchinarioForm";
import MacchinarioList from "../Actors/Macchinari/MacchinarioList";
import ProductForm from "../Products/ProductForm";
import ProductList from "../Products/ProductList";
import EventForm from "../Events/EventForm";
import EventList from "../Events/EventList";
import VCCreator from "../VC/VCCreator";
import VCList from "../VC/VCList";
import Sidebar from "../Common/Sidebar";
import Header from "../Common/Header";

export default function CreatorDashboard({ creator }: { creator: Actor }) {
  const { logout } = useUser();
  const [operatori, setOperatori] = useState<Actor[]>([]);
  const [macchinari, setMacchinari] = useState<Actor[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [vcs, setVCs] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<"users"|"products"|"events"|"vc">("users");

  const handleCreateOperatore = (op: Actor) => setOperatori(prev => [...prev, op]);
  const handleCreateMacchinario = (m: Actor) => setMacchinari(prev => [...prev, m]);
  const handleCreateProduct = (p: any) => setProducts(prev => [...prev, p]);
  const handleCreateEvent = (e: any) => setEvents(prev => [...prev, e]);
  const handleCreateVC = (vc: any) => setVCs(prev => [...prev, vc]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="creator" onTabSelect={setSelectedTab} selectedTab={selectedTab} />
      <div className="flex-1 flex flex-col">
        <Header user={{ username: creator.name, role: "creator" }} onLogout={logout} />
        <div className="p-6">
          {selectedTab === "users" && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h2 className="font-bold mb-2">Operatori</h2>
                <OperatoreForm onCreate={handleCreateOperatore} />
                <OperatoreList operatori={operatori} />
              </div>
              <div>
                <h2 className="font-bold mb-2">Macchinari</h2>
                <MacchinarioForm onCreate={handleCreateMacchinario} />
                <MacchinarioList macchinari={macchinari} />
              </div>
            </div>
          )}
          {selectedTab === "products" && (
            <div>
              <h2 className="font-bold mb-2">Prodotti</h2>
              <ProductForm onCreate={handleCreateProduct} />
              <ProductList products={products} />
            </div>
          )}
          {selectedTab === "events" && (
            <div>
              <h2 className="font-bold mb-2">Eventi</h2>
              <EventForm productId={""} by={creator.id} onCreate={handleCreateEvent} />
              <EventList events={events} />
            </div>
          )}
          {selectedTab === "vc" && (
            <div>
              <h2 className="font-bold mb-2">VC</h2>
              <VCCreator onCreate={handleCreateVC} />
              <VCList vcs={vcs} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
