import React, { useState, useEffect } from "react";
import { useUser } from "../../contexts/UserContext";
import { Actor } from "../../models/actor";
import { Product } from "../../models/product";
import { ProductType } from "../../models/productType";
import { Event } from "../../models/event";
import { VerifiableCredential } from "../../models/vc";
import ProductTypeForm from "../ProductTypes/ProductTypeForm";
import ProductTypeList from "../ProductTypes/ProductTypeList";
import ProductTypeDetails from "../ProductTypes/ProductTypeDetails";
import ProductBOMTree from "../ProductTypes/ProductBOMTree";
import ProductForm from "../Products/ProductForm";
import ProductList from "../Products/ProductList";
import ProductDetails from "../Products/ProductDetails";
import AssignmentManager from "../Actors/Creator/AssignmentManager";
import EventForm from "../Events/EventForm";
import EventList from "../Events/EventList";
import EventDetails from "../Events/EventDetails";
import VCCreator from "../VC/VCCreator";
import VCList from "../VC/VCList";
import VCViewer from "../VC/VCViewer";
import VCVerifier from "../VC/VCVerifier";
import Sidebar from "../Common/Sidebar";
import Header from "../Common/Header";

interface CreatorState {
  productTypes: ProductType[];
  products: Product[];
  events: Event[];
  vcs: VerifiableCredential[];
  assignments: any[];
}

export default function CreatorDashboard({ creator }: { creator: Actor }) {
  const { logout } = useUser();
  const [activeTab, setActiveTab] = useState<"tipi" | "prodotti" | "assegnazioni" | "eventi" | "vc">("tipi");

  // Stati per gestione tipi di prodotto
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [selectedProductType, setSelectedProductType] = useState<ProductType | null>(null);
  const [showProductTypeForm, setShowProductTypeForm] = useState(false);

  // Stati per gestione prodotti
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);

  // Stati per gestione assegnazioni
  const [assignments, setAssignments] = useState<any[]>([]);
  const [showAssignmentManager, setShowAssignmentManager] = useState(false);

  // Stati per gestione eventi
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);

  // Stati per gestione VC
  const [vcs, setVCs] = useState<VerifiableCredential[]>([]);
  const [selectedVC, setSelectedVC] = useState<VerifiableCredential | null>(null);
  const [showVCCreator, setShowVCCreator] = useState(false);

  // Carica dati creator
  useEffect(() => {
    const savedData = localStorage.getItem(`creator-${creator.id}-data`);
    if (savedData) {
      try {
        const data: CreatorState = JSON.parse(savedData);
        setProductTypes(data.productTypes || []);
        setProducts(data.products || []);
        setEvents(data.events || []);
        setVCs(data.vcs || []);
        setAssignments(data.assignments || []);
      } catch (error) {
        console.error('Errore nel caricamento dati creator:', error);
      }
    }
  }, [creator.id]);

  // Salva dati automaticamente
  useEffect(() => {
    const dataToSave: CreatorState = {
      productTypes,
      products,
      events,
      vcs,
      assignments
    };
    localStorage.setItem(`creator-${creator.id}-data`, JSON.stringify(dataToSave));
  }, [productTypes, products, events, vcs, assignments, creator.id]);

  // Gestione creazione tipo prodotto
  const handleCreateProductType = (productTypeData: Partial<ProductType>) => {
    const newProductType: ProductType = {
      id: Date.now().toString(),
      name: productTypeData.name || "",
      description: productTypeData.description || "",
      category: productTypeData.category || "",
      bomTree: productTypeData.bomTree || [],
      createdBy: creator.id,
      createdAt: new Date().toISOString(),
      version: "1.0"
    };
    
    setProductTypes(prev => [...prev, newProductType]);
    setShowProductTypeForm(false);
  };

  // Gestione creazione prodotto
  const handleCreateProduct = (productData: Partial<Product>) => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: productData.name || "",
      description: productData.description || "",
      productTypeId: productData.productTypeId || "",
      serialNumber: productData.serialNumber || `SN-${Date.now()}`,
      status: "created",
      createdBy: creator.id,
      createdAt: new Date().toISOString(),
      history: [{
        id: Date.now().toString(),
        action: "created",
        timestamp: new Date().toISOString(),
        by: creator.id,
        description: "Prodotto creato"
      }]
    };
    
    setProducts(prev => [...prev, newProduct]);
    setShowProductForm(false);
  };

  // Gestione creazione evento
  const handleCreateEvent = (eventData: Partial<Event>) => {
    const newEvent: Event = {
      id: Date.now().toString(),
      type: eventData.type || "info",
      title: eventData.title || "",
      description: eventData.description || "",
      productId: eventData.productId,
      createdBy: creator.id,
      timestamp: new Date().toISOString(),
      status: "active"
    };
    
    setEvents(prev => [...prev, newEvent]);
    setShowEventForm(false);
  };

  // Gestione creazione VC
  const handleCreateVC = (vcData: VerifiableCredential) => {
    const newVC: VerifiableCredential = {
      ...vcData,
      id: Date.now().toString(),
      issuer: creator.did || creator.id,
      issuanceDate: new Date().toISOString(),
      status: "active"
    };
    
    setVCs(prev => [...prev, newVC]);
    setShowVCCreator(false);
  };

  // Gestione assegnazione task
  const handleCreateAssignment = (assignmentData: any) => {
    const newAssignment = {
      id: Date.now().toString(),
      ...assignmentData,
      createdBy: creator.id,
      createdAt: new Date().toISOString(),
      status: "assigned"
    };
    
    setAssignments(prev => [...prev, newAssignment]);
    setShowAssignmentManager(false);
  };

  // Render tab tipi di prodotto
  const renderTipiTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestione Tipi di Prodotto</h2>
        <button
          onClick={() => setShowProductTypeForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Nuovo Tipo Prodotto
        </button>
      </div>

      {showProductTypeForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Nuovo Tipo di Prodotto</h3>
            <button
              onClick={() => setShowProductTypeForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <ProductTypeForm onCreate={handleCreateProductType} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Lista Tipi Prodotto ({productTypes.length})</h3>
          <ProductTypeList productTypes={productTypes} onSelect={setSelectedProductType} />
        </div>

        {selectedProductType && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Dettagli Tipo Prodotto</h3>
            <ProductTypeDetails productType={selectedProductType} />
          </div>
        )}
      </div>

      {selectedProductType && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">BOM Tree - {selectedProductType.name}</h3>
          <ProductBOMTree productType={selectedProductType} />
        </div>
      )}
    </div>
  );

  // Render tab prodotti
  const renderProdottiTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestione Prodotti</h2>
        <button
          onClick={() => setShowProductForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Nuovo Prodotto
        </button>
      </div>

      {showProductForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Nuovo Prodotto</h3>
            <button
              onClick={() => setShowProductForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <ProductForm 
            onCreate={handleCreateProduct}
            availableProductTypes={productTypes}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Lista Prodotti ({products.length})</h3>
          <ProductList products={products} onSelect={setSelectedProduct} />
        </div>

        {selectedProduct && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Dettagli Prodotto</h3>
            <ProductDetails product={selectedProduct} />
          </div>
        )}
      </div>
    </div>
  );

  // Render tab assegnazioni
  const renderAssegnazioniTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Assegnazione Task</h2>
        <button
          onClick={() => setShowAssignmentManager(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Nuova Assegnazione
        </button>
      </div>

      {showAssignmentManager && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Gestione Assegnazioni</h3>
            <button
              onClick={() => setShowAssignmentManager(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <AssignmentManager 
            productTypes={productTypes}
            products={products}
            onCreateAssignment={handleCreateAssignment}
          />
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Task Assegnati ({assignments.length})</h3>
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nessun task assegnato</p>
          ) : (
            assignments.map((assignment) => (
              <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{assignment.title || "Task"}</h4>
                    <p className="text-sm text-gray-600">{assignment.description}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      <span>Assegnato a: {assignment.assignedTo}</span>
                      <span className="ml-4">Tipo: {assignment.assignedType}</span>
                      <span className="ml-4">Data: {new Date(assignment.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    assignment.status === "assigned" ? "bg-yellow-100 text-yellow-800" :
                    assignment.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                    assignment.status === "completed" ? "bg-green-100 text-green-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {assignment.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  // Render tab eventi
  const renderEventiTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestione Eventi su Prodotti</h2>
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
            onCreate={handleCreateEvent}
            availableProducts={products}
            createdBy={creator.id}
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
    </div>
  );

  // Render tab VC
  const renderVCTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestione VC Prodotti</h2>
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
            onCreate={handleCreateVC}
            availableProducts={products}
            issuer={creator}
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

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="creator" />
      <div className="flex-1 flex flex-col">
        <Header 
          user={{ 
            username: creator.name, 
            role: "creator" 
          }} 
          onLogout={logout} 
        />
        
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Creator</h1>
            <p className="text-gray-600">{creator.name} - Progettazione e gestione prodotti</p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <nav className="flex space-x-8">
              {[
                { id: "tipi", label: "Tipi di Prodotto" },
                { id: "prodotti", label: "Prodotti" },
                { id: "assegnazioni", label: "Assegnazione Task" },
                { id: "eventi", label: "Eventi" },
                { id: "vc", label: "Verifiable Credentials" }
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
            {activeTab === "tipi" && renderTipiTab()}
            {activeTab === "prodotti" && renderProdottiTab()}
            {activeTab === "assegnazioni" && renderAssegnazioniTab()}
            {activeTab === "eventi" && renderEventiTab()}
            {activeTab === "vc" && renderVCTab()}
          </div>
        </div>
      </div>
    </div>
  );
}

