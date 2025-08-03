import React, { useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { Azienda } from "../../models/azienda";
import { Actor } from "../../models/actor";
import { Product } from "../../models/product";
import { ProductType } from "../../models/productType";
import { Event } from "../../models/event";
import { VerifiableCredential } from "../../models/vc";
import AziendaDetails from "../Actors/Azienda/AziendaDetails";
import CreatorForm from "../Actors/Creator/CreatorForm";
import CreatorList from "../Actors/Creator/CreatorList";
import OperatoreForm from "../Actors/Operatori/OperatoreForm";
import OperatoreList from "../Actors/Operatori/OperatoreList";
import MacchinarioForm from "../Actors/Macchinari/MacchinarioForm";
import MacchinarioList from "../Actors/Macchinari/MacchinarioList";
import ProductForm from "../Products/ProductForm";
import ProductList from "../Products/ProductList";
import ProductTypeList from "../ProductTypes/ProductTypeList";
import ProductTypeForm from "../ProductTypes/ProductTypeForm";
import EventForm from "../Events/EventForm";
import EventList from "../Events/EventList";
import VCList from "../VC/VCList";
import VCCreator from "../VC/VCreator";
import CreditsDashboard from "../Credits/CreditsDashboard";
import UserCreditsHistory from "../Credits/UserCreditsHistory";
import ImportExportBox from "../Common/ImportExportBox";
import CopyJsonBox from "../Common/CopyJsonBox";
import SeedManager from "../Common/SeedManager";
import Sidebar from "../Common/Sidebar";
import Header from "../Common/Header";

export default function AziendaDashboard({ azienda }: { azienda: Azienda }) {
  const { logout } = useUser();

  // Stato utenti
  const [creators, setCreators] = useState<Actor[]>([]);
  const [operatori, setOperatori] = useState<Actor[]>([]);
  const [macchinari, setMacchinari] = useState<Actor[]>([]);

  // Stato asset/dati
  const [products, setProducts] = useState<Product[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [vcs, setVCs] = useState<VerifiableCredential[]>([]);

  // Crediti (solo verso operatori/macchinari)
  const [credits, setCredits] = useState<number>(azienda.credits || 0);
  const [creditHistory, setCreditHistory] = useState<any[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<Actor | null>(null);
  const [creditToSend, setCreditToSend] = useState<number>(0);

  // Tabs
  const [selectedTab, setSelectedTab] = useState<"info"|"users"|"products"|"types"|"events"|"vc"|"credits"|"importexport"|"seed">("info");

  // CRUD handler utenti
  const handleCreateCreator = (creator: Actor) =>
    setCreators(prev => [...prev, { ...creator, role: "creator", aziendaId: azienda.id }]);
  const handleCreateOperatore = (operatore: Actor) =>
    setOperatori(prev => [...prev, { ...operatore, role: "operatore", aziendaId: azienda.id, credits: 0 }]);
  const handleCreateMacchinario = (macchinario: Actor) =>
    setMacchinari(prev => [...prev, { ...macchinario, role: "macchinario", aziendaId: azienda.id, credits: 0 }]);

  // CRUD asset
  const handleCreateProduct = (product: Product) => setProducts(prev => [...prev, product]);
  const handleCreateProductType = (type: ProductType) => setProductTypes(prev => [...prev, type]);
  const handleCreateEvent = (event: Event) => setEvents(prev => [...prev, event]);
  const handleCreateVC = (vc: VerifiableCredential) => setVCs(prev => [...prev, vc]);

  // Logica crediti: solo verso operatori/macchinari (NON creator)
  const sendCredits = () => {
    if (!selectedRecipient || creditToSend <= 0 || creditToSend > credits) return;
    setCredits(credits - creditToSend);
    setCreditHistory([
      ...creditHistory,
      {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        amount: creditToSend,
        type: "spend",
        description: `Assegnato a ${selectedRecipient.name} (${selectedRecipient.role})`
      }
    ]);
    if (selectedRecipient.role === "operatore") {
      setOperatori(prev =>
        prev.map(o =>
          o.id === selectedRecipient.id
            ? { ...o, credits: (o.credits || 0) + creditToSend }
            : o
        )
      );
    } else if (selectedRecipient.role === "macchinario") {
      setMacchinari(prev =>
        prev.map(m =>
          m.id === selectedRecipient.id
            ? { ...m, credits: (m.credits || 0) + creditToSend }
            : m
        )
      );
    }
    setCreditToSend(0);
  };

  // Import/export dati
  const exportData = {
    azienda,
    creators,
    operatori,
    macchinari,
    products,
    productTypes,
    events,
    vcs,
    credits,
    creditHistory
  };
  const handleImport = (json: any) => {
    if (json.creators) setCreators(json.creators);
    if (json.operatori) setOperatori(json.operatori);
    if (json.macchinari) setMacchinari(json.macchinari);
    if (json.products) setProducts(json.products);
    if (json.productTypes) setProductTypes(json.productTypes);
    if (json.events) setEvents(json.events);
    if (json.vcs) setVCs(json.vcs);
    if (json.credits) setCredits(json.credits);
    if (json.creditHistory) setCreditHistory(json.creditHistory);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="azienda" onTabSelect={setSelectedTab} selectedTab={selectedTab} />
      <div className="flex-1 flex flex-col">
        <Header user={{ username: azienda.name, role: "azienda" }} onLogout={logout} />
        <div className="p-6">
          {selectedTab === "info" && <AziendaDetails azienda={azienda} />}
          {selectedTab === "users" && (
            <div className="grid grid-cols-3 gap-6">
              <div>
                <h2 className="font-bold mb-2">Creator</h2>
                <CreatorForm onCreate={handleCreateCreator} />
                <CreatorList creators={creators} />
              </div>
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
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h2 className="font-bold mb-2">Crea prodotto</h2>
                <ProductForm onCreate={handleCreateProduct} />
                <h2 className="font-bold mt-6 mb-2">Lista prodotti</h2>
                <ProductList products={products} />
              </div>
            </div>
          )}
          {selectedTab === "types" && (
            <div>
              <h2 className="font-bold mb-2">Tipi di prodotto</h2>
              <ProductTypeForm onCreate={handleCreateProductType} />
              <ProductTypeList types={productTypes} />
            </div>
          )}
          {selectedTab === "events" && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h2 className="font-bold mb-2">Aggiungi evento</h2>
                <EventForm productId={""} by={azienda.id} onCreate={handleCreateEvent} />
                <h2 className="font-bold mt-6 mb-2">Storico eventi</h2>
                <EventList events={events} />
              </div>
            </div>
          )}
          {selectedTab === "vc" && (
            <div>
              <h2 className="font-bold mb-2">Verifiable Credential</h2>
              <VCCreator onCreate={handleCreateVC} />
              <VCList vcs={vcs} />
            </div>
          )}
          {selectedTab === "credits" && (
            <div>
              <CreditsDashboard credits={credits} onBuyCredits={() => {}} />
              <UserCreditsHistory history={creditHistory} />
              <div className="my-4">
                <h3>Distribuisci crediti a Operatore/Macchinario:</h3>
                <select
                  onChange={e => {
                    const val = e.target.value;
                    const user = operatori.concat(macchinari).find(u => u.id === val);
                    setSelectedRecipient(user || null);
                  }}
                  className="border rounded px-2 py-1 mx-2"
                  value={selectedRecipient?.id || ""}
                >
                  <option value="">Seleziona utente</option>
                  {operatori.map(o => <option value={o.id} key={o.id}>{o.name} (operatore)</option>)}
                  {macchinari.map(m => <option value={m.id} key={m.id}>{m.name} (macchinario)</option>)}
                </select>
                <input
                  type="number"
                  min={1}
                  max={credits}
                  value={creditToSend}
                  onChange={e => setCreditToSend(Number(e.target.value))}
                  className="border mx-2 px-2"
                />
                <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={sendCredits}>
                  Assegna crediti
                </button>
              </div>
            </div>
          )}
          {selectedTab === "importexport" && (
            <div>
              <ImportExportBox label="azienda" onImport={handleImport} exportData={exportData} />
              <CopyJsonBox label="Export dati" json={exportData} />
            </div>
          )}
          {selectedTab === "seed" && (
            <SeedManager seed={azienda.seed} />
          )}
        </div>
      </div>
    </div>
  );
}
