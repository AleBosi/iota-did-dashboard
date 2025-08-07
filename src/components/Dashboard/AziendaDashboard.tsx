import React, { useState, useEffect } from "react";
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
import CreatorDetails from "../Actors/Creator/CreatorDetails";
import OperatoreForm from "../Actors/Operatori/OperatoreForm";
import OperatoreList from "../Actors/Operatori/OperatoreList";
import OperatoreDetails from "../Actors/Operatori/OperatoreDetails";
import MacchinarioForm from "../Actors/Macchinari/MacchinarioForm";
import MacchinarioList from "../Actors/Macchinari/MacchinarioList";
import MacchinarioDetails from "../Actors/Macchinari/MacchinarioDetails";
import ProductForm from "../Products/ProductForm";
import ProductList from "../Products/ProductList";
import ProductDetails from "../Products/ProductDetails";
import ProductTypeList from "../ProductTypes/ProductTypeList";
import ProductTypeForm from "../ProductTypes/ProductTypeForm";
import ProductTypeDetails from "../ProductTypes/ProductTypeDetails";
import ProductBOMTree from "../ProductTypes/ProductBOMTree";
import EventForm from "../Events/EventForm";
import EventList from "../Events/EventList";
import EventDetails from "../Events/EventDetails";
import EventHistory from "../Events/EventHistory";
import VCList from "../VC/VCList";
import VCCreator from "../VC/VCCreator";
import VCViewer from "../VC/VCViewer";
import VCVerifier from "../VC/VCVerifier";
import CreditsDashboard from "../Credits/CreditsDashboard";
import UserCreditsHistory from "../Credits/UserCreditsHistory";
import ImportExportBox from "../Common/ImportExportBox";
import CopyJsonBox from "../Common/CopyJsonBox";
import SeedManager from "../Common/SeedManager";
import Sidebar from "../Common/Sidebar";
import Header from "../Common/Header";
import { generateSeed, generateDID } from "../../utils/cryptoUtils";

interface CreditTransaction {
  id: string;
  date: string;
  amount: number;
  type: "send" | "receive";
  description: string;
  recipientId?: string;
  recipientName?: string;
  recipientType?: "operatore" | "macchinario";
}

interface AziendaState {
  creators: Actor[];
  operatori: Actor[];
  macchinari: Actor[];
  products: Product[];
  productTypes: ProductType[];
  events: Event[];
  vcs: VerifiableCredential[];
  credits: number;
  creditHistory: CreditTransaction[];
}

export default function AziendaDashboard({ azienda }: { azienda: Azienda }) {
  const { logout } = useUser();
  const [activeTab, setActiveTab] = useState<"info" | "utenti" | "prodotti" | "eventi" | "vc" | "crediti" | "backup">("info");
  const [activeUserTab, setActiveUserTab] = useState<"creators" | "operatori" | "macchinari">("creators");
  const [activeProdTab, setActiveProdTab] = useState<"prodotti" | "tipi" | "bom">("prodotti");

  // Stati per gestione utenti
  const [creators, setCreators] = useState<Actor[]>([]);
  const [operatori, setOperatori] = useState<Actor[]>([]);
  const [macchinari, setMacchinari] = useState<Actor[]>([]);
  const [selectedUser, setSelectedUser] = useState<Actor | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);

  // Stati per gestione prodotti
  const [products, setProducts] = useState<Product[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductType, setSelectedProductType] = useState<ProductType | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showProductTypeForm, setShowProductTypeForm] = useState(false);

  // Stati per gestione eventi
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);

  // Stati per gestione VC
  const [vcs, setVCs] = useState<VerifiableCredential[]>([]);
  const [selectedVC, setSelectedVC] = useState<VerifiableCredential | null>(null);
  const [showVCCreator, setShowVCCreator] = useState(false);

  // Stati per gestione crediti
  const [credits, setCredits] = useState<number>(azienda.credits || 0);
  const [creditHistory, setCreditHistory] = useState<CreditTransaction[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<string>("");
  const [creditToSend, setCreditToSend] = useState<number>(0);

  // Carica dati aziendali
  useEffect(() => {
    const savedData = localStorage.getItem(`azienda-${azienda.id}-data`);
    if (savedData) {
      try {
        const data: AziendaState = JSON.parse(savedData);
        setCreators(data.creators || []);
        setOperatori(data.operatori || []);
        setMacchinari(data.macchinari || []);
        setProducts(data.products || []);
        setProductTypes(data.productTypes || []);
        setEvents(data.events || []);
        setVCs(data.vcs || []);
        setCredits(data.credits || azienda.credits || 0);
        setCreditHistory(data.creditHistory || []);
      } catch (error) {
        console.error('Errore nel caricamento dati azienda:', error);
      }
    }
  }, [azienda.id]);

  // Salva dati automaticamente
  useEffect(() => {
    const dataToSave: AziendaState = {
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
    localStorage.setItem(`azienda-${azienda.id}-data`, JSON.stringify(dataToSave));
  }, [creators, operatori, macchinari, products, productTypes, events, vcs, credits, creditHistory, azienda.id]);

  // Gestione creazione utenti
  const handleCreateUser = (userData: Partial<Actor>, type: "creator" | "operatore" | "macchinario") => {
    const newUser: Actor = {
      id: Date.now().toString(),
      name: userData.name || "",
      email: userData.email || "",
      role: type,
      seed: generateSeed(),
      did: generateDID(),
      credits: 0,
      createdAt: new Date().toISOString(),
      status: "active",
      aziendaId: azienda.id
    };

    if (type === "creator") {
      setCreators(prev => [...prev, newUser]);
    } else if (type === "operatore") {
      setOperatori(prev => [...prev, newUser]);
    } else if (type === "macchinario") {
      setMacchinari(prev => [...prev, newUser]);
    }

    setShowUserForm(false);
  };

  // Gestione invio crediti
  const handleSendCredits = () => {
    if (!selectedRecipient || creditToSend <= 0 || creditToSend > credits) {
      alert("Seleziona un destinatario e inserisci un importo valido");
      return;
    }

    const allRecipients = [...operatori, ...macchinari];
    const recipient = allRecipients.find(u => u.id === selectedRecipient);
    if (!recipient) return;

    // Aggiorna crediti azienda
    setCredits(prev => prev - creditToSend);

    // Aggiorna crediti destinatario
    if (recipient.role === "operatore") {
      setOperatori(prev => prev.map(o => 
        o.id === selectedRecipient 
          ? { ...o, credits: (o.credits || 0) + creditToSend }
          : o
      ));
    } else if (recipient.role === "macchinario") {
      setMacchinari(prev => prev.map(m => 
        m.id === selectedRecipient 
          ? { ...m, credits: (m.credits || 0) + creditToSend }
          : m
      ));
    }

    // Aggiungi transazione
    const transaction: CreditTransaction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      amount: creditToSend,
      type: "send",
      description: `Crediti inviati a ${recipient.name}`,
      recipientId: recipient.id,
      recipientName: recipient.name,
      recipientType: recipient.role as "operatore" | "macchinario"
    };
    setCreditHistory(prev => [...prev, transaction]);

    // Reset form
    setCreditToSend(0);
    setSelectedRecipient("");
  };

  // Gestione export dati aziendali
  const handleExportData = () => {
    const exportData: AziendaState = {
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
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `azienda-${azienda.name}-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Render tab info azienda
  const renderInfoTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Informazioni Azienda</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <AziendaDetails azienda={azienda} />
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Gestione Seed Aziendale</h3>
        <SeedManager seed={azienda.seed} did={azienda.did} />
      </div>
    </div>
  );

  // Render tab utenti
  const renderUtentiTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestione Utenti</h2>
        <button
          onClick={() => setShowUserForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Crea Nuovo Utente
        </button>
      </div>

      {/* Sub-tabs per tipi di utenti */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: "creators", label: `Creator (${creators.length})` },
            { id: "operatori", label: `Operatori (${operatori.length})` },
            { id: "macchinari", label: `Macchinari (${macchinari.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveUserTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeUserTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {showUserForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Nuovo {activeUserTab}</h3>
            <button
              onClick={() => setShowUserForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          {activeUserTab === "creators" && (
            <CreatorForm onCreate={(data) => handleCreateUser(data, "creator")} />
          )}
          {activeUserTab === "operatori" && (
            <OperatoreForm onCreate={(data) => handleCreateUser(data, "operatore")} />
          )}
          {activeUserTab === "macchinari" && (
            <MacchinarioForm onCreate={(data) => handleCreateUser(data, "macchinario")} />
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Lista {activeUserTab}</h3>
          {activeUserTab === "creators" && (
            <CreatorList creators={creators} onSelect={setSelectedUser} />
          )}
          {activeUserTab === "operatori" && (
            <OperatoreList operatori={operatori} onSelect={setSelectedUser} />
          )}
          {activeUserTab === "macchinari" && (
            <MacchinarioList macchinari={macchinari} onSelect={setSelectedUser} />
          )}
        </div>

        {selectedUser && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Dettagli {selectedUser.role}</h3>
            {selectedUser.role === "creator" && (
              <CreatorDetails creator={selectedUser} />
            )}
            {selectedUser.role === "operatore" && (
              <OperatoreDetails operatore={selectedUser} />
            )}
            {selectedUser.role === "macchinario" && (
              <MacchinarioDetails macchinario={selectedUser} />
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Render tab prodotti
  const renderProdottiTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestione Prodotti</h2>
        <div className="space-x-2">
          <button
            onClick={() => setShowProductForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Nuovo Prodotto
          </button>
          <button
            onClick={() => setShowProductTypeForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Nuovo Tipo
          </button>
        </div>
      </div>

      {/* Sub-tabs per prodotti */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: "prodotti", label: `Prodotti (${products.length})` },
            { id: "tipi", label: `Tipi Prodotto (${productTypes.length})` },
            { id: "bom", label: "BOM Tree" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveProdTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeProdTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {(showProductForm || showProductTypeForm) && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {showProductForm ? "Nuovo Prodotto" : "Nuovo Tipo Prodotto"}
            </h3>
            <button
              onClick={() => {
                setShowProductForm(false);
                setShowProductTypeForm(false);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          {showProductForm && (
            <ProductForm 
              onCreate={(product) => {
                setProducts(prev => [...prev, { ...product, id: Date.now().toString() }]);
                setShowProductForm(false);
              }} 
            />
          )}
          {showProductTypeForm && (
            <ProductTypeForm 
              onCreate={(productType) => {
                setProductTypes(prev => [...prev, { ...productType, id: Date.now().toString() }]);
                setShowProductTypeForm(false);
              }} 
            />
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">
            {activeProdTab === "prodotti" ? "Lista Prodotti" : 
             activeProdTab === "tipi" ? "Lista Tipi Prodotto" : "BOM Tree"}
          </h3>
          {activeProdTab === "prodotti" && (
            <ProductList products={products} onSelect={setSelectedProduct} />
          )}
          {activeProdTab === "tipi" && (
            <ProductTypeList productTypes={productTypes} onSelect={setSelectedProductType} />
          )}
          {activeProdTab === "bom" && selectedProductType && (
            <ProductBOMTree productType={selectedProductType} />
          )}
        </div>

        {((activeProdTab === "prodotti" && selectedProduct) || 
          (activeProdTab === "tipi" && selectedProductType)) && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Dettagli</h3>
            {activeProdTab === "prodotti" && selectedProduct && (
              <ProductDetails product={selectedProduct} />
            )}
            {activeProdTab === "tipi" && selectedProductType && (
              <ProductTypeDetails productType={selectedProductType} />
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Render tab eventi
  const renderEventiTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestione Eventi</h2>
        <button
          onClick={() => setShowEventForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Nuovo Evento
        </button>
      </div>

      {showEventForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Nuovo Evento</h3>
            <button
              onClick={() => setShowEventForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <EventForm 
            onCreate={(event) => {
              setEvents(prev => [...prev, { ...event, id: Date.now().toString() }]);
              setShowEventForm(false);
            }} 
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Lista Eventi ({events.length})</h3>
          <EventList events={events} onSelect={setSelectedEvent} />
        </div>

        {selectedEvent && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Dettagli Evento</h3>
            <EventDetails event={selectedEvent} />
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Storico Eventi</h3>
        <EventHistory events={events} />
      </div>
    </div>
  );

  // Render tab VC
  const renderVCTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestione Verifiable Credentials</h2>
        <button
          onClick={() => setShowVCCreator(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Crea VC
        </button>
      </div>

      {showVCCreator && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Crea Verifiable Credential</h3>
            <button
              onClick={() => setShowVCCreator(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <VCCreator 
            onCreate={(vc) => {
              setVCs(prev => [...prev, vc]);
              setShowVCCreator(false);
            }} 
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Lista VC ({vcs.length})</h3>
          <VCList vcs={vcs} onSelect={setSelectedVC} />
        </div>

        {selectedVC && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Dettagli VC</h3>
            <VCViewer vc={selectedVC} />
            <div className="mt-4">
              <VCVerifier vc={selectedVC} />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render tab crediti
  const renderCreditiTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Gestione Crediti Aziendali</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Saldo Aziendale</h3>
        <CreditsDashboard credits={credits} onBuyCredits={() => {}} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Assegna Crediti</h3>
        <div className="flex items-center gap-4 mb-4">
          <select
            value={selectedRecipient}
            onChange={(e) => setSelectedRecipient(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-lg flex-1"
          >
            <option value="">Seleziona destinatario</option>
            <optgroup label="Operatori">
              {operatori.map(o => (
                <option key={o.id} value={o.id}>
                  {o.name} (Crediti: {o.credits || 0})
                </option>
              ))}
            </optgroup>
            <optgroup label="Macchinari">
              {macchinari.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} (Crediti: {m.credits || 0})
                </option>
              ))}
            </optgroup>
          </select>
          <input
            type="number"
            value={creditToSend}
            onChange={(e) => setCreditToSend(Number(e.target.value))}
            placeholder="Crediti da inviare"
            className="border border-gray-300 px-3 py-2 rounded-lg"
            min="1"
            max={credits}
          />
          <button
            onClick={handleSendCredits}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            disabled={!selectedRecipient || creditToSend <= 0}
          >
            Invia
          </button>
        </div>
        <p className="text-sm text-gray-600">
          Nota: I crediti possono essere assegnati solo a operatori e macchinari, non ai creator.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Storico Movimenti</h3>
        <UserCreditsHistory history={creditHistory} />
      </div>
    </div>
  );

  // Render tab backup
  const renderBackupTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Backup e Restore Aziendale</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Export/Import Dati Aziendali</h3>
        
        <div className="space-y-4">
          <div>
            <button
              onClick={handleExportData}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 mr-4"
            >
              Esporta Dati Azienda
            </button>
            <span className="text-sm text-gray-600">
              Esporta utenti, prodotti, eventi e VC aziendali
            </span>
          </div>

          <ImportExportBox 
            label="Importa Backup Aziendale" 
            onImport={(data) => {
              if (data.creators) setCreators(data.creators);
              if (data.operatori) setOperatori(data.operatori);
              if (data.macchinari) setMacchinari(data.macchinari);
              if (data.products) setProducts(data.products);
              if (data.productTypes) setProductTypes(data.productTypes);
              if (data.events) setEvents(data.events);
              if (data.vcs) setVCs(data.vcs);
              if (data.creditHistory) setCreditHistory(data.creditHistory);
              alert("Dati aziendali importati con successo!");
            }} 
            exportData={{
              creators,
              operatori,
              macchinari,
              products,
              productTypes,
              events,
              vcs,
              credits,
              creditHistory
            }} 
          />

          <CopyJsonBox 
            label="Visualizza Riepilogo Dati" 
            json={{
              azienda: azienda.name,
              creators: creators.length,
              operatori: operatori.length,
              macchinari: macchinari.length,
              products: products.length,
              productTypes: productTypes.length,
              events: events.length,
              vcs: vcs.length,
              credits,
              lastUpdate: new Date().toISOString()
            }} 
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="azienda" />
      <div className="flex-1 flex flex-col">
        <Header 
          user={{ 
            username: azienda.name, 
            role: "azienda" 
          }} 
          onLogout={logout} 
        />
        
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Azienda</h1>
            <p className="text-gray-600">{azienda.name} - Gestione completa aziendale</p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <nav className="flex space-x-8">
              {[
                { id: "info", label: "Info Azienda" },
                { id: "utenti", label: "Gestione Utenti" },
                { id: "prodotti", label: "Prodotti & BOM" },
                { id: "eventi", label: "Eventi" },
                { id: "vc", label: "Verifiable Credentials" },
                { id: "crediti", label: "Crediti" },
                { id: "backup", label: "Backup" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1">
            {activeTab === "info" && renderInfoTab()}
            {activeTab === "utenti" && renderUtentiTab()}
            {activeTab === "prodotti" && renderProdottiTab()}
            {activeTab === "eventi" && renderEventiTab()}
            {activeTab === "vc" && renderVCTab()}
            {activeTab === "crediti" && renderCreditiTab()}
            {activeTab === "backup" && renderBackupTab()}
          </div>
        </div>
      </div>
    </div>
  );
}

